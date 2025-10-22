import { useState } from 'react'
import { ArrowDown, Star, Gift } from 'lucide-react'
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
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-[#B30000] leading-tight">
                  Sua sorte está aqui!
                </h1>
                <p className="text-xl lg:text-2xl text-[#000000] font-medium">
                  Essa é a sua chance de mudar de vida!
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleScrollToForm}
                  className="bg-[#B30000] hover:bg-[#B30000]/90 text-white rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Compre agora seu bolão
                  <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-[#B30000]" />
                  </div>
                  <span className="text-[#000000] font-medium">Números únicos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <Gift className="h-5 w-5 text-[#B30000]" />
                  </div>
                  <span className="text-[#000000] font-medium">Prêmios incríveis</span>
                </div>
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative animate-fade-in-up">
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Placeholder for illustration */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#B30000] rounded-3xl transform rotate-3 shadow-2xl">
                  <div className="absolute inset-4 bg-white rounded-2xl flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-[#B30000] rounded-full flex items-center justify-center mx-auto">
                        <Star className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#B30000]">Sorte</h3>
                      <p className="text-gray-600">Sua chance de vencer!</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#FFD700] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#B30000] rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -left-8 w-8 h-8 bg-[#FFD700] rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section
        ref={infoRef}
        className={cn(
          'py-16 md:py-24 bg-[#F2F2F2] transition-opacity duration-500',
          isInfoVisible ? 'animate-fade-in-up' : 'opacity-0',
        )}
      >
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-[#B30000] mb-8">
            Como Funciona?
          </h2>
          <p className="text-xl text-[#000000] leading-relaxed">
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
