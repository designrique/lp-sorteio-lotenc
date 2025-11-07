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
        // Remover máscara do CPF (deixar apenas números) para salvar no NocoDB
        const cpfSemMascara = String(cpf.replace(/\D/g, ''))
        
        // Garantir que o CPF tenha 11 dígitos (adicionar zero à esquerda se necessário)
        // Isso preserva zeros à esquerda que podem ser perdidos
        const cpfFormatado = cpfSemMascara.padStart(11, '0')
        
        // CPF sem zeros à esquerda (para compatibilidade com dados antigos salvos como número)
        const cpfSemZeros = cpfSemMascara
        
        // Verificar se CPF já existe no banco de dados
        const nocodbApiUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`
        
        // Tentar buscar primeiro com CPF formatado (com zeros) - para dados novos salvos como texto
        let checkCpfUrl = `${nocodbApiUrl}?where=(cpf,eq,"${cpfFormatado}")`
        
        console.log('Verificando se CPF já existe (formato com zeros):', cpfFormatado)
        console.log('URL de verificação:', checkCpfUrl)
        
        let checkCpfResponse = await fetch(checkCpfUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
        })
        
        let existingData = null
        
        if (checkCpfResponse.ok) {
          existingData = await checkCpfResponse.json()
        }
        
        // Se não encontrou com zeros, tentar sem zeros (para dados antigos salvos como número)
        if (!existingData || !existingData.list || existingData.list.length === 0) {
          console.log('Não encontrado com zeros, tentando sem zeros (compatibilidade com dados antigos):', cpfSemZeros)
          checkCpfUrl = `${nocodbApiUrl}?where=(cpf,eq,"${cpfSemZeros}")`
          
          checkCpfResponse = await fetch(checkCpfUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'xc-token': nocodbToken,
            },
          })
          
          if (checkCpfResponse.ok) {
            existingData = await checkCpfResponse.json()
          } else {
            console.warn('Erro ao verificar CPF existente, continuando com cadastro')
          }
        }
        
        // Se encontrar registros com o mesmo CPF, retornar erro
        if (existingData && existingData.list && existingData.list.length > 0) {
          console.log('CPF já cadastrado:', cpfFormatado)
          console.log('Registros encontrados:', existingData.list.length)
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              error: 'CPF já cadastrado',
              message: 'Este CPF já está cadastrado em nosso sistema. Não é possível realizar mais de um cadastro com o mesmo CPF. Se você já se cadastrou anteriormente, utilize o mesmo CPF para verificar seu número da sorte.',
            }),
          }
        }
        
        const dataToSave = {
          "usuario": name,
          "whatsapp": whatsapp,
          "email": email,
          "cpf": cpfFormatado, // Garantir que seja string com zeros à esquerda preservados
          "numero_sorte": luckyNumber,
          "criado_em": new Date().toISOString(),
        }
        
        console.log('Tentando salvar no NocoDB:', dataToSave)
        
        console.log('URL da API NocoDB:', nocodbApiUrl)
        
        const nocodbResponse = await fetch(nocodbApiUrl, {
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

          // Enviar dados para N8N via webhook
          const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
          if (n8nWebhookUrl) {
            try {
              const n8nPayload = {
                nome: name,
                whatsapp: whatsapp,
                email: email,
                numero_sorte: luckyNumber.toString().padStart(4, '0'),
              }

              console.log('Enviando dados para N8N:', n8nPayload)

              // Criar AbortController para timeout de 10 segundos
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 10000)

              const n8nResponse = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(n8nPayload),
                signal: controller.signal,
              })

              clearTimeout(timeoutId)

              if (n8nResponse.ok) {
                console.log('Mensagem enviada para N8N com sucesso')
              } else {
                const n8nErrorText = await n8nResponse.text()
                console.error('Erro ao enviar para N8N - Status:', n8nResponse.status, 'Resposta:', n8nErrorText)
              }
            } catch (n8nError) {
              if (n8nError.name === 'AbortError') {
                console.error('Timeout ao enviar para N8N (10 segundos)')
              } else {
                console.error('Erro ao enviar para N8N:', n8nError.message)
              }
              // Não bloqueia o cadastro se N8N falhar
            }
          } else {
            console.log('N8N_WEBHOOK_URL não configurado - pulando envio para N8N')
          }
        } else {
          const errorText = await nocodbResponse.text()
          console.error('Erro ao salvar no NocoDB - Status:', nocodbResponse.status)
          console.error('Erro ao salvar no NocoDB - Resposta:', errorText)
          console.error('URL utilizada:', `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/${nocodbTable}`)
          console.error('Payload enviado:', JSON.stringify(dataToSave))
          
          // Retornar erro se NocoDB falhar
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: 'Erro ao salvar no banco de dados',
              message: 'Não foi possível salvar seus dados. Por favor, tente novamente.',
              details: nocodbResponse.status === 401 ? 'Token inválido ou sem permissão' : 
                       nocodbResponse.status === 404 ? 'Projeto ou tabela não encontrado' :
                       'Erro desconhecido'
            }),
          }
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