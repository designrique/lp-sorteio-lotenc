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
    console.log('Função check-lucky-number executada')
    
    // Parse do body
    const data = JSON.parse(event.body)
    const { cpf } = data

    console.log('CPF recebido para consulta:', cpf)

    // Validar CPF obrigatório
    if (!cpf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'CPF é obrigatório' }),
      }
    }

    // Configurações do NocoDB
    const nocodbBaseUrl = process.env.NOCODB_BASE_URL
    const nocodbToken = process.env.NOCODB_TOKEN
    const nocodbProject = process.env.NOCODB_PROJECT || 'default'
    const nocodbTable = process.env.NOCODB_TABLE || 'leads'

    if (!nocodbBaseUrl || !nocodbToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuração do banco de dados não encontrada' }),
      }
    }

    // Remover máscara do CPF (deixar apenas números)
    const cpfSemMascara = String(cpf.replace(/\D/g, ''))
    
    // Garantir que o CPF tenha 11 dígitos (adicionar zero à esquerda se necessário)
    // Isso preserva zeros à esquerda que podem ser perdidos
    const cpfFormatado = cpfSemMascara.padStart(11, '0')

    // Consultar CPF no NocoDB
    const nocodbApiUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`
    // Usar aspas na query para garantir que seja tratado como string pelo NocoDB
    const checkCpfUrl = `${nocodbApiUrl}?where=(cpf,eq,"${cpfFormatado}")`

    console.log('Consultando CPF no NocoDB:', cpfFormatado)

    const checkCpfResponse = await fetch(checkCpfUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'xc-token': nocodbToken,
      },
    })

    if (!checkCpfResponse.ok) {
      console.error('Erro ao consultar NocoDB:', checkCpfResponse.status)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao consultar banco de dados' }),
      }
    }

    const existingData = await checkCpfResponse.json()

    // Se encontrar registros com o mesmo CPF, retornar número da sorte
    if (existingData.list && existingData.list.length > 0) {
      const registro = existingData.list[0]
      const numeroSorte = registro.numero_sorte || registro['numero_sorte']
      
      console.log('Número da sorte encontrado:', numeroSorte)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          numero_sorte: numeroSorte ? numeroSorte.toString().padStart(4, '0') : null,
          message: 'Número da sorte encontrado',
        }),
      }
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'CPF não encontrado',
          message: 'Não encontramos nenhum cadastro com este CPF. Por favor, realize seu cadastro primeiro.',
        }),
      }
    }
  } catch (error) {
    console.error('Erro ao processar consulta:', error)
    
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

