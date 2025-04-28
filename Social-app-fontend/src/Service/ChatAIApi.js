import instance from "../Utils/AxiosApi/Axios";
import store from "../Redux/store";

export const getChatAI = (data) => {
  const state = store.getState();
  const token = state.login?.accessToken; 

  const config = {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...(token && { Authorization: `Bearer ${token}` }), 
    },
  };

  return instance.post("/chat", data, config);
};