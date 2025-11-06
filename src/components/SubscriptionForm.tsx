import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
})

type SubscriptionFormValues = z.infer<typeof formSchema>

interface SubscriptionFormProps {
  onSuccess: (luckyNumber: string) => void
}

export const SubscriptionForm = ({ onSuccess }: SubscriptionFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { ref, isVisible } = useScrollObserver({ threshold: 0.2 })

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      cpf: '',
    },
  })

  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/.netlify/functions/add-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Falha ao registrar. Tente novamente.')
      }

      const result = await response.json()

      toast({
        title: 'Sucesso!',
        description: 'Seu cadastro foi realizado.',
      })
      onSuccess(result.NumeroDaSorte)
      form.reset()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description:
          'Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente mais tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      ref={ref}
      className={cn(
        'py-16 md:py-24 transition-opacity duration-500',
        isVisible ? 'animate-fade-in-up' : 'opacity-0',
      )}
    >
      <Card className="max-w-lg mx-auto bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-center font-bold">
            Garanta Seu Número da Sorte!
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    </section>
  )
}
