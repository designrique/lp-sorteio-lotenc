import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ResultSectionProps {
  luckyNumbers: string[]
  totalBoloes: number
  ehPrimeiraCompra: boolean
}

export const ResultSection = ({ luckyNumbers, totalBoloes, ehPrimeiraCompra }: ResultSectionProps) => {
  const temMultiplosNumeros = luckyNumbers.length > 1

  return (
    <section className={cn('py-12 sm:py-16 md:py-24 animate-fade-in-up px-4')}>
      <Card className="max-w-2xl mx-auto text-center bg-primary shadow-soft">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">
            {ehPrimeiraCompra 
              ? 'Parabéns, Seu Cadastro Foi Realizado!'
              : 'Compra Realizada com Sucesso!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
          <p className="text-base sm:text-lg text-primary-foreground">
            {temMultiplosNumeros 
              ? `Seus ${luckyNumbers.length} números da sorte exclusivos são:`
              : 'Seu número da sorte exclusivo é:'}
          </p>
          
          {temMultiplosNumeros ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {luckyNumbers.map((numero, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-lg border-2 border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-200 hover:shadow-xl hover:scale-105 overflow-hidden flex items-center justify-center min-h-[80px] sm:min-h-[100px]"
                >
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-primary tracking-wide font-display text-center break-words">
                    {numero}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border-2 border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-200 inline-block">
              <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-primary tracking-widest font-display">
                {luckyNumbers[0]}
              </p>
            </div>
          )}

          {temMultiplosNumeros && (
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 mt-4">
              <p className="text-sm sm:text-base text-primary-foreground font-semibold">
                Total de bolões: {totalBoloes} | Chances aumentadas em {luckyNumbers.length}x!
              </p>
            </div>
          )}

          <p className="text-sm sm:text-base text-primary-foreground pt-3 sm:pt-4">
            Fique atento ao seu WhatsApp e e-mail para novidades sobre o
            sorteio!
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
