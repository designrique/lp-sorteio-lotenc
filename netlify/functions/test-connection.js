/**
 * Função de teste para verificar conexão com tabelas do NocoDB
 * Endpoint: /api/test-connection
 */
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  const results = {
    timestamp: new Date().toISOString(),
    variaveis_ambiente: {},
    testes: [],
    sucesso: true,
    erros: [],
  }

  try {
    // Verificar variáveis de ambiente
    const nocodbBaseUrl = process.env.NOCODB_BASE_URL
    const nocodbToken = process.env.NOCODB_TOKEN
    const nocodbProject = process.env.NOCODB_PROJECT || 'default'

    results.variaveis_ambiente = {
      NOCODB_BASE_URL: nocodbBaseUrl ? '✅ Configurado' : '❌ Não configurado',
      NOCODB_TOKEN: nocodbToken ? '✅ Configurado' : '❌ Não configurado',
      NOCODB_PROJECT: nocodbProject,
      N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL ? '✅ Configurado' : '⚠️ Não configurado (opcional)',
    }

    if (!nocodbBaseUrl || !nocodbToken) {
      results.sucesso = false
      results.erros.push('Variáveis de ambiente NOCODB_BASE_URL ou NOCODB_TOKEN não configuradas')
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(results, null, 2),
      }
    }

    const participantesUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/participantes`
    const numerosUrl = `${nocodbBaseUrl}/api/v1/db/data/noco/${nocodbProject}/numeros_sorte`

    // Teste 1: Verificar se tabela participantes existe
    try {
      const participantesResponse = await fetch(participantesUrl + '?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (participantesResponse.ok) {
        results.testes.push({
          teste: 'Tabela participantes - Verificação de existência',
          status: '✅ Sucesso',
          detalhes: 'Tabela encontrada e acessível',
        })
      } else {
        const errorText = await participantesResponse.text()
        results.sucesso = false
        results.testes.push({
          teste: 'Tabela participantes - Verificação de existência',
          status: '❌ Erro',
          detalhes: `Status: ${participantesResponse.status}, Erro: ${errorText}`,
        })
        results.erros.push(`Erro ao acessar tabela participantes: ${participantesResponse.status}`)
      }
    } catch (error) {
      results.sucesso = false
      results.testes.push({
        teste: 'Tabela participantes - Verificação de existência',
        status: '❌ Erro',
        detalhes: error.message,
      })
      results.erros.push(`Erro ao acessar tabela participantes: ${error.message}`)
    }

    // Teste 2: Verificar se tabela numeros_sorte existe
    try {
      const numerosResponse = await fetch(numerosUrl + '?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (numerosResponse.ok) {
        results.testes.push({
          teste: 'Tabela numeros_sorte - Verificação de existência',
          status: '✅ Sucesso',
          detalhes: 'Tabela encontrada e acessível',
        })
      } else {
        const errorText = await numerosResponse.text()
        results.sucesso = false
        results.testes.push({
          teste: 'Tabela numeros_sorte - Verificação de existência',
          status: '❌ Erro',
          detalhes: `Status: ${numerosResponse.status}, Erro: ${errorText}`,
        })
        results.erros.push(`Erro ao acessar tabela numeros_sorte: ${numerosResponse.status}`)
      }
    } catch (error) {
      results.sucesso = false
      results.testes.push({
        teste: 'Tabela numeros_sorte - Verificação de existência',
        status: '❌ Erro',
        detalhes: error.message,
      })
      results.erros.push(`Erro ao acessar tabela numeros_sorte: ${error.message}`)
    }

    // Teste 3: Tentar criar um registro de teste na tabela participantes
    if (results.sucesso) {
      try {
        const testData = {
          usuario: 'TESTE_CONEXAO',
          whatsapp: '+5511999999999',
          email: 'teste@conexao.com',
          cpf: '00000000000',
          total_boloes: 0,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        }

        const createResponse = await fetch(participantesUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': nocodbToken,
          },
          body: JSON.stringify(testData),
        })

        if (createResponse.ok) {
          const createdData = await createResponse.json()
          const testId = createdData.id || createdData.Id

          results.testes.push({
            teste: 'Tabela participantes - Criação de registro',
            status: '✅ Sucesso',
            detalhes: `Registro criado com ID: ${testId}`,
          })

          // Teste 4: Tentar deletar o registro de teste
          try {
            const deleteUrl = `${participantesUrl}/${testId}`
            const deleteResponse = await fetch(deleteUrl, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'xc-token': nocodbToken,
              },
            })

            if (deleteResponse.ok) {
              results.testes.push({
                teste: 'Tabela participantes - Exclusão de registro de teste',
                status: '✅ Sucesso',
                detalhes: 'Registro de teste removido com sucesso',
              })
            } else {
              results.testes.push({
                teste: 'Tabela participantes - Exclusão de registro de teste',
                status: '⚠️ Aviso',
                detalhes: `Não foi possível remover registro de teste (ID: ${testId}). Remova manualmente.`,
              })
            }
          } catch (error) {
            results.testes.push({
              teste: 'Tabela participantes - Exclusão de registro de teste',
              status: '⚠️ Aviso',
              detalhes: `Erro ao remover: ${error.message}. Remova manualmente o registro de teste.`,
            })
          }
        } else {
          const errorText = await createResponse.text()
          results.testes.push({
            teste: 'Tabela participantes - Criação de registro',
            status: '❌ Erro',
            detalhes: `Status: ${createResponse.status}, Erro: ${errorText}`,
          })
          results.erros.push(`Erro ao criar registro de teste: ${createResponse.status}`)
        }
      } catch (error) {
        results.testes.push({
          teste: 'Tabela participantes - Criação de registro',
          status: '❌ Erro',
          detalhes: error.message,
        })
        results.erros.push(`Erro ao criar registro de teste: ${error.message}`)
      }
    }

    // Teste 5: Verificar estrutura da tabela participantes (buscar um registro existente)
    try {
      const listResponse = await fetch(participantesUrl + '?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (listResponse.ok) {
        const listData = await listResponse.json()
        if (listData.list && listData.list.length > 0) {
          const primeiroRegistro = listData.list[0]
          const camposEncontrados = Object.keys(primeiroRegistro).filter(
            key => !key.startsWith('Id') && key !== 'id'
          )

          results.testes.push({
            teste: 'Tabela participantes - Estrutura de campos',
            status: '✅ Sucesso',
            detalhes: `Campos encontrados: ${camposEncontrados.join(', ')}`,
            exemplo_registro: primeiroRegistro,
          })
        } else {
          results.testes.push({
            teste: 'Tabela participantes - Estrutura de campos',
            status: '⚠️ Info',
            detalhes: 'Tabela existe mas está vazia. Estrutura será verificada no primeiro registro criado.',
          })
        }
      }
    } catch (error) {
      results.testes.push({
        teste: 'Tabela participantes - Estrutura de campos',
        status: '⚠️ Aviso',
        detalhes: `Não foi possível verificar estrutura: ${error.message}`,
      })
    }

    // Teste 6: Verificar estrutura da tabela numeros_sorte
    try {
      const numerosListResponse = await fetch(numerosUrl + '?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': nocodbToken,
        },
      })

      if (numerosListResponse.ok) {
        const numerosListData = await numerosListResponse.json()
        if (numerosListData.list && numerosListData.list.length > 0) {
          const primeiroNumero = numerosListData.list[0]
          const camposEncontrados = Object.keys(primeiroNumero).filter(
            key => !key.startsWith('Id') && key !== 'id'
          )

          results.testes.push({
            teste: 'Tabela numeros_sorte - Estrutura de campos',
            status: '✅ Sucesso',
            detalhes: `Campos encontrados: ${camposEncontrados.join(', ')}`,
            exemplo_registro: primeiroNumero,
          })
        } else {
          results.testes.push({
            teste: 'Tabela numeros_sorte - Estrutura de campos',
            status: '⚠️ Info',
            detalhes: 'Tabela existe mas está vazia. Estrutura será verificada no primeiro registro criado.',
          })
        }
      }
    } catch (error) {
      results.testes.push({
        teste: 'Tabela numeros_sorte - Estrutura de campos',
        status: '⚠️ Aviso',
        detalhes: `Não foi possível verificar estrutura: ${error.message}`,
      })
    }

    return {
      statusCode: results.sucesso ? 200 : 500,
      headers,
      body: JSON.stringify(results, null, 2),
    }
  } catch (error) {
    results.sucesso = false
    results.erros.push(`Erro geral: ${error.message}`)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(results, null, 2),
    }
  }
}

