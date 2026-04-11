import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter/counterSlice'
import authReducer from './accessToken/accessTokenSlice'
import userReducer from './user/userSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    user: userReducer,
  },
})