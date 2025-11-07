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
    console.log('Função og-image executada')
    
    // Parâmetros opcionais da query string
    const { title, description } = event.queryStringParameters || {}
    
    // Valores padrão
    const ogTitle = title || 'O que você faria se acordasse milionário em 2026?'
    const ogDescription = description || 'A Mega da Virada vem aí e sua chance está na Loteria Encruzilhada!'
    
    // Tentar usar satori e sharp se disponíveis
    let satori, sharp
    try {
      satori = require('satori')
      sharp = require('sharp')
    } catch (requireError) {
      console.error('Erro ao carregar dependências:', requireError)
      // Fallback: retornar imagem estática se disponível
      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: '/og-image.png',
        },
        body: '',
      }
    }
    
    console.log('Gerando OG Image com título:', ogTitle)
    
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

    console.log('SVG gerado com sucesso, convertendo para PNG...')

    // Converter SVG para PNG usando Sharp
    const png = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    console.log('PNG gerado com sucesso, tamanho:', png.length, 'bytes')

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
    console.error('Erro ao gerar OG Image:', error)
    console.error('Stack trace:', error.stack)
    
    // Fallback: retornar imagem estática se disponível
    return {
      statusCode: 302,
      headers: {
        'Access-Control-Allow-Origin': '*',
        Location: '/og-image.png',
      },
      body: '',
    }
  }
}

