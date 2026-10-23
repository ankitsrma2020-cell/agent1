import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginRequested } from '../redux/actions/index.ts'
import { Eye, EyeOff } from 'lucide-react'
import type { AppDispatch, LoginCredentials, RootState } from '../redux/types/index.ts'
import './Signup.css'

type LoginField = 'email' | 'password'
type LoginErrors = Partial<Record<LoginField, string>>

function Login() {
  const dispatch = useDispatch<AppDispatch>()
  const { status, error } = useSelector((state: RootState) => state.login)
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'succeeded') window.location.replace('/dashboard')
  }, [status])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: LoginErrors = {}
    if (!values.email.trim()) nextErrors.email = 'This field is required.'
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!values.password.trim()) nextErrors.password = 'This field is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) dispatch(loginRequested(values))
  }

  return (
    <main className="signup-page">
      <section className="signup-card" aria-labelledby="login-title">
        <div className="signup-heading">
          <h2 id="login-title">Log in</h2>
          <p>Enter your details to continue.</p>
        </div>
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <LoginField label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={(value) => setValues({ ...values, email: value })} />
          <div className="signup-field">
            <label htmlFor="login-password">Password</label>
            <div className="signup-password-input">
              <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} aria-invalid={Boolean(errors.password)} />
              <button className="signup-eye" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="signup-error">{errors.password}</span>}
          </div>
          <button className="signup-submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in...' : 'Log in'}
          </button>
          {status === 'succeeded' && <p className="signup-success" role="status">Login successful.</p>}
          {error && <p className="signup-api-error" role="alert">{error}</p>}
          <p className="signup-switch">New here? <a href="/signup">Create an account</a></p>
        </form>
      </section>
    </main>
  )
}

type LoginFieldProps = {
  label: string
  name: LoginField
  type?: string
  value: string
  error?: string
  onChange: (value: string) => void
}

function LoginField({ label, name, type = 'text', value, error, onChange }: LoginFieldProps) {
  const inputId = `login-${name}`
  return <div className="signup-field">
    <label htmlFor={inputId}>{label}</label>
    <input id={inputId} name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />
    {error && <span className="signup-error">{error}</span>}
  </div>
}

export default Login
