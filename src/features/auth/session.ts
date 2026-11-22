import { createSlice } from '@reduxjs/toolkit';

const session = createSlice({
  name: 'session',
  initialState: { isGuest: false },
  reducers: {
    enterAsGuest: state => {
      state.isGuest = true;
    },
    leaveSession: state => {
      state.isGuest = false;
    },
  },
});

export const { enterAsGuest, leaveSession } = session.actions;
export const sessionReducer = session.reducer;
