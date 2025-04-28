import instance from "../Utils/AxiosApi/Axios";

export const getCommentsByPostId = (postId) => instance.get(`comments/post/${postId}`);

export const addComment = (postId, userId, content) =>
  instance.post(`comments/post/${postId}/user/${userId}`, { content });