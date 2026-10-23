import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signupRequested } from '../redux/actions/index.ts'
import type { RootState, SignupUser, AppDispatch } from '../redux/types/index.ts'
import './Signup.css'

type FormField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword'
type FormValues = SignupUser & { confirmPassword: string }
type FormErrors = Partial<Record<FormField, string>>

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Signup() {
  const dispatch = useDispatch<AppDispatch>()
  const { status, error } = useSelector((state: RootState) => state.signup)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (status === 'succeeded') {
      window.location.assign('/login')
    }
  }, [status])

  const validate = () => {
    const nextErrors: FormErrors = {}
    const requiredFields: Array<FormField> = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ]

    requiredFields.forEach((field) => {
      if (!values[field].trim()) nextErrors[field] = 'This field is required.'
    })

    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (values.password && values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (
      values.confirmPassword &&
      values.password !== values.confirmPassword
    ) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const handleChange = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const user: SignupUser = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    }
    dispatch(signupRequested(user))
  }

  return (
    <main className="signup-page">
      <section className="signup-card" aria-labelledby="signup-title">
        <div className="signup-heading">
          <h2 id="signup-title">Sign up</h2>
          <p>Enter your details to get started.</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-name-fields">
            <SignupField label="First Name" name="firstName" value={values.firstName} error={errors.firstName} onChange={handleChange} />
            <SignupField label="Last Name" name="lastName" value={values.lastName} error={errors.lastName} onChange={handleChange} />
          </div>
          <SignupField label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={handleChange} />
          <PasswordField label="Password" name="password" value={values.password} error={errors.password} visible={showPassword} onChange={handleChange} onToggle={() => setShowPassword((visible) => !visible)} />
          <PasswordField label="Confirm Password" name="confirmPassword" value={values.confirmPassword} error={errors.confirmPassword} visible={showConfirmPassword} onChange={handleChange} onToggle={() => setShowConfirmPassword((visible) => !visible)} />
          <button className="signup-submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
          {error && <p className="signup-api-error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  )
}

type FieldProps = {
  label: string
  name: FormField
  value: string
  error?: string
  type?: string
  onChange: (field: FormField, value: string) => void
}

function SignupField({ label, name, value, error, type = 'text', onChange }: FieldProps) {
  const inputId = `signup-${name}`
  return (
    <div className="signup-field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} />
      {error && <span className="signup-error" id={`${inputId}-error`}>{error}</span>}
    </div>
  )
}

function PasswordField({ label, name, value, error, visible, onChange, onToggle }: FieldProps & { visible: boolean; onToggle: () => void }) {
  const inputId = `signup-${name}`
  return (
    <div className="signup-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="signup-password-input">
        <input id={inputId} name={name} type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(name, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} />
        <button className="signup-eye" type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? '◉' : '◌'}
        </button>
      </div>
      {error && <span className="signup-error" id={`${inputId}-error`}>{error}</span>}
    </div>
  )
}

export default Signup
