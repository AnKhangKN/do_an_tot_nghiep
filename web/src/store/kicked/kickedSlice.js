import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  kicked: false,
  kickedMessage: null,
};

const kickedSlice = createSlice({
  name: "kicked",
  initialState,
  reducers: {
    setKicked: (state, action) => {
      state.kicked = true;
      state.kickedMessage = action.payload?.message || null;
    },
    clearKicked: (state) => {
      state.kicked = false;
      state.kickedMessage = null;
    },
  },
});

export const { setKicked, clearKicked } = kickedSlice.actions;
export default kickedSlice.reducer;
