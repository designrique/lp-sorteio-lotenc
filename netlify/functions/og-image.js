exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    console.log('=== Função og-image executada ===')
    console.log('Event:', JSON.stringify(event, null, 2))
    
    // Parâmetros opcionais da query string
    const { title, description } = event.queryStringParameters || {}
    
    // Valores padrão
    const ogTitle = title || 'O que você faria se acordasse milionário em 2026?'
    const ogDescription = description || 'A Mega da Virada vem aí e sua chance está na Loteria Encruzilhada!'
    
    console.log('Título:', ogTitle)
    console.log('Descrição:', ogDescription)
    
    // Tentar carregar dependências
    let satori, sharp
    try {
      console.log('Tentando carregar satori...')
      const satoriModule = require('satori')
      // satori pode ser exportado como default ou como função direta
      satori = satoriModule.default || satoriModule
      console.log('satori carregado com sucesso, tipo:', typeof satori)
      
      if (typeof satori !== 'function') {
        console.error('satori não é uma função! Tipo:', typeof satori)
        console.error('satoriModule:', JSON.stringify(Object.keys(satoriModule || {})))
        throw new Error('satori não é uma função. Tipo recebido: ' + typeof satori)
      }
      
      console.log('Tentando carregar sharp...')
      const sharpModule = require('sharp')
      sharp = sharpModule.default || sharpModule
      console.log('sharp carregado com sucesso, tipo:', typeof sharp)
      
      if (typeof sharp !== 'function') {
        console.error('sharp não é uma função! Tipo:', typeof sharp)
        throw new Error('sharp não é uma função. Tipo recebido: ' + typeof sharp)
      }
    } catch (requireError) {
      console.error('ERRO ao carregar dependências:', requireError.message)
      console.error('Stack:', requireError.stack)
      
      // Retornar erro ao invés de redirect
      return {
        statusCode: 500,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Dependências não encontradas',
          message: requireError.message,
          hint: 'Verifique se satori e sharp estão instalados em netlify/functions/package.json'
        }),
      }
    }
    
    console.log('Gerando SVG com Satori...')
    
    // Criar o SVG usando Satori
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #ebce10 0%, #001ea7 100%)',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#333333',
                  textAlign: 'center',
                  marginBottom: '30px',
                  lineHeight: '1.2',
                  maxWidth: '900px',
                },
                children: ogTitle,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '32px',
                  color: '#333333',
                  textAlign: 'center',
                  opacity: 0.9,
                  maxWidth: '800px',
                  marginBottom: '40px',
                },
                children: ogDescription,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '28px',
                  color: '#333333',
                  fontWeight: '600',
                },
                children: '🎯 Prêmio de R$ 850 milhões',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [],
      }
    )

    console.log('SVG gerado com sucesso, tamanho:', svg.length, 'caracteres')
    console.log('Convertendo SVG para PNG com Sharp...')

    // Converter SVG para PNG usando Sharp
    const png = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    console.log('PNG gerado com sucesso!')
    console.log('Tamanho do PNG:', png.length, 'bytes')

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
      body: png.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('=== ERRO ao gerar OG Image ===')
    console.error('Mensagem:', error.message)
    console.error('Stack trace:', error.stack)
    console.error('Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Retornar erro detalhado ao invés de redirect
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Erro ao gerar imagem',
        message: error.message,
        stack: error.stack,
        hint: 'Verifique os logs do Netlify Functions para mais detalhes'
      }),
    }
  }
}

