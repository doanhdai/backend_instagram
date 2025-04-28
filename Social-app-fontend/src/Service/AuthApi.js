import instance from "../Utils/AxiosApi/Axios";

const userLogin = (data) => {
  return instance.post("/auth/login", {
    username: data.email,
    password: data.password,
  });
};

const userRegister = (data) => {
  return instance.post("/auth/register", {
    userFullname: data.fullname,
    userEmail: data.email,
    userPassword: data.password,
    userNickname: data.username,
  });
};

const UserLogOut = () => {
  return instance.post("/auth/logout");
};
export { userLogin, userRegister, UserLogOut };
