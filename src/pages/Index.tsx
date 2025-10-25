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
      <section className="bg-[#001ea7] py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <img 
              src="/logo-loteria-encruzilhada.png" 
              alt="Loteria Encruzilhada" 
              className="h-16 w-auto"
            />
          </div>
        </div>
      </section>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center bg-[#ebce10] overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Man Illustration */}
            <div className="relative animate-fade-in-up">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Composição com 3 camadas animadas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Camada 1: icons_premios2.png - Fundo com explosão de prêmios */}
                  <div className="absolute inset-0 animate-pulse">
                    <img 
                      src="/icons_premios2.png" 
                      alt="Explosão de prêmios" 
                      className="w-full h-full object-contain animate-spin-slow"
                    />
                  </div>
                  
                  {/* Camada 2: cindy-photo.png - Personagem principal */}
                  <div className="relative z-10 animate-bounce-gentle">
                    <img 
                      src="/cindy-photo.png" 
                      alt="Personagem animado" 
                      className="w-96 h-96 object-contain"
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
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#ebce10] rounded-full animate-bounce flex items-center justify-center shadow-lg">
                  <i className="fas fa-usd text-[#001ea7] text-3xl"></i>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 
                  id="hero-title"
                  className="text-4xl lg:text-6xl font-bold text-[#333333] leading-tight hero-title-animation"
                >
                  O que você faria se acordasse milionário em 2026?
                </h1>
                <p 
                  id="hero-subtitle"
                  className="text-xl lg:text-2xl text-[#333333] font-medium hero-subtitle-animation"
                >
                  A Mega da Virada vem aí e sua chance está na Loteria Encruzilhada!
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <span className="text-xl font-semibold text-[#333333]">Prêmio de R$ 850 milhões</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏍️</span>
                    <span className="text-xl font-semibold text-[#333333]">+ Moto elétrica (sorteada entre quem comprar bolão)</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <p className="text-lg font-semibold text-[#333333] mb-4">
                    Enquanto a hora não chega, comece a ganhar agora com nosso momento da sorte:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-[#333333]">Airfryer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-[#333333]">Sanduicheira</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-[#333333]">Liquidificador</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-[#333333]">3 Bolões da Mega</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-[#333333] mt-4">
                    É só preencher o formulário abaixo.
                  </p>
                  <p className="text-sm text-[#666666] mt-2">
                    Sem pegadinha, sem custo, sem compromisso.
                  </p>
                </div>
              </div>
              

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleScrollToForm}
                  className="bg-[#001ea7] hover:bg-[#001ea7]/90 text-white rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  QUERO MEU NÚMERO DA SORTE AGORA!
                  <i className="fas fa-arrow-down ml-2 animate-bounce"></i>
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#ebce10] rounded-full flex items-center justify-center">
                    <i className="fas fa-leaf text-[#001ea7] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Zero Poluição: Contribua para um futuro sustentável</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#ebce10] rounded-full flex items-center justify-center">
                    <i className="fas fa-gas-pump text-[#001ea7] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Zero Combustível: Diga adeus aos postos de gasolina</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#ebce10] rounded-full flex items-center justify-center">
                    <i className="fas fa-file-alt text-[#001ea7] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Zero Burocracia: Seu Número da Sorte é gerado automaticamente</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <i className="fab fa-whatsapp text-white text-2xl"></i>
          </a>
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Participe do momento da sorte sem custo nenhum
          </h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-3xl font-bold text-[#001ea7] mb-6">
              Como Participar e Garantir Seu Número da Sorte
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <h4 className="text-xl font-semibold text-[#333333]">Cadastro Rápido</h4>
                </div>
                <p className="text-[#333333]">
                  Preencha o formulário ao lado com seu nome e e-mail.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <h4 className="text-xl font-semibold text-[#333333]">Número da Sorte Gerado</h4>
                </div>
                <p className="text-[#333333]">
                  Imediatamente após o cadastro, seu Número da Sorte exclusivo será gerado e enviado para o seu e-mail.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001ea7] text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <h4 className="text-xl font-semibold text-[#333333]">É Só Torcer</h4>
                </div>
                <p className="text-[#333333]">
                  Pronto! Você já está concorrendo à Moto Elétrica 0KM no próximo sorteio da Loteria Encruzilhada.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-[#FFD700] rounded-lg">
              <p className="text-[#333333] font-semibold text-lg">
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
      <footer className="bg-[#001ea7] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <i className="fas fa-star text-[#ebce10] text-2xl"></i>
            <h3 className="text-2xl font-bold">Loteria Encruzilhada</h3>
          </div>
          <p className="text-lg mb-4">
            A sua chance de ganhar prêmios incríveis com total transparência e credibilidade.
          </p>
          <p className="text-sm">
            Consulte o regulamento completo{' '}
            <a href="#" className="text-[#ebce10] underline hover:text-white transition-colors">
              [LINK PARA REGULAMENTO]
            </a>
          </p>
          <p className="text-sm mt-4">
            <i className="fas fa-shield-alt mr-2"></i>
            Seu cadastro é seguro e seu Número da Sorte é único.
          </p>
        </div>
      </footer>

      {/* Parceria Mega Elétron */}
      <section className="bg-[#ebce10] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-[#333333] mb-2">Parceria:</h4>
            </div>
            <div className="flex items-center space-x-4">
              <img 
                src="/megaletron_recife.png" 
                alt="Mega Elétron" 
                className="h-12 w-auto"
              />
              <div className="text-[#333333]">
                <p className="font-semibold">Mega Elétron</p>
                <p className="text-sm">Contato: +55 81 99106-8929</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Index
