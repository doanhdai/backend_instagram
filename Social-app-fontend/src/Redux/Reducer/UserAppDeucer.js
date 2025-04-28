import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  userInfo: null,
  accessToken: "",
};

const userAppSlice = createSlice({
  name: "login",
  initialState,

  reducers: {
    userLoginData: (state, action) => {
      const { user, accessToken } = action.payload;
      state.isLoggedIn = true;
      state.userInfo = user;
      state.accessToken = accessToken;
    },

    userLogoutALL: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
      state.accessToken = "";
    },
  },
});

export const { userLoginData, userLogoutALL } = userAppSlice.actions;

export default userAppSlice.reducer;
