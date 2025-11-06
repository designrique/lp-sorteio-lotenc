exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // Verificar se é POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    console.log('Função add-lead executada')
    
    // Parse do body
    const data = JSON.parse(event.body)
    const { name, whatsapp, email, cpf } = data

    console.log('Dados recebidos:', { name, whatsapp, email, cpf })

    // Validar dados obrigatórios
    if (!name || !whatsapp || !email || !cpf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
      }
    }

    // Configurações do NocoDB
    const nocodbBaseUrl = process.env.NOCODB_BASE_URL
    const nocodbToken = process.env.NOCODB_TOKEN
    const nocodbProject = process.env.NOCODB_PROJECT || 'default'
    const nocodbTable = process.env.NOCODB_TABLE || 'leads'

    console.log('Configurações NocoDB:', {
      baseUrl: nocodbBaseUrl ? 'Configurado' : 'Não configurado',
      token: nocodbToken ? 'Configurado' : 'Não configurado',
      project: nocodbProject,
      table: nocodbTable
    })

    // Gerar número da sorte
    const luckyNumber = Math.floor(Math.random() * 10000) + 1

    console.log('Número da sorte gerado:', luckyNumber)

    // Tentar salvar no NocoDB se configurado
    if (nocodbBaseUrl && nocodbToken) {
      try {
        const dataToSave = {
          "usuario": name,
          "whatsapp": whatsapp,
          "email": email,
          "cpf": cpf,
          "numero_sorte": luckyNumber,
          "criado_em": new Date().toISOString(),
        }
        
        console.log('Tentando salvar no NocoDB:', dataToSave)
        
        const nocodbResponse = await fetch(`${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
          body: JSON.stringify(dataToSave),
        })

        console.log('Status da resposta NocoDB:', nocodbResponse.status)

        if (nocodbResponse.ok) {
          const savedData = await nocodbResponse.json()
          console.log('Dados salvos no NocoDB:', savedData)
        } else {
          const errorText = await nocodbResponse.text()
          console.error('Erro ao salvar no NocoDB:', errorText)
        }
      } catch (nocodbError) {
        console.error('Erro na integração com NocoDB:', nocodbError)
      }
    } else {
      console.log('NocoDB não configurado - salvando apenas em memória')
    }

    // Resposta de sucesso
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        NumeroDaSorte: luckyNumber.toString().padStart(4, '0'),
        message: 'Cadastro realizado com sucesso!',
      }),
    }
  } catch (error) {
    console.error('Erro ao processar lead:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: 'Tente novamente mais tarde'
      }),
    }
  }
}