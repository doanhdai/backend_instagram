import { data } from "autoprefixer";
import instance from "../Utils/AxiosApi/Axios";

const getAllPost = () => {
  return instance.get("/posts");
};
const getAllPostAdmin = () => {
  return instance.get("/posts/admin");
};
const handleGetAllPostByUserId = (id) => {
  return instance.get(`/posts/user/${id}`);
};

const handleCreatePost = (data) => {
  return instance.post("/posts", data);
};

export const handleLike = (id_post, id_user) => {
  return instance.post(`/posts/${id_post}/like?userId=${id_user}`);
};

const handleDeletePost = (id) => {
  return instance.delete(`/posts/${id}`);
};

const handleUpdatePost = (id) => {
  return instance.put(`/posts/${id}`);
};

const handleUpdateStatus = (data) => {
  return instance.put(`/posts/updateStatus`, data);
};

export const getPostByFollowing = (id) => {
  return instance.get(`/posts/following/${id}`);
}

export {
  handleGetAllPostByUserId,
  handleCreatePost,
  handleDeletePost,
  handleUpdatePost,
  getAllPost,
  getAllPostAdmin,
  handleUpdateStatus,
};
