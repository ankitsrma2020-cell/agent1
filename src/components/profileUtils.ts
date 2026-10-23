import type { SignupUser } from '../redux/slices/signupSlice.ts'

export function getUserDisplayName(user: SignupUser | null) {
  return user ? `${user.firstName} ${user.lastName}`.trim() : 'Your account'
}

export function getUserInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'
}
