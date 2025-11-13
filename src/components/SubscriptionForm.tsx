import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useScrollObserver } from '@/hooks/use-scroll-observer'

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
)

const cpfRegex = /^[\d]{3}\.?[\d]{3}\.?[\d]{3}-?[\d]{2}$/

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório.' }),
  whatsapp: z
    .string()
    .regex(phoneRegex, 'Formato de WhatsApp inválido.')
    .min(10, { message: 'WhatsApp deve ter no mínimo 10 dígitos.' }),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  cpf: z
    .string()
    .min(1, { message: 'CPF é obrigatório.' })
    .regex(cpfRegex, 'Formato de CPF inválido. Use o formato XXX.XXX.XXX-XX'),
  quantidade_boloes: z
    .string()
    .min(1, { message: 'Quantidade de bolões é obrigatória.' })
    .refine((val) => {
      const num = parseInt(val)
      return !isNaN(num) && num >= 1 && num <= 100
    }, { message: 'Quantidade deve ser entre 1 e 100.' }),
})

const checkCpfSchema = z.object({
  cpf: z
    .string()
    .min(1, { message: 'CPF é obrigatório.' })
    .regex(cpfRegex, 'Formato de CPF inválido. Use o formato XXX.XXX.XXX-XX'),
})

type SubscriptionFormValues = z.infer<typeof formSchema>
type CheckCpfFormValues = z.infer<typeof checkCpfSchema>

interface SubscriptionFormProps {
  onSuccess: (luckyNumbers: string[], totalBoloes: number, ehPrimeiraCompra: boolean) => void
}

