import { authenticatedFetch } from './authenticatedFetch.ts'

const AUTH_API_URL = 'http://localhost:5000/api/auth'


export async function changePasswordApi(
  passwords: ChangePasswordRequest,
): Promise<{ success: boolean; message: string }> {
  const response = await authenticatedFetch(`${AUTH_API_URL}/change-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwords),
  })
  const data = (await response.json()) as { success: boolean; message: string }
  if (!response.ok) throw new Error(data.message || 'Unable to change password.')
  return data
}
