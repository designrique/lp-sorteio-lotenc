/**
 * Função para gerar números da sorte únicos
 * @param {number} quantidade - Quantidade de números a gerar
 * @param {string} cpf - CPF do participante (para logging)
 * @param {number[]} numerosExistentes - Array de números já existentes para evitar duplicatas
 * @returns {number[]} Array de números únicos gerados
 */
function gerarNumerosUnicos(quantidade, cpf, numerosExistentes = []) {
  const numerosGerados = []
  const maxTentativas = quantidade * 100 // Limite de tentativas para evitar loop infinito
  let tentativas = 0

  while (numerosGerados.length < quantidade && tentativas < maxTentativas) {
    const numero = Math.floor(Math.random() * 10000) + 1
    
    // Verificar se o número já foi gerado nesta execução
    if (!numerosGerados.includes(numero)) {
      // Verificar se o número já existe no banco (para este CPF)
      if (!numerosExistentes.includes(numero)) {
        numerosGerados.push(numero)
      }
    }
    
    tentativas++
  }

  if (numerosGerados.length < quantidade) {
    console.warn(`Aviso: Apenas ${numerosGerados.length} de ${quantidade} números únicos foram gerados para CPF ${cpf}`)
  }

  return numerosGerados
}

/**
 * Buscar participante por CPF
 */
async function buscarParticipante(nocodbBaseUrl, nocodbToken, nocodbProject, cpfFormatado) {
  const participantesUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/participantes`
  
  // Tentar múltiplas formas de busca
  const searchVariants = [
    cpfFormatado,
    cpfFormatado.replace(/^0+/, ''), // Sem zeros à esquerda
  ]

  for (const cpfVariant of searchVariants) {
    const checkUrl = `${participantesUrl}?where=(cpf,eq,"${cpfVariant}")`
    
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
          return data.list[0]
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar CPF ${cpfVariant}:`, error)
    }
  }

  return null
}

/**
 * Buscar números da sorte existentes de um participante
 */
