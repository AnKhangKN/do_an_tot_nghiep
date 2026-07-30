import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  banned: false,
  banReason: null,
  bannedAt: null,
};

const banSlice = createSlice({
  name: "ban",
  initialState,
  reducers: {
    setBanned: (state, action) => {
      state.banned = true;
      state.banReason = action.payload.reason || null;
      state.bannedAt = action.payload.bannedAt || new Date().toISOString();
    },
    clearBanned: (state) => {
      state.banned = false;
      state.banReason = null;
      state.bannedAt = null;
    },
  },
});

export const { setBanned, clearBanned } = banSlice.actions;
export default banSlice.reducer;
