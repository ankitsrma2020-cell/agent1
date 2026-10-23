export type { RootState, AppDispatch } from '../store/index.ts'
export type { SignupUser } from '../slices/signupSlice.ts'
export interface LoginCredentials {
  email: string
  password: string
}
