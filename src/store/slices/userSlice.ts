import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types';

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  profile: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<UserProfile | undefined>) => {
      if (action.payload) {
        state.profile = action.payload;
      }
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
    clearUser: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserProfile, loginSuccess, logout, clearUser } = userSlice.actions;

export default userSlice.reducer;
