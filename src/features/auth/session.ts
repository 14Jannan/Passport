import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './api/authApi';

type SessionIssue = {
  kind: 'retry' | 'clear' | 'message';
  message: string;
};

type SignedInSession = { user: AuthUser; expiresAt: number };

export type SessionState =
  | { status: 'starting' | 'checking' }
  | { status: 'signedOut'; issue?: SessionIssue }
  | ({ status: 'signedIn' } & SignedInSession);

const session = createSlice({
  name: 'session',
  initialState: { status: 'starting' } as SessionState,
  reducers: {
    beginCheck: (): SessionState => ({ status: 'checking' }),
    signIn: (_state, action: PayloadAction<SignedInSession>): SessionState => ({
      status: 'signedIn',
      ...action.payload,
    }),
    leaveSession: (
      _state,
      action: PayloadAction<SessionIssue | undefined>,
    ): SessionState => ({
      status: 'signedOut',
      issue: action.payload,
    }),
  },
});

export const { beginCheck, signIn, leaveSession } = session.actions;
export const sessionReducer = session.reducer;
