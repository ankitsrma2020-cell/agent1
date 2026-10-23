import type { SignupUser } from '../types/index.ts'
const AUTH_API_URL = 'http://localhost:5000/api/auth'

type SignupResponse = {
  success: boolean
  message: string
  user?: { id: string; name: string; email: string }
}

export async function signupApi(user: SignupUser): Promise<SignupResponse> {
  const response = await fetch(`${AUTH_API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${user.firstName.trim()} ${user.lastName.trim()}`.trim(),
      email: user.email.trim(),
      password: user.password,
    }),
  })

  const data = (await response.json()) as SignupResponse
  if (!response.ok) throw new Error(data.message || 'Unable to create account.')
  return data
}
