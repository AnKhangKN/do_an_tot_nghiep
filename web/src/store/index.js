import { configureStore } from '@reduxjs/toolkit'
import authReducer from './accessToken/accessTokenSlice'
import userReducer from './user/userSlice'
import banReducer from './ban/banSlice'
import kickedReducer from './kicked/kickedSlice'
import themeReducer from './theme/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ban: banReducer,
    kicked: kickedReducer,
    theme: themeReducer,
  },
})