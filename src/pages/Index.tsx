import { useState } from 'react'
import { ArrowDown } from 'lucide-react'
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
      <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center text-white bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto text-center px-4 z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Participe do Sorteio da Loteria Encruzilhada!
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Cadastre-se agora e receba seu número da sorte exclusivo para
            concorrer a prêmios incríveis!
          </p>
          <Button
            onClick={handleScrollToForm}
            className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-bold transition-transform duration-200 hover:scale-105"
          >
            Quero Participar!
            <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
          </Button>
        </div>
      </section>

      <section
        ref={infoRef}
        className={cn(
          'py-16 md:py-24 bg-white transition-opacity duration-500',
          isInfoVisible ? 'animate-fade-in-up' : 'opacity-0',
        )}
      >
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Como Funciona?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
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
