import { authenticatedFetch } from './authenticatedFetch.ts'

const AUTH_API_URL = 'http://localhost:5000/api/auth'

export type ProfileUpdate = { name: string; email: string; profileImage?: string }

export type ProfileResponse = {
  success: boolean
  message: string
  user: { id: string; name: string; email: string; profileImage?: string }
}

export async function updateProfileApi(profile: ProfileUpdate): Promise<ProfileResponse> {
  const response = await authenticatedFetch(`${AUTH_API_URL}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: profile.name.trim(),
      email: profile.email.trim(),
      profileImage: profile.profileImage ?? '',
    }),
  })
  const responseBody = await response.text()
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Profile API returned a non-JSON response (${response.status}). Check that the backend is running on http://localhost:5000.`)
  }

  let data: Partial<ProfileResponse> & { message?: string }
  try {
    data = JSON.parse(responseBody) as Partial<ProfileResponse> & { message?: string }
  } catch {
    throw new Error('Profile API returned invalid JSON.')
  }

  if (!response.ok || !data.user) throw new Error(data.message || 'Unable to update profile.')
  return data as ProfileResponse
}
