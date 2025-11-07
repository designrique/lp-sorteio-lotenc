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
    const cpfFormatado = cpfSemMascara.padStart(11, '0')
    
    // CPF sem zeros à esquerda (para compatibilidade com dados antigos salvos como número)
    const cpfSemZeros = cpfSemMascara

    // Consultar CPF no NocoDB
    const nocodbApiUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`
    
    // Tentar múltiplas formas de busca para garantir compatibilidade
    const searchVariants = [
      cpfFormatado,           // Com zeros (ex: "01234567890")
      cpfSemZeros,            // Sem zeros (ex: "1234567890")
      String(parseInt(cpfSemZeros)), // Como número convertido para string (remove zeros)
    ]
    
    let existingData = null
    let foundRecord = null
    
    // Tentar cada variante de busca
    for (const cpfVariant of searchVariants) {
      // Tentar com aspas (para campos texto)
      let checkCpfUrl = `${nocodbApiUrl}?where=(cpf,eq,"${cpfVariant}")`
      console.log(`Tentando buscar CPF: "${cpfVariant}"`)
      
      let checkCpfResponse = await fetch(checkCpfUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (checkCpfResponse.ok) {
        const data = await checkCpfResponse.json()
        if (data.list && data.list.length > 0) {
          existingData = data
          foundRecord = data.list[0]
          console.log(`CPF encontrado com variante: "${cpfVariant}"`)
          break
        }
      }
      
      // Tentar sem aspas (para campos numéricos ou compatibilidade)
      checkCpfUrl = `${nocodbApiUrl}?where=(cpf,eq,${cpfVariant})`
      console.log(`Tentando buscar CPF sem aspas: ${cpfVariant}`)
      
      checkCpfResponse = await fetch(checkCpfUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (checkCpfResponse.ok) {
        const data = await checkCpfResponse.json()
        if (data.list && data.list.length > 0) {
          existingData = data
          foundRecord = data.list[0]
          console.log(`CPF encontrado sem aspas com variante: ${cpfVariant}`)
          break
        }
      }
    }
    
    // Se ainda não encontrou, tentar buscar todos e filtrar manualmente (último recurso)
    if (!foundRecord) {
      console.log('Tentando busca ampla e filtro manual...')
      const allRecordsUrl = `${nocodbApiUrl}?limit=1000`
      const allRecordsResponse = await fetch(allRecordsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })
      
      if (allRecordsResponse.ok) {
        const allData = await allRecordsResponse.json()
        if (allData.list && allData.list.length > 0) {
          // Normalizar CPFs para comparação
          foundRecord = allData.list.find(record => {
            const recordCpf = String(record.cpf || '').replace(/\D/g, '').padStart(11, '0')
            const searchCpf = cpfFormatado
            return recordCpf === searchCpf || recordCpf === cpfSemZeros
          })
          
          if (foundRecord) {
            console.log('CPF encontrado através de busca ampla')
            existingData = { list: [foundRecord] }
          }
        }
      }
    }

    // Se encontrar registros com o mesmo CPF, retornar número da sorte
    if (foundRecord || (existingData && existingData.list && existingData.list.length > 0)) {
      const registro = foundRecord || (existingData && existingData.list[0])
      const numeroSorte = registro.numero_sorte || registro['numero_sorte']
      
      console.log('Número da sorte encontrado:', numeroSorte)
      console.log('Registro encontrado:', JSON.stringify(registro))

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

