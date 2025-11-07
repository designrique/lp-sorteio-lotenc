import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SubscriptionForm } from '@/components/SubscriptionForm'
import { ResultSection } from '@/components/ResultSection'
import { cn } from '@/lib/utils'
import { useScrollObserver } from '@/hooks/use-scroll-observer'

const Index = () => {
  const [luckyNumber, setLuckyNumber] = useState<string | null>(null)

  const handleSuccess = (number: string) => {
    setLuckyNumber(number)
    setTimeout(() => {
      document
        .getElementById('result-section')
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleScrollToForm = () => {
    document
      .getElementById('form-section')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const { ref: infoRef, isVisible: isInfoVisible } = useScrollObserver({
    threshold: 0.3,
  })

  return (
    <>
      {/* Barra azul superior com logo */}
      <section className="bg-[#001ea7] py-3 sm:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Loteria Encruzilhada" 
              className="h-12 sm:h-14 md:h-16 w-auto"
            />
          </div>
        </div>
      </section>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center bg-[#ebce10] overflow-hidden">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left Content - Man Illustration */}
            <div className="relative animate-fade-in-up">
              <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                {/* Composição com 3 camadas animadas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Camada 1: icons_premios2.png - Fundo com explosão de prêmios */}
                  <div className="absolute inset-0">
                    <img 
                      src="/icons_premios2.png" 
                      alt="Explosão de prêmios" 
                      className="w-full h-full object-contain animate-pulse-scale"
                    />
                  </div>
                  
                  {/* Camada 2: cindy-photo.png - Personagem principal */}
                  <div className="relative z-10 animate-bounce-gentle">
                    <img 
                      src="/cindy-photo.png" 
                      alt="Personagem animado" 
                      className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
                    />
                  </div>
                  
                  {/* Camada 3: icons-premios.png - Prêmios flutuantes */}
                  <div className="absolute inset-0 animate-float">
                    <img 
                      src="/icons-premios.png" 
                      alt="Prêmios" 
                      className="w-full h-full object-contain opacity-80"
                    />
                  </div>
                </div>
                
                {/* Floating Dollar Coin */}
                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 lg:-top-8 lg:-right-8 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-[#ebce10] rounded-full animate-bounce flex items-center justify-center shadow-lg">
                  <i className="fas fa-usd text-[#001ea7] text-xl sm:text-2xl lg:text-3xl"></i>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 
                  id="hero-title"
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#333333] leading-tight hero-title-animation"
                >
                  O que você faria se acordasse milionário em 2026?
                </h1>
                <p 
                  id="hero-subtitle"
                  className="text-lg sm:text-xl lg:text-2xl text-[#333333] font-medium hero-subtitle-animation"
                >
                  A Mega da Virada vem aí e sua chance está na Loteria Encruzilhada!
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <span className="text-base sm:text-lg lg:text-xl font-semibold text-[#333333]">Prêmio de R$ 850 milhões</span>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">🏍️</span>
                    <span className="text-base sm:text-lg lg:text-xl font-semibold text-[#333333]">+ Moto elétrica (sorteada entre quem comprar bolão)</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                  <p className="text-base sm:text-lg font-semibold text-[#333333] mb-3 sm:mb-4">
                    Enquanto a hora não chega, comece a ganhar agora com nosso momento da sorte:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm sm:text-base text-[#333333]">Airfryer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm sm:text-base text-[#333333]">Sanduicheira</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm sm:text-base text-[#333333]">Liquidificador</span>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#333333] mt-3 sm:mt-4">
                    É só preencher o formulário abaixo.
                  </p>
                  <p className="text-xs sm:text-sm text-[#666666] mt-2">
                    Sem pegadinha, sem custo, sem compromisso.
                  </p>
                </div>
              </div>
              

              <div className="flex items-center justify-center sm:justify-start">
                <Button
                  onClick={handleScrollToForm}
                  className="w-full sm:w-auto bg-[#001ea7] hover:bg-[#001ea7]/90 text-white rounded-lg px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <span className="hidden sm:inline">QUERO MEU NÚMERO DA SORTE AGORA!</span>
                  <span className="sm:hidden">QUERO MEU NÚMERO DA SORTE!</span>
                  <i className="fas fa-arrow-down ml-2 animate-bounce"></i>
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-6 sm:pt-8">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ebce10] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-leaf text-[#001ea7] text-base sm:text-lg"></i>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333] font-medium">Zero Poluição: Contribua para um futuro sustentável</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ebce10] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-gas-pump text-[#001ea7] text-base sm:text-lg"></i>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333] font-medium">Zero Combustível: Diga adeus aos postos de gasolina</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ebce10] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-file-alt text-[#001ea7] text-base sm:text-lg"></i>
                  </div>
                  <span className="text-sm sm:text-base text-[#333333] font-medium">Zero Burocracia: Seu Número da Sorte é gerado automaticamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Info Section */}
      <section
        ref={infoRef}
        className={cn(
          'py-16 md:py-24 bg-[#001ea7] transition-opacity duration-500',
          isInfoVisible ? 'animate-fade-in-up' : 'opacity-0',
        )}
      >
        <div className="container mx-auto px-4 text-center max-w-6xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 px-4">
            Participe do momento da sorte sem custo nenhum
          </h2>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#001ea7] mb-4 sm:mb-6">
              Como Participar e Garantir Seu Número da Sorte
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <h4 className="text-lg sm:text-xl font-semibold text-[#333333]">Cadastro Rápido</h4>
                </div>
                <p className="text-sm sm:text-base text-[#333333]">
                  Preencha o formulário ao lado com seu nome e e-mail.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <h4 className="text-lg sm:text-xl font-semibold text-[#333333]">Número da Sorte Gerado</h4>
                </div>
                <p className="text-sm sm:text-base text-[#333333]">
                  Imediatamente após o cadastro, seu Número da Sorte exclusivo será gerado e enviado para o seu whatsapp.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <h4 className="text-lg sm:text-xl font-semibold text-[#333333]">Compre um Bolão</h4>
                </div>
                <p className="text-sm sm:text-base text-[#333333]">
                  Na mensagem recebida em seu whatsapp, chegará um link direto para o nosso setor de vendas. Compre um bolão da Mega da Virada disponível. Isso garante sua participação nos sorteios.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <h4 className="text-lg sm:text-xl font-semibold text-[#333333]">É Só Torcer</h4>
                </div>
                <p className="text-sm sm:text-base text-[#333333]">
                  Pronto! Você já está concorrendo à Moto Elétrica 0KM no próximo sorteio da Loteria Encruzilhada. Guarde o comprovante da compra do bolão com o seu nome e CPF e também o seu número da sorte (também enviado no whatsapp).
                </p>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[#FFD700] rounded-lg">
              <p className="text-[#333333] font-semibold text-sm sm:text-base lg:text-lg">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                ATENÇÃO: O sorteio será realizado em breve. Não perca tempo, os cadastros e a geração dos Números da Sorte são limitados!
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id="form-section">
        {!luckyNumber ? (
          <SubscriptionForm onSuccess={handleSuccess} />
        ) : (
          <div id="result-section">
            <ResultSection luckyNumber={luckyNumber} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#001ea7] text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img 
              src="/logo.png" 
              alt="Loteria Encruzilhada" 
              className="h-10 sm:h-12 w-auto"
            />
          </div>
          <p className="text-base sm:text-lg mb-3 sm:mb-4">
            A sua chance de ganhar prêmios incríveis com total transparência e credibilidade.
          </p>
          <p className="text-xs sm:text-sm mt-3 sm:mt-4">
            <i className="fas fa-shield-alt mr-2"></i>
            Seu cadastro é seguro e seu Número da Sorte é único.
          </p>
        </div>
      </footer>

      {/* Parceria Mega Elétron */}
      <section className="bg-[#ebce10] py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 md:space-x-8">
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-bold text-[#333333] mb-1 sm:mb-2">Parceria:</h4>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <img 
                src="/mega.png" 
                alt="Mega Elétron" 
                className="h-10 sm:h-12 w-auto"
                onError={(e) => {
                  console.error('Erro ao carregar logo Mega Elétron:', e);
                  e.currentTarget.style.display = 'none';
                  // Mostrar fallback de texto
                  const fallback = document.createElement('div');
                  fallback.className = 'text-[#333333] font-bold text-base sm:text-lg';
                  fallback.textContent = 'MEGA ELÉTRON';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
              <div className="text-center sm:text-left text-[#333333]">
                <p className="font-semibold text-sm sm:text-base">Mega Elétron</p>
                <p className="text-xs sm:text-sm">Contato: +55 81 99106-8929</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Index
