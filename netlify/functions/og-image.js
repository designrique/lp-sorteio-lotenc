const fs = require('fs')
const path = require('path')

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
    console.log('Método HTTP:', event.httpMethod)
    console.log('Path:', event.path)
    
    // Tentar ler a imagem estática do site (snapshot)
    // A imagem está em public/og-image.png que será copiada para dist/og-image.png no build
    const imagePath = path.join(process.cwd(), 'dist', 'og-image.png')
    
    console.log('Tentando ler imagem estática de:', imagePath)
    
    let imageBuffer
    try {
      // Tentar ler do dist primeiro (produção)
      imageBuffer = fs.readFileSync(imagePath)
      console.log('Imagem lida do dist com sucesso, tamanho:', imageBuffer.length, 'bytes')
    } catch (distError) {
      console.log('Não encontrado no dist, tentando public...')
      // Fallback: tentar ler do public (desenvolvimento ou se dist não existir)
      const publicPath = path.join(process.cwd(), 'public', 'og-image.png')
      try {
        imageBuffer = fs.readFileSync(publicPath)
        console.log('Imagem lida do public com sucesso, tamanho:', imageBuffer.length, 'bytes')
      } catch (publicError) {
        // Se não encontrar em nenhum lugar, tentar baixar do site
        console.log('Imagem não encontrada localmente, tentando baixar do site...')
        const https = require('https')
        const siteUrl = 'https://sorteio.loteriaencruzilhada.com.br/og-image.png'
        
        imageBuffer = await new Promise((resolve, reject) => {
          https.get(siteUrl, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`Falha ao baixar imagem: ${res.statusCode}`))
              return
            }
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () => resolve(Buffer.concat(chunks)))
            res.on('error', reject)
          }).on('error', reject)
        })
        
        console.log('Imagem baixada do site com sucesso, tamanho:', imageBuffer.length, 'bytes')
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('=== ERRO ao servir OG Image ===')
    console.error('Mensagem:', error.message)
    console.error('Stack trace:', error.stack)
    
    // Retornar erro detalhado
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Erro ao servir imagem',
        message: error.message,
        stack: error.stack,
        hint: 'Verifique se og-image.png existe em public/ ou dist/'
      }),
    }
  }
}

