import { call, put, takeLatest } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { PayloadAction } from '@reduxjs/toolkit'
import { signupApi } from '../api/signupApi.ts'
import { loginApi } from '../api/loginApi.ts'
import { meApi } from '../api/meApi.ts'
import { updateProfileApi, type ProfileUpdate } from '../api/profileApi.ts'
import { changePasswordApi, type ChangePasswordRequest } from '../api/changePasswordApi.ts'
import { restoreSessionRequested, sessionRestored, profileUpdateRequested, profileUpdated, profileUpdateFailed, changePasswordRequested, changePasswordSucceeded, changePasswordFailed, signupFailed, signupRequested, signupSucceeded,} from '../slices/signupSlice.ts'
import { loginFailed, loginRequested, loginSucceeded } from '../slices/loginSlice.ts'
import { usersApi, type UsersQuery } from '../api/usersApi.ts'
import { usersFailed, usersRequested, usersSucceeded } from '../slices/usersSlice.ts'
import type { SignupUser } from '../types/index.ts'
import type { LoginCredentials } from '../types/index.ts'
import { clearAuthSession, saveAuthSession, saveLoggedInUser } from '../auth/storage.ts'

function toSignupUser(user: { name: string; email: string; profileImage?: string }): SignupUser {
  const [firstName = user.name, ...lastNameParts] = user.name.split(' ')
  return {
    firstName,
    lastName: lastNameParts.join(' '),
    email: user.email,
    password: '',
    profileImage: user.profileImage ?? '',
  }
}

function* profileUpdateWorker(action: PayloadAction<ProfileUpdate>): SagaIterator {
  try {
    const result = (yield call(updateProfileApi, action.payload)) as Awaited<ReturnType<typeof updateProfileApi>>
    const user = toSignupUser(result.user)
    saveLoggedInUser(user)
    yield put(profileUpdated(user))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile.'
    yield put(profileUpdateFailed(message))
  }
}

function* changePasswordWorker(action: PayloadAction<ChangePasswordRequest>): SagaIterator {
  try {
    yield call(changePasswordApi, action.payload)
    yield put(changePasswordSucceeded())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to change password.'
    yield put(changePasswordFailed(message))
  }
}

function* restoreSessionWorker(): SagaIterator {
  try {
    const result = (yield call(meApi)) as Awaited<ReturnType<typeof meApi>>
    yield put(sessionRestored(toSignupUser(result.user)))
  } catch {
    clearAuthSession()
    window.location.replace('/login')
  }
}

function* signupWorker(action: PayloadAction<SignupUser>): SagaIterator {
  try {
    yield call(signupApi, action.payload)
    yield put(signupSucceeded(action.payload))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account.'
    yield put(signupFailed(message))
  }
}

function* loginWorker(action: PayloadAction<LoginCredentials>): SagaIterator {
  try {
    const result = (yield call(loginApi, action.payload)) as Awaited<ReturnType<typeof loginApi>>
    const user = toSignupUser(result.user)
    saveAuthSession(user, result.token)
    yield put(loginSucceeded())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to log in.'
    yield put(loginFailed(message))
  }
}

function* usersWorker(action: PayloadAction<UsersQuery>): SagaIterator {
  try {
    const result = (yield call(usersApi, action.payload)) as Awaited<ReturnType<typeof usersApi>>
    yield put(usersSucceeded(result.users))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch users.'
    yield put(usersFailed(message))
  }
}

export function* rootSaga(): SagaIterator {
  yield takeLatest(restoreSessionRequested.type, restoreSessionWorker)
  yield takeLatest(profileUpdateRequested.type, profileUpdateWorker)
  yield takeLatest(changePasswordRequested.type, changePasswordWorker)
  yield takeLatest(signupRequested.type, signupWorker)
  yield takeLatest(loginRequested.type, loginWorker)
  yield takeLatest(usersRequested.type, usersWorker)
}
