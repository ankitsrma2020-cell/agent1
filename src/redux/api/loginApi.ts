import type { LoginCredentials } from '../types/index.ts'
const AUTH_API_URL = 'http://localhost:5000/api/auth'

export type LoginResponse = {
  success: boolean
  message: string
  token: string
  user: { id: string; name: string; email: string; profileImage?: string }
}

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })

  const data = (await response.json()) as Partial<LoginResponse> & { message?: string }
  if (!response.ok || !data.token || !data.user) {
    throw new Error(data.message || 'Invalid email or password.')
  }
  return data as LoginResponse
}
