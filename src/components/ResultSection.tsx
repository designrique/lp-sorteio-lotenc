import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ResultSectionProps {
  luckyNumber: string
}

export const ResultSection = ({ luckyNumber }: ResultSectionProps) => {
  return (
    <section className={cn('py-16 md:py-24 animate-fade-in-up')}>
      <Card className="max-w-lg mx-auto text-center bg-primary shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary-foreground">
            Parabéns, Seu Cadastro Foi Realizado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-primary-foreground">
            Seu número da sorte exclusivo é:
          </p>
          <div className="bg-white/20 rounded-lg p-4 inline-block">
            <p className="text-5xl md:text-7xl font-black text-white tracking-widest font-display">
              {luckyNumber}
            </p>
          </div>
          <p className="text-base text-primary-foreground pt-4">
            Fique atento ao seu WhatsApp e e-mail para novidades sobre o
            sorteio!
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
