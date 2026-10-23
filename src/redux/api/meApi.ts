import { authenticatedFetch } from './authenticatedFetch.ts'

const AUTH_API_URL = 'http://localhost:5000/api/auth'

et async function meApi(): Promise<CurrentUserResponse> {
  const response = await authenticatedFetch(`${AUTH_API_URL}/me`)
  const data = (await response.json()) as CurrentUserResponse & { message?: string }

  if (!response.ok) {
    throw new Error(data.message || 'Unable to fetch authenticated user.')
  }

  return data
}
