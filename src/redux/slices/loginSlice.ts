import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LoginCredentials } from '../types/index.ts'

interface LoginState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: LoginState = { status: 'idle', error: null }

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    loginRequested: (state, _action: PayloadAction<LoginCredentials>) => {
      void _action.payload
      state.status = 'loading'
      state.error = null
    },
    loginSucceeded: (state) => {
      state.status = 'succeeded'
      state.error = null
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { loginRequested, loginSucceeded, loginFailed } = loginSlice.actions
export default loginSlice.reducer
