import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ResultSectionProps {
  luckyNumber: string
}

export const ResultSection = ({ luckyNumber }: ResultSectionProps) => {
  return (
    <section className={cn('py-12 sm:py-16 md:py-24 animate-fade-in-up px-4')}>
      <Card className="max-w-lg mx-auto text-center bg-primary shadow-soft">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">
            Parabéns, Seu Cadastro Foi Realizado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
          <p className="text-base sm:text-lg text-primary-foreground">
            Seu número da sorte exclusivo é:
          </p>
          <div className="bg-white/20 rounded-lg p-3 sm:p-4 inline-block">
            <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-widest font-display">
              {luckyNumber}
            </p>
          </div>
          <p className="text-sm sm:text-base text-primary-foreground pt-3 sm:pt-4">
            Fique atento ao seu WhatsApp e e-mail para novidades sobre o
            sorteio!
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
