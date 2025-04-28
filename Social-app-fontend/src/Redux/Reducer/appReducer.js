import { createSlice } from "@reduxjs/toolkit";
const persistedLanguage = localStorage.getItem("language") || "vi";

const initialState = {
  started: true,
  language: persistedLanguage,
  contentOfConfirmModal: {},
};
const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    changeLanguageRedux: (state, action) => {
      localStorage.setItem("language", action.payload);
      state.language = action.payload;
    },
    changeUserProfile: (state, action) => {
      state.contentOfConfirmModal = action.payload;
    },
  },
});

export const { changeLanguageRedux, changeUserProfile } = appSlice.actions;
export default appSlice.reducer;
