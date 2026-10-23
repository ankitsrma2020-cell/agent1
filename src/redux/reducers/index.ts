import signupReducer from '../slices/signupSlice.ts'
import loginReducer from '../slices/loginSlice.ts'
import usersReducer from '../slices/usersSlice.ts'

export const reducers = {
  signup: signupReducer,
  login: loginReducer,
  users: usersReducer,
}