export const SubscriptionForm = ({ onSuccess }: SubscriptionFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [luckyNumberFound, setLuckyNumberFound] = useState<string | null>(null)
  const [showCheckForm, setShowCheckForm] = useState(true)
  const { toast } = useToast()
  const { ref, isVisible } = useScrollObserver({ threshold: 0.2 })

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      cpf: '',
      quantidade_boloes: '1',
    },
  })

  const checkForm = useForm<CheckCpfFormValues>({
    resolver: zodResolver(checkCpfSchema),
    defaultValues: {
      cpf: '',
    },
  })

  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/add-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Nota: Não tratamos mais 409 como erro, pois agora permitimos múltiplas compras
        
        throw new Error(errorData.message || 'Falha ao registrar. Tente novamente.')
      }

      const result = await response.json()

      const numerosSorte = result.numeros_sorte || (result.NumeroDaSorte ? [result.NumeroDaSorte] : [])
      const totalBoloes = result.total_boloes || numerosSorte.length
      const ehPrimeiraCompra = result.eh_primeira_compra !== false

      toast({
        title: 'Sucesso!',
        description: result.message || (ehPrimeiraCompra 
          ? 'Seu cadastro foi realizado.' 
          : 'Compra realizada com sucesso!'),
      })
      
      onSuccess(numerosSorte, totalBoloes, ehPrimeiraCompra)
      form.reset()
      
      // Ocultar formulário de consulta temporariamente
      setShowCheckForm(false)
      
      // Mostrar novamente após 30 segundos
      setTimeout(() => {
        setShowCheckForm(true)
      }, 30000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente mais tarde.'
      
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onCheckSubmit = async (data: CheckCpfFormValues) => {
    setIsChecking(true)
    setLuckyNumberFound(null)
    try {
      const response = await fetch('/api/check-lucky-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao consultar número da sorte.')
      }

      const result = await response.json()

      if (result.success) {
        if (result.numeros_sorte && result.numeros_sorte.length > 0) {
          setLuckyNumberFound(result.numeros_sorte.join(', '))
          toast({
            variant: 'success',
            title: 'Números encontrados!',
            description: `${result.total_numeros || result.numeros_sorte.length} número(s) da sorte encontrado(s)`,
          })
        } else if (result.numero_sorte) {
          // Compatibilidade com formato antigo
          setLuckyNumberFound(result.numero_sorte)
          toast({
            variant: 'success',
            title: 'Número encontrado!',
            description: `Seu número da sorte é: ${result.numero_sorte}`,
          })
        } else {
          // Participante encontrado mas sem números
          throw new Error(result.message || 'Participante encontrado, mas nenhum número da sorte cadastrado.')
        }
      } else {
        throw new Error(result.message || 'Número da sorte não encontrado.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao consultar número da sorte.'
      
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: errorMessage,
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section
      ref={ref}
      className={cn(
        'py-12 sm:py-16 md:py-24 transition-opacity duration-500 px-4',
        isVisible ? 'animate-fade-in-up' : 'opacity-0',
      )}
    >
      <div className="max-w-lg mx-auto space-y-6 sm:space-y-8">
        {/* Formulário de Cadastro */}
        <Card className="bg-white shadow-soft">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center font-bold">
              Garanta Seu Número da Sorte!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu Nome Completo"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(XX) XXXXX-XXXX"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu.email@exemplo.com"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="XXX.XXX.XXX-XX"
                          {...field}
                          className="h-12"
                          maxLength={14}
                          onChange={(e) => {
                            const value = e.target.value
                            // Remove tudo que não é número
                            const numbers = value.replace(/\D/g, '')
                            // Aplica a máscara XXX.XXX.XXX-XX
                            let masked = numbers
                            if (numbers.length > 3) {
                              masked = numbers.slice(0, 3) + '.' + numbers.slice(3)
                            }
                            if (numbers.length > 6) {
                              masked =
                                numbers.slice(0, 3) +
                                '.' +
                                numbers.slice(3, 6) +
                                '.' +
                                numbers.slice(6)
                            }
                            if (numbers.length > 9) {
                              masked =
                                numbers.slice(0, 3) +
                                '.' +
                                numbers.slice(3, 6) +
                                '.' +
                                numbers.slice(6, 9) +
                                '-' +
                                numbers.slice(9, 11)
                            }
                            field.onChange(masked)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantidade_boloes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Quantidade de Bolões
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione a quantidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} bolão{num > 1 ? 'ões' : ''}
                              </SelectItem>
                            ))}
                            {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} bolões
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Cada bolão gera um número da sorte único. Quanto mais bolões, maiores suas chances!
                      </p>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-green-700 text-lg font-bold transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Gerar Meu Número da Sorte'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Formulário de Consulta */}
        {showCheckForm && (
          <Card className="bg-white shadow-soft">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-center font-bold">
                CONSULTAR MEU NÚMERO DA SORTE
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <Form {...checkForm}>
              <form onSubmit={checkForm.handleSubmit(onCheckSubmit)} className="space-y-6">
                <FormField
                  control={checkForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="XXX.XXX.XXX-XX"
                          {...field}
                          className="h-12"
                          maxLength={14}
                          onChange={(e) => {
                            const value = e.target.value
                            // Remove tudo que não é número
                            const numbers = value.replace(/\D/g, '')
                            // Aplica a máscara XXX.XXX.XXX-XX
                            let masked = numbers
                            if (numbers.length > 3) {
                              masked = numbers.slice(0, 3) + '.' + numbers.slice(3)
                            }
                            if (numbers.length > 6) {
                              masked =
                                numbers.slice(0, 3) +
                                '.' +
                                numbers.slice(3, 6) +
                                '.' +
                                numbers.slice(6)
                            }
                            if (numbers.length > 9) {
                              masked =
                                numbers.slice(0, 3) +
                                '.' +
                                numbers.slice(3, 6) +
                                '.' +
                                numbers.slice(6, 9) +
                                '-' +
                                numbers.slice(9, 11)
                            }
                            field.onChange(masked)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {luckyNumberFound && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 text-center">
                    <p className="text-sm sm:text-base text-green-800 mb-4 font-semibold">
                      {luckyNumberFound.includes(',') ? 'Seus números da sorte são:' : 'Seu número da sorte é:'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {luckyNumberFound.split(', ').map((numero, index) => (
                        <div 
                          key={index}
                          className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-green-300 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:scale-105 overflow-hidden flex items-center justify-center min-h-[70px] sm:min-h-[90px]"
                        >
                          <p className="text-lg sm:text-xl md:text-2xl font-black text-green-900 tracking-wide font-display text-center break-words">
                            {numero.trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isChecking}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold transition-colors duration-200"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    'Consultar Número da Sorte'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        )}
      </div>
    </section>
  )
}
