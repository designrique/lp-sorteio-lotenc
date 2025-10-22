import { handler } from '@netlify/functions'

export default handler(async (event, context) => {
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
    // Parse do body
    const data = JSON.parse(event.body)
    const { name, whatsapp, email } = data

    // Validar dados obrigatórios
    if (!name || !whatsapp || !email) {
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

    if (!nocodbBaseUrl || !nocodbToken) {
      console.error('Variáveis de ambiente do NocoDB não configuradas')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuração do banco de dados não encontrada',
          message: 'Contate o administrador'
        }),
      }
    }

    // Função para verificar se número já existe
    const checkDuplicateNumber = async (number) => {
      try {
        const checkResponse = await fetch(`${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}?where=(numero_sorte,eq,${number})`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
        })
        
        if (checkResponse.ok) {
          const existingData = await checkResponse.json()
          return existingData.list && existingData.list.length > 0
        }
        return false
      } catch (error) {
        console.error('Erro ao verificar número duplicado:', error)
        return false
      }
    }

    // Gerar número da sorte único
    let luckyNumber
    let isDuplicate = true
    let attempts = 0
    const maxAttempts = 10

    do {
      luckyNumber = Math.floor(Math.random() * 10000) + 1
      isDuplicate = await checkDuplicateNumber(luckyNumber)
      attempts++
      
      if (attempts >= maxAttempts) {
        console.warn('Muitas tentativas de gerar número único, usando timestamp')
        luckyNumber = Date.now() % 10000
        break
      }
    } while (isDuplicate)

    console.log(`Número da sorte gerado após ${attempts} tentativa(s):`, luckyNumber)

    try {
      // Dados para salvar no NocoDB
      const dataToSave = {
        "usuario": name,
        "whatsapp": whatsapp,
        "email": email,
        "numero_sorte": luckyNumber,
        "criado_em": new Date().toISOString(),
      }
      
      // Log dos dados recebidos do formulário
      console.log('Dados recebidos do formulário:', { name, whatsapp, email })
      console.log('Número da sorte gerado:', luckyNumber)
      
      console.log('Dados a serem salvos no NocoDB:', dataToSave)
      console.log('URL do NocoDB:', `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`)
      
      const nocodbResponse = await fetch(`${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
        body: JSON.stringify(dataToSave),
      })

      if (!nocodbResponse.ok) {
        const errorText = await nocodbResponse.text()
        console.error('Erro ao salvar no NocoDB:', errorText)
        throw new Error(`Erro ao salvar no banco de dados: ${nocodbResponse.status}`)
      }

      const savedData = await nocodbResponse.json()
      console.log('Lead salvo no NocoDB:', savedData)
      console.log('Status da resposta:', nocodbResponse.status)
      console.log('Headers da resposta:', nocodbResponse.headers)
      
    } catch (nocodbError) {
      console.error('Erro na integração com NocoDB:', nocodbError)
      // Continuar mesmo com erro no banco (não falhar o cadastro)
      console.log('Lead cadastrado (sem salvamento no banco):', { name, whatsapp, email, luckyNumber })
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
})