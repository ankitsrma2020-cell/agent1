import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ManagedUser, UserSortField, UserSortOrder, UsersQuery } from '../api/usersApi.ts'

type UsersState = {
  users: ManagedUser[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  sortBy: UserSortField
  order: UserSortOrder
}

const initialState: UsersState = {
  users: [],
  status: 'idle',
  error: null,
  sortBy: 'name',
  order: 'asc',
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    usersRequested: (state, action: PayloadAction<UsersQuery>) => {
      state.status = 'loading'
      state.error = null
      state.sortBy = action.payload.sortBy
      state.order = action.payload.order
    },
    usersSucceeded: (state, action: PayloadAction<ManagedUser[]>) => {
      state.status = 'succeeded'
      state.error = null
      state.users = action.payload
    },
    usersFailed: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { usersRequested, usersSucceeded, usersFailed } = usersSlice.actions
export default usersSlice.reducer