async function buscarNumerosExistentes(nocodbBaseUrl, nocodbToken, nocodbProject, cpfFormatado) {
  const numerosUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/numeros_sorte`
  const checkUrl = `${numerosUrl}?where=(cpf,eq,"${cpfFormatado}")`
  
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
        return data.list.map(record => record.numero_sorte || record.numero_formatado)
      }
    }
  } catch (error) {
    console.error('Erro ao buscar números existentes:', error)
  }

  return []
}

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
    const { name, whatsapp, email, cpf, quantidade_boloes } = data

    console.log('Dados recebidos:', { name, whatsapp, email, cpf, quantidade_boloes })

    // Validar dados obrigatórios
    if (!name || !whatsapp || !email || !cpf) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
      }
    }

    // Validar e normalizar quantidade_boloes
    const quantidade = Math.max(1, Math.min(100, parseInt(quantidade_boloes) || 1))
    
    if (isNaN(quantidade) || quantidade < 1 || quantidade > 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Quantidade de bolões deve ser entre 1 e 100' }),
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

    // Normalizar CPF
    const cpfSemMascara = String(cpf.replace(/\D/g, ''))
    const cpfFormatado = cpfSemMascara.padStart(11, '0')

    const timestamp = new Date().toISOString()
    const participantesUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/participantes`
    const numerosUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/numeros_sorte`

    // Buscar participante existente
    const participanteExistente = await buscarParticipante(
      nocodbBaseUrl,
      nocodbToken,
      nocodbProject,
      cpfFormatado
    )

    let participanteId
    let ehPrimeiraCompra = false
    let totalBoloes = quantidade

    if (participanteExistente) {
      // Participante já existe - atualizar
      participanteId = participanteExistente.id || participanteExistente.Id
      totalBoloes = (participanteExistente.total_boloes || participanteExistente.total_boloes || 0) + quantidade

      console.log(`Participante existente encontrado (ID: ${participanteId}). Total de bolões será: ${totalBoloes}`)

      // Atualizar participante
      const updateUrl = `${participantesUrl}/${participanteId}`
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
        body: JSON.stringify({
          total_boloes: totalBoloes,
          atualizado_em: timestamp,
        }),
      })
    } else {
      // Criar novo participante
      ehPrimeiraCompra = true
      console.log('Criando novo participante')

      const participanteData = {
        usuario: name,
        whatsapp: whatsapp,
        email: email,
        cpf: cpfFormatado,
        total_boloes: quantidade,
        criado_em: timestamp,
        atualizado_em: timestamp,
      }

      const createResponse = await fetch(participantesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
        body: JSON.stringify(participanteData),
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        console.error('Erro ao criar participante:', errorText)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Erro ao criar participante',
            message: 'Não foi possível criar seu cadastro. Por favor, tente novamente.',
          }),
        }
      }

      const participanteCriado = await createResponse.json()
      participanteId = participanteCriado.id || participanteCriado.Id
      console.log(`Participante criado com ID: ${participanteId}`)
    }

    // Buscar números existentes do participante
    const numerosExistentes = await buscarNumerosExistentes(
      nocodbBaseUrl,
      nocodbToken,
      nocodbProject,
      cpfFormatado
    )

    console.log(`Números existentes encontrados: ${numerosExistentes.length}`)

    // Gerar novos números únicos
    const novosNumeros = gerarNumerosUnicos(quantidade, cpfFormatado, numerosExistentes)
    
    if (novosNumeros.length === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao gerar números da sorte',
          message: 'Não foi possível gerar números únicos. Por favor, tente novamente.',
        }),
      }
    }

    console.log(`Números gerados: ${novosNumeros.join(', ')}`)

    // Buscar sequência atual do participante
    const numerosExistentesResponse = await fetch(
      `${numerosUrl}?where=(cpf,eq,"${cpfFormatado}")&sort=-bolao_sequencia&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      }
    )

    let proximaSequencia = 1
    if (numerosExistentesResponse.ok) {
      const sequenciaData = await numerosExistentesResponse.json()
      if (sequenciaData.list && sequenciaData.list.length > 0) {
        const ultimaSequencia = sequenciaData.list[0].bolao_sequencia || sequenciaData.list[0].bolao_sequencia || 0
        proximaSequencia = ultimaSequencia + 1
      }
    }

    // Criar registros de números da sorte
    const numerosParaSalvar = novosNumeros.map((numero, index) => ({
      participante_id: participanteId,
      cpf: cpfFormatado,
      numero_sorte: numero,
      numero_formatado: numero.toString().padStart(4, '0'),
      bolao_sequencia: proximaSequencia + index,
      origem: 'landing_page',
      status: 'ativo',
      criado_em: timestamp,
    }))

    // Salvar cada número da sorte
    const numerosSalvos = []
    for (const numeroData of numerosParaSalvar) {
      try {
        const numeroResponse = await fetch(numerosUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
          body: JSON.stringify(numeroData),
        })

        if (numeroResponse.ok) {
          const numeroSalvo = await numeroResponse.json()
          numerosSalvos.push(numeroData.numero_formatado)
        } else {
          const errorText = await numeroResponse.text()
          console.error(`Erro ao salvar número ${numeroData.numero_formatado}:`, errorText)
        }
      } catch (error) {
        console.error(`Erro ao salvar número ${numeroData.numero_formatado}:`, error)
      }
    }

    if (numerosSalvos.length === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao salvar números da sorte',
          message: 'Não foi possível salvar seus números. Por favor, tente novamente.',
        }),
      }
    }

    // Buscar todos os números do participante para retornar
    const todosNumerosResponse = await fetch(
      `${numerosUrl}?where=(cpf,eq,"${cpfFormatado}")&sort=bolao_sequencia`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      }
    )

    let todosNumeros = numerosSalvos
    if (todosNumerosResponse.ok) {
      const todosData = await todosNumerosResponse.json()
      if (todosData.list && todosData.list.length > 0) {
        todosNumeros = todosData.list.map(record => 
          record.numero_formatado || record.numero_sorte?.toString().padStart(4, '0')
        )
      }
    }

    // Enviar dados para N8N via webhook (opcional)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    if (n8nWebhookUrl) {
      try {
        const n8nPayload = {
          nome: name,
          whatsapp: whatsapp,
          email: email,
          numeros_sorte: todosNumeros,
          quantidade_boloes: quantidade,
          total_boloes: totalBoloes,
          eh_primeira_compra: ehPrimeiraCompra,
        }

        console.log('Enviando dados para N8N:', n8nPayload)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        console.log('Mensagem enviada para N8N com sucesso')
      } catch (n8nError) {
        if (n8nError.name === 'AbortError') {
          console.error('Timeout ao enviar para N8N (10 segundos)')
        } else {
          console.error('Erro ao enviar para N8N:', n8nError.message)
        }
        // Não bloqueia o cadastro se N8N falhar
      }
    }

    // Resposta de sucesso
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        numeros_sorte: todosNumeros,
        novos_numeros: numerosSalvos,
        total_boloes: totalBoloes,
        eh_primeira_compra: ehPrimeiraCompra,
        message: ehPrimeiraCompra 
          ? `Cadastro realizado com sucesso! ${quantidade} número(s) da sorte gerado(s).`
          : `Compra realizada com sucesso! ${quantidade} novo(s) número(s) da sorte adicionado(s).`,
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
