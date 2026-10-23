import { authenticatedFetch } from './authenticatedFetch.ts'

const AUTH_API_URL = 'http://localhost:5000/api/auth'

export type UserSortField = 'name' | 'email' | 'createdAt'
export type UserSortOrder = 'asc' | 'desc'

export type ManagedUser = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt?: string
}

export type UsersQuery = {
  sortBy: UserSortField
  order: UserSortOrder
}

type UsersResponse = {
  success: boolean
  users: ManagedUser[]
}

export async function usersApi({ sortBy, order }: UsersQuery): Promise<UsersResponse> {
  const params = new URLSearchParams({ sortBy, order })
  const response = await authenticatedFetch(`${AUTH_API_URL}/users?${params.toString()}`)
  const data = (await response.json()) as Partial<UsersResponse> & { message?: string }

  if (!response.ok || !Array.isArray(data.users)) {
    throw new Error(data.message || 'Unable to fetch users.')
  }

  return data as UsersResponse
}
