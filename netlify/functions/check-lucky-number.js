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
    
    // Primeiro, vamos buscar TODOS os números da sorte para ver o que tem no banco
    console.log('Buscando TODOS os números da sorte para debug...')
    try {
      const todosNumerosUrl = `${numerosUrl}?limit=100`
      const todosNumerosResponse = await fetch(todosNumerosUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })
      
      if (todosNumerosResponse.ok) {
        const todosNumerosData = await todosNumerosResponse.json()
        console.log(`Total de números no banco: ${todosNumerosData.list?.length || 0}`)
        if (todosNumerosData.list && todosNumerosData.list.length > 0) {
          console.log('Exemplos de CPFs no banco:')
          todosNumerosData.list.slice(0, 5).forEach((num, idx) => {
            const participanteId = num.participante_id || num.participante_Id || num.participante_ID || 'NULL'
            console.log(`  ${idx + 1}. CPF: "${num.cpf}" (tipo: ${typeof num.cpf}), numero_formatado: "${num.numero_formatado}", participante_id: ${participanteId}`)
          })
          
          // Filtrar números do CPF consultado para ver quantos têm o mesmo participante_id
          const numerosDoCpf = todosNumerosData.list.filter(num => {
            const numCpf = String(num.cpf || '').trim().replace(/\D/g, '').padStart(11, '0')
            return numCpf === cpfFormatado || numCpf === cpfFormatado.replace(/^0+/, '')
          })
          console.log(`Números encontrados com CPF "${cpfFormatado}": ${numerosDoCpf.length}`)
          if (numerosDoCpf.length > 0) {
            console.log('participante_id dos números deste CPF:')
            numerosDoCpf.forEach((num, idx) => {
              const participanteId = num.participante_id || num.participante_Id || num.participante_ID || 'NULL'
              console.log(`  ${idx + 1}. numero_formatado: "${num.numero_formatado}", participante_id: ${participanteId}`)
            })
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar todos os números:', error)
    }
    
    // Buscar números usando CPF
    // Estratégia: buscar todos os números e filtrar em memória pelo CPF
    // Isso garante que encontramos todos os números mesmo se a query do NocoDB falhar
    console.log(`Buscando números com CPF: "${cpfFormatado}"`)
    
    try {
      // Buscar TODOS os números (ou pelo menos muitos) e filtrar em memória
      const todosNumerosUrl = `${numerosUrl}?sort=bolao_sequencia&limit=1000`
      const numerosResponse = await fetch(todosNumerosUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (numerosResponse.ok) {
        const numerosData = await numerosResponse.json()
        console.log(`Total de números retornados pela API: ${numerosData.list?.length || 0}`)
        
        if (numerosData.list && numerosData.list.length > 0) {
          // Normalizar CPF buscado para comparação
          const cpfBuscadoNormalizado = cpfFormatado.replace(/\D/g, '').padStart(11, '0')
          const cpfBuscadoSemZeros = cpfBuscadoNormalizado.replace(/^0+/, '')
          
          // Filtrar números pelo CPF em memória
          const numerosFiltrados = numerosData.list.filter(record => {
            const recordCpf = String(record.cpf || '').trim()
            const recordCpfNormalizado = recordCpf.replace(/\D/g, '').padStart(11, '0')
            const recordCpfSemZeros = recordCpfNormalizado.replace(/^0+/, '')
            
            // Comparar com e sem zeros à esquerda
            return recordCpfNormalizado === cpfBuscadoNormalizado || 
                   recordCpfSemZeros === cpfBuscadoSemZeros ||
                   recordCpfNormalizado === cpfBuscadoSemZeros ||
                   recordCpfSemZeros === cpfBuscadoNormalizado
          })
          
          console.log(`Números filtrados pelo CPF "${cpfFormatado}": ${numerosFiltrados.length}`)
          
          if (numerosFiltrados.length > 0) {
            console.log(`Encontrados ${numerosFiltrados.length} registro(s) com CPF correspondente. Processando...`)
            
            // Processar todos os registros encontrados
            const novosNumeros = numerosFiltrados.map((record, index) => {
              // Log detalhado do registro
              console.log(`Registro ${index + 1}:`, {
                cpf: record.cpf,
                numero_formatado: record.numero_formatado,
                bolao_sequencia: record.bolao_sequencia,
                participante_id: record.participante_id || record.participante_Id || 'NULL',
              })
              
              // Formatar número da sorte
              let numeroFormatado = null
              if (record.numero_formatado) {
                numeroFormatado = String(record.numero_formatado).padStart(4, '0')
              } else if (record.numero_sorte !== undefined && record.numero_sorte !== null) {
                numeroFormatado = String(record.numero_sorte).padStart(4, '0')
              }
              
              if (!numeroFormatado) {
                console.log(`⚠️ Não foi possível formatar número do registro ${index + 1}`)
                return null
              }
              
              return {
                numero: numeroFormatado,
                sequencia: record.bolao_sequencia || null,
                origem: record.origem || 'landing_page',
                status: record.status || 'ativo',
                criado_em: record.criado_em || null,
                participante_id: record.participante_id || record.participante_Id || null,
              }
            }).filter(n => n !== null) // Remover nulls
            
            console.log(`Números válidos após processamento: ${novosNumeros.length}`)
            
            // Adicionar todos os números encontrados (evitar duplicatas por número)
            const numerosExistentes = new Set(numerosSorte.map(n => n.numero))
            const numerosNovos = novosNumeros.filter(n => !numerosExistentes.has(n.numero))
            numerosSorte = [...numerosSorte, ...numerosNovos]
            
            if (numerosNovos.length > 0) {
              console.log(`✅ ${numerosNovos.length} número(s) encontrado(s) com CPF "${cpfFormatado}"`)
            }
          } else {
            console.log(`⚠️ Nenhum número encontrado com CPF "${cpfFormatado}" após filtrar em memória`)
          }
        }
      } else {
        const errorText = await numerosResponse.text()
        console.log(`Erro ao buscar números: ${numerosResponse.status} - ${errorText}`)
      }
    } catch (error) {
      console.error(`Erro ao buscar números da sorte:`, error)
    }
    
    // Se encontrou participante mas não encontrou números pelo CPF, tentar buscar pelo participante_id
    // E também buscar diretamente usando o CPF do participante encontrado
    if (participante && numerosSorte.length === 0) {
      const participanteId = participante.id || participante.Id || participante.ID
      const participanteCpf = String(participante.cpf || '').trim().replace(/\D/g, '').padStart(11, '0')
      
      console.log(`Participante encontrado mas nenhum número pelo CPF. Tentando buscar pelo participante_id: ${participanteId} e CPF: "${participanteCpf}"`)
      
      // Tentar buscar por participante_id primeiro
      if (participanteId) {
        try {
          // Buscar TODOS os números do participante (sem limite)
          const numerosPorIdUrl = `${numerosUrl}?where=(participante_id,eq,${participanteId})&sort=bolao_sequencia&limit=1000`
          console.log(`Buscando números pelo participante_id: ${numerosPorIdUrl}`)
          
          const numerosPorIdResponse = await fetch(numerosPorIdUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'xc-token': nocodbToken,
            },
          })
          
          if (numerosPorIdResponse.ok) {
            const numerosPorIdData = await numerosPorIdResponse.json()
            console.log(`Busca por participante_id retornou: ${numerosPorIdData.list?.length || 0} registro(s)`)
            
            if (numerosPorIdData.list && numerosPorIdData.list.length > 0) {
              console.log('Todos os registros encontrados por participante_id:')
              numerosPorIdData.list.forEach((num, idx) => {
                console.log(`  ${idx + 1}. CPF: "${num.cpf}", numero_formatado: "${num.numero_formatado}", bolao_sequencia: ${num.bolao_sequencia}, participante_id: ${num.participante_id || num.participante_Id || 'NULL'}`)
              })
              
              numerosSorte = numerosPorIdData.list.map(record => {
                const numeroFormatado = record.numero_formatado || 
                                       (record.numero_sorte ? record.numero_sorte.toString().padStart(4, '0') : null) ||
                                       String(record.numero_sorte || '').padStart(4, '0')
                return {
                  numero: numeroFormatado,
                  sequencia: record.bolao_sequencia || null,
                  origem: record.origem || 'landing_page',
                  status: record.status || 'ativo',
                  criado_em: record.criado_em || null,
                  participante_id: record.participante_id || record.participante_Id || null,
                }
              }).filter(n => n.numero) // Filtrar apenas números válidos
              
              console.log(`✅ ${numerosSorte.length} número(s) encontrado(s) via participante_id`)
            } else {
              console.log('⚠️ Nenhum registro encontrado por participante_id')
            }
          } else {
            const errorText = await numerosPorIdResponse.text()
            console.log(`Erro ao buscar por participante_id: ${numerosPorIdResponse.status} - ${errorText}`)
          }
        } catch (error) {
          console.error('Erro ao buscar números por participante_id:', error)
        }
      }
      
      // Se ainda não encontrou, tentar buscar usando o CPF do participante encontrado
      if (numerosSorte.length === 0 && participanteCpf) {
        console.log(`Tentando buscar números usando CPF do participante encontrado: "${participanteCpf}"`)
        try {
          const numerosPorCpfParticipanteUrl = `${numerosUrl}?where=(cpf,eq,"${participanteCpf}")&sort=bolao_sequencia&limit=1000`
          const numerosPorCpfResponse = await fetch(numerosPorCpfParticipanteUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'xc-token': nocodbToken,
            },
          })
          
          if (numerosPorCpfResponse.ok) {
            const numerosPorCpfData = await numerosPorCpfResponse.json()
            console.log(`Busca por CPF do participante retornou: ${numerosPorCpfData.list?.length || 0} registro(s)`)
            
            if (numerosPorCpfData.list && numerosPorCpfData.list.length > 0) {
              console.log('Todos os registros encontrados por CPF do participante:')
              numerosPorCpfData.list.forEach((num, idx) => {
                console.log(`  ${idx + 1}. CPF: "${num.cpf}", numero_formatado: "${num.numero_formatado}", bolao_sequencia: ${num.bolao_sequencia}, participante_id: ${num.participante_id || num.participante_Id || 'NULL'}`)
              })
              
              numerosSorte = numerosPorCpfData.list.map(record => {
                const numeroFormatado = record.numero_formatado || 
                                       (record.numero_sorte ? record.numero_sorte.toString().padStart(4, '0') : null) ||
                                       String(record.numero_sorte || '').padStart(4, '0')
                return {
                  numero: numeroFormatado,
                  sequencia: record.bolao_sequencia || null,
                  origem: record.origem || 'landing_page',
                  status: record.status || 'ativo',
                  criado_em: record.criado_em || null,
                  participante_id: record.participante_id || record.participante_Id || null,
                }
              }).filter(n => n.numero) // Filtrar apenas números válidos
              
              console.log(`✅ ${numerosSorte.length} número(s) encontrado(s) via CPF do participante`)
            }
          }
        } catch (error) {
          console.error('Erro ao buscar números por CPF do participante:', error)
        }
      }
    }
    
    // Ordenar números por sequência
    numerosSorte.sort((a, b) => (a.sequencia || 0) - (b.sequencia || 0))
    
    // Se encontrou números mas não encontrou participante, buscar participante novamente usando os números
    if (numerosSorte.length > 0 && !participante) {
      console.log('Números encontrados mas participante não encontrado. Tentando buscar participante novamente...')
      // Tentar buscar pelo participante_id do primeiro número
      if (numerosSorte[0].participante_id) {
        try {
          const participanteUrl = `${participantesUrl}/${numerosSorte[0].participante_id}`
          const participanteResponse = await fetch(participanteUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'xc-token': nocodbToken,
            },
          })
          
          if (participanteResponse.ok) {
            participante = await participanteResponse.json()
            console.log('Participante encontrado via participante_id')
          }
        } catch (error) {
          console.error('Erro ao buscar participante via ID:', error)
        }
      }
    }

    // Log para debug
    console.log('Resultado da busca:', {
      participanteEncontrado: !!participante,
      numerosEncontrados: numerosSorte.length,
      cpfFormatado: cpfFormatado,
    })

    // Se encontrou participante ou números, retornar sucesso
    if (participante || numerosSorte.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          participante: participante ? {
            nome: participante.usuario || participante.Usuario || '',
            email: participante.email || '',
            whatsapp: participante.whatsapp || '',
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
      console.log('CPF não encontrado:', cpfFormatado)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
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
