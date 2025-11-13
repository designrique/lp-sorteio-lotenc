/**
 * Script de teste para verificar consulta de CPF e números da sorte
 * Execute: node test-consulta-cpf.js <CPF>
 */

const baseUrl = 'https://crm.loteriaencruzilhada.com.br'
const token = 'KBvrfjQ6xamtOib6EOozDtW80T7_YNhdyNZsgLKL'
const project = 'pgs3stwhbnv3u0u'

const cpfInput = process.argv[2] || '12345678900'

// Normalizar CPF
const cpfSemMascara = String(cpfInput.replace(/\D/g, ''))
const cpfFormatado = cpfSemMascara.padStart(11, '0')

console.log('🔍 Testando consulta de CPF e números da sorte\n')
console.log('='.repeat(60))
console.log(`CPF informado: ${cpfInput}`)
console.log(`CPF normalizado: ${cpfFormatado}`)
console.log('='.repeat(60) + '\n')

const participantesUrl = `${baseUrl}/api/v1/db/data/noco/${project}/participantes`
const numerosUrl = `${baseUrl}/api/v1/db/data/noco/${project}/numeros_sorte`

async function testarConsulta() {
  try {
    // 1. Buscar participante
    console.log('1️⃣ Buscando participante...')
    const participantesCheckUrl = `${participantesUrl}?where=(cpf,eq,"${cpfFormatado}")`
    console.log(`   URL: ${participantesCheckUrl}`)
    
    const resParticipante = await fetch(participantesCheckUrl, {
      headers: { 'xc-token': token }
    })
    
    if (resParticipante.ok) {
      const dataParticipante = await resParticipante.json()
      console.log(`   Status: ${resParticipante.status}`)
      console.log(`   Total encontrado: ${dataParticipante.list?.length || 0}`)
      
      if (dataParticipante.list && dataParticipante.list.length > 0) {
        const participante = dataParticipante.list[0]
        console.log('   ✅ Participante encontrado!')
        console.log(`   Dados:`, JSON.stringify(participante, null, 2))
        console.log(`   CPF no banco: "${participante.cpf}"`)
      } else {
        console.log('   ⚠️ Participante não encontrado')
      }
    } else {
      const error = await resParticipante.text()
      console.log(`   ❌ Erro: ${resParticipante.status} - ${error}`)
    }
    
    console.log('\n' + '-'.repeat(60) + '\n')
    
    // 2. Buscar números da sorte
    console.log('2️⃣ Buscando números da sorte...')
    const numerosCheckUrl = `${numerosUrl}?where=(cpf,eq,"${cpfFormatado}")&sort=bolao_sequencia`
    console.log(`   URL: ${numerosCheckUrl}`)
    
    const resNumeros = await fetch(numerosCheckUrl, {
      headers: { 'xc-token': token }
    })
    
    if (resNumeros.ok) {
      const dataNumeros = await resNumeros.json()
      console.log(`   Status: ${resNumeros.status}`)
      console.log(`   Total encontrado: ${dataNumeros.list?.length || 0}`)
      
      if (dataNumeros.list && dataNumeros.list.length > 0) {
        console.log('   ✅ Números encontrados!')
        console.log(`   Total: ${dataNumeros.list.length} número(s)`)
        console.log('\n   Detalhes dos números:')
        dataNumeros.list.forEach((num, index) => {
          console.log(`\n   Número ${index + 1}:`)
          console.log(`     - CPF: "${num.cpf}"`)
          console.log(`     - CPF tipo: ${typeof num.cpf}`)
          console.log(`     - numero_sorte: ${num.numero_sorte}`)
          console.log(`     - numero_formatado: "${num.numero_formatado}"`)
          console.log(`     - bolao_sequencia: ${num.bolao_sequencia}`)
          console.log(`     - participante_id: ${num.participante_id}`)
          console.log(`     - Todos os campos:`, Object.keys(num).join(', '))
        })
      } else {
        console.log('   ⚠️ Nenhum número encontrado')
        console.log('   Resposta completa:', JSON.stringify(dataNumeros, null, 2))
      }
    } else {
      const error = await resNumeros.text()
      console.log(`   ❌ Erro: ${resNumeros.status} - ${error}`)
    }
    
    console.log('\n' + '-'.repeat(60) + '\n')
    
    // 3. Buscar sem zeros à esquerda (compatibilidade)
    const cpfSemZeros = cpfFormatado.replace(/^0+/, '')
    if (cpfSemZeros !== cpfFormatado) {
      console.log('3️⃣ Buscando números sem zeros à esquerda (compatibilidade)...')
      const numerosCheckUrl2 = `${numerosUrl}?where=(cpf,eq,"${cpfSemZeros}")&sort=bolao_sequencia`
      console.log(`   URL: ${numerosCheckUrl2}`)
      
      const resNumeros2 = await fetch(numerosCheckUrl2, {
        headers: { 'xc-token': token }
      })
      
      if (resNumeros2.ok) {
        const dataNumeros2 = await resNumeros2.json()
        console.log(`   Status: ${resNumeros2.status}`)
        console.log(`   Total encontrado: ${dataNumeros2.list?.length || 0}`)
        
        if (dataNumeros2.list && dataNumeros2.list.length > 0) {
          console.log('   ✅ Números encontrados sem zeros!')
          dataNumeros2.list.forEach((num, index) => {
            console.log(`   Número ${index + 1}: CPF="${num.cpf}", numero_formatado="${num.numero_formatado}"`)
          })
        }
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Teste concluído!')
    
  } catch (error) {
    console.error('\n❌ Erro ao executar teste:', error.message)
    console.error(error.stack)
  }
}

testarConsulta()

