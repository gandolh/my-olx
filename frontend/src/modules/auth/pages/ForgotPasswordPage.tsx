import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AuthCardShell } from '../components/AuthCardShell'
import { FormField } from '../components/FormField'
import { SubmitButton } from '../components/SubmitButton'
import { forgotSchema, type ForgotInput } from '../schemas'
import { useForgotPasswordMutation } from '../hooks/useForgotPasswordMutation'

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  })

  const forgotMutation = useForgotPasswordMutation()

  const onSubmit = (data: ForgotInput) => {
    forgotMutation.mutate(data.email)
  }

  return (
    <AuthCardShell
      title="Resetează parola"
      description="Introdu adresa ta de email pentru a primi instrucțiuni"
    >
      {forgotMutation.isSuccess ? (
        <div className="text-center">
          <span className="material-symbols-outlined text-tertiary mb-4" style={{ fontSize: '48px' }}>
            mark_email_read
          </span>
          <p className="text-on-surface mb-2 font-medium">
            Email trimis!
          </p>
          <p className="text-on-surface-variant text-sm mb-6">
            Dacă emailul există în sistemul nostru, vei primi un link de resetare a parolei.
            Verifică-ți inbox-ul și folderul de spam.
          </p>
          <Link
            to="/autentificare"
            className="inline-block px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
          >
            Înapoi la autentificare
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />

          {forgotMutation.isError && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm">
              A apărut o eroare. Te rugăm să încerci din nou.
            </div>
          )}

          <SubmitButton isLoading={forgotMutation.isPending}>
            Trimite link de resetare
          </SubmitButton>

          <p className="text-center text-sm text-on-surface-variant mt-4">
            Îți amintești parola?{' '}
            <Link to="/autentificare" className="text-primary font-medium hover:underline">
              Autentifică-te
            </Link>
          </p>
        </form>
      )}
    </AuthCardShell>
  )
}
