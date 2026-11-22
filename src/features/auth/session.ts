import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './api/authApi';

export type SessionState =
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: AuthUser };

const session = createSlice({
  name: 'session',
  initialState: { status: 'signedOut' } as SessionState,
  reducers: {
    signIn: (_state, action: PayloadAction<AuthUser>): SessionState => ({
      status: 'signedIn',
      user: action.payload,
    }),
    leaveSession: (): SessionState => ({ status: 'signedOut' }),
  },
});

export const { signIn, leaveSession } = session.actions;
export const sessionReducer = session.reducer;
