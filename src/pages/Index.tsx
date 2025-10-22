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
      {/* Header */}
      <header className="bg-[#0065b6] text-white py-4">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-star text-[#f5db17] text-2xl"></i>
            <h1 className="text-2xl font-bold">Loteria Encruzilhada</h1>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center bg-[#f5db17] overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Man Illustration */}
            <div className="relative animate-fade-in-up">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Blue Circle with Man */}
                <div className="absolute inset-0 bg-[#0065b6] rounded-full flex items-center justify-center transform -rotate-12 shadow-2xl">
                  <div className="text-center space-y-4 text-white">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto">
                      <i className="fas fa-user text-[#0065b6] text-6xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold">Homem Animado</h3>
                    <p className="text-sm">Pronto para ganhar!</p>
                  </div>
                </div>
                
                {/* Floating Dollar Coin */}
                <div className="absolute -top-8 -right-8 w-20 h-20 bg-[#f5db17] rounded-full animate-bounce flex items-center justify-center shadow-lg">
                  <i className="fas fa-usd text-[#0065b6] text-3xl"></i>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-[#333333] leading-tight">
                  Aqui todo dia é dia de mudar de vida!
                </h1>
                <p className="text-xl lg:text-2xl text-[#333333] font-medium">
                  Aqui Compre agora seu bolão e não perca essa oportunidade de mudar de vida!
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleScrollToForm}
                  className="bg-[#0065b6] hover:bg-[#0065b6]/90 text-white rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  FALE AGORA
                  <i className="fas fa-arrow-down ml-2 animate-bounce"></i>
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f5db17] rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-[#0065b6] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Números únicos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f5db17] rounded-full flex items-center justify-center">
                    <i className="fas fa-gift text-[#0065b6] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Prêmios incríveis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f5db17] rounded-full flex items-center justify-center">
                    <i className="fas fa-usd text-[#0065b6] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Dinheiro fácil</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f5db17] rounded-full flex items-center justify-center">
                    <i className="fas fa-trophy text-[#0065b6] text-lg"></i>
                  </div>
                  <span className="text-[#333333] font-medium">Grandes prêmios</span>
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
          'py-16 md:py-24 bg-[#f5db17] transition-opacity duration-500',
          isInfoVisible ? 'animate-fade-in-up' : 'opacity-0',
        )}
      >
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0065b6] mb-8">
            Como Funciona?
          </h2>
          <p className="text-xl text-[#333333] leading-relaxed">
            É simples! Preencha o formulário abaixo com seus dados para gerar um
            número da sorte único. O sorteio será realizado em breve e os
            vencedores serão contatados via WhatsApp e e-mail. Boa sorte!
          </p>
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
    </>
  )
}

export default Index
