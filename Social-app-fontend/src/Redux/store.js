import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appreducer from "./Reducer/appReducer";
import storage from "redux-persist/lib/storage";
import UserAppDeucer from "./Reducer/UserAppDeucer";
import persistStore from "redux-persist/es/persistStore";
import persistReducer from "redux-persist/es/persistReducer";
import chatReducer from './Reducer/chatSlice';
const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  app: appreducer,
  login: UserAppDeucer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export const persistor = persistStore(store);
export default store;
