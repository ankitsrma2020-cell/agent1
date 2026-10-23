import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { isAuthenticated } from '../auth/storage.ts'
import type { ChangePasswordRequest } from '../api/changePasswordApi.ts'
import type { ProfileUpdate } from '../api/profileApi.ts'

export interface SignupUser {
  firstName: string
  lastName: string
  email: string
  password: string
  profileImage?: string
}

interface SignupState {
  user: SignupUser | null
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  profileStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  profileError: string | null
  passwordStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  passwordError: string | null
}

const initialState: SignupState = {
  user: null,
  isAuthenticated: isAuthenticated(),
  status: 'idle',
  error: null,
  profileStatus: 'idle',
  profileError: null,
  passwordStatus: 'idle',
  passwordError: null,
}

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    changePasswordRequested: (state, _action: PayloadAction<ChangePasswordRequest>) => {
      void _action.payload
      state.passwordStatus = 'loading'
      state.passwordError = null
    },
    changePasswordSucceeded: (state) => {
      state.passwordStatus = 'succeeded'
      state.passwordError = null
    },
    changePasswordFailed: (state, action: PayloadAction<string>) => {
      state.passwordStatus = 'failed'
      state.passwordError = action.payload
    },
    profileUpdateRequested: (state, _action: PayloadAction<ProfileUpdate>) => {
      void _action.payload
      state.profileStatus = 'loading'
      state.profileError = null
    },
    profileUpdated: (state, action: PayloadAction<SignupUser>) => {
      state.user = action.payload
      state.profileStatus = 'succeeded'
      state.profileError = null
    },
    profileUpdateFailed: (state, action: PayloadAction<string>) => {
      state.profileStatus = 'failed'
      state.profileError = action.payload
    },
    restoreSessionRequested: (state) => {
      state.error = null
    },
    sessionRestored: (state, action: PayloadAction<SignupUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    signupRequested: (state, _action: PayloadAction<SignupUser>) => {
      void _action.payload
      state.status = 'loading'
      state.error = null
    },
    signupSucceeded: (state, action: PayloadAction<SignupUser>) => {
      state.user = action.payload
      state.isAuthenticated = false
      state.status = 'succeeded'
      state.error = null
    },
    signupFailed: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const {
  restoreSessionRequested,
  sessionRestored,
  profileUpdateRequested,
  profileUpdated,
  profileUpdateFailed,
  changePasswordRequested,
  changePasswordSucceeded,
  changePasswordFailed,
  signupRequested,
  signupSucceeded,
  signupFailed,
} = signupSlice.actions
export default signupSlice.reducer
