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

    // URLs das APIs
    const participantesUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/participantes`
    const numerosUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/numeros_sorte`

    // Buscar participante
    const searchVariants = [
      cpfFormatado,
      cpfFormatado.replace(/^0+/, ''), // Sem zeros à esquerda
    ]
    
    let participante = null
    
    for (const cpfVariant of searchVariants) {
      const checkUrl = `${participantesUrl}?where=(cpf,eq,"${cpfVariant}")`
      console.log(`Tentando buscar participante com CPF: "${cpfVariant}"`)
      
      try {
        const response = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.list && data.list.length > 0) {
            participante = data.list[0]
            console.log(`Participante encontrado com variante: "${cpfVariant}"`)
            break
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar participante com CPF ${cpfVariant}:`, error)
      }
    }

    // Se não encontrou participante, tentar busca ampla (fallback)
    if (!participante) {
      console.log('Tentando busca ampla de participantes...')
      try {
        const allRecordsUrl = `${participantesUrl}?limit=1000`
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
            participante = allData.list.find(record => {
              const recordCpf = String(record.cpf || '').replace(/\D/g, '').padStart(11, '0')
              return recordCpf === cpfFormatado
            })
            
            if (participante) {
              console.log('Participante encontrado através de busca ampla')
            }
          }
        }
      } catch (error) {
        console.error('Erro na busca ampla:', error)
      }
    }

    // Buscar todos os números da sorte do participante
    let numerosSorte = []
    
    if (participante) {
      // Buscar números usando CPF
      const numerosCheckUrl = `${numerosUrl}?where=(cpf,eq,"${cpfFormatado}")&sort=bolao_sequencia`
      
      try {
        const numerosResponse = await fetch(numerosCheckUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
        })

        if (numerosResponse.ok) {
          const numerosData = await numerosResponse.json()
          if (numerosData.list && numerosData.list.length > 0) {
            numerosSorte = numerosData.list.map(record => {
              const numeroFormatado = record.numero_formatado || 
                                     record.numero_sorte?.toString().padStart(4, '0') ||
                                     String(record.numero_sorte || '').padStart(4, '0')
              return {
                numero: numeroFormatado,
                sequencia: record.bolao_sequencia || record.bolao_sequencia || null,
                origem: record.origem || 'landing_page',
                status: record.status || 'ativo',
                criado_em: record.criado_em || null,
              }
            })
            console.log(`${numerosSorte.length} número(s) da sorte encontrado(s)`)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar números da sorte:', error)
      }
    }

    // Se encontrou participante ou números, retornar sucesso
    if (participante || numerosSorte.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          participante: participante ? {
            nome: participante.usuario || participante.usuario,
            email: participante.email,
            whatsapp: participante.whatsapp,
            total_boloes: participante.total_boloes || participante.total_boloes || 0,
          } : null,
          numeros_sorte: numerosSorte.map(n => n.numero),
          numeros_detalhados: numerosSorte,
          total_numeros: numerosSorte.length,
          message: numerosSorte.length > 0 
            ? `${numerosSorte.length} número(s) da sorte encontrado(s)`
            : 'Participante encontrado, mas nenhum número da sorte cadastrado',
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
