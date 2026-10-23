import type { SignupUser } from '../types/index.ts'

const AUTH_TOKEN_KEY = 'authToken'
const LOGGED_IN_USER_KEY = 'loggedInUser'

export type LoggedInUser = Omit<SignupUser, 'password'>

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getLoggedInUser(): LoggedInUser | null {
  if (!canUseStorage()) return null
  try {
    const value = window.localStorage.getItem(LOGGED_IN_USER_KEY)
    return value ? (JSON.parse(value) as LoggedInUser) : null
  } catch {
    return null
  }
}

export function saveAuthSession(user: SignupUser, token: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.removeItem('registeredUser')
  const loggedInUser: LoggedInUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImage: user.profileImage,
  }
  window.localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(loggedInUser))
}

export function saveLoggedInUser(user: SignupUser) {
  if (!canUseStorage()) return
  window.localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImage: user.profileImage,
  }))
}

export function getAuthToken() {
  return canUseStorage() ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

export function clearAuthSession() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(LOGGED_IN_USER_KEY)
}
