import instance from "../Utils/AxiosApi/Axios";

const handleEditProfile = (data) => {
  return instance.put("/user", data);
};
const handleGetAllUser = () => {
  return instance.get("/user/all");
};

const handleDeleteUser = (id) => {
  return instance.delete(`/user/${id}`);
};

const handleCreateUser = (data) => {
  return instance.post("/user", data);
};
const handleGetById = (id) => {
  return instance.get(`/user/${id}`);
};
const handleGetFollowingByUser = (id) => {
  return instance.get(`/follow/following/${id}`);
};

const handleGetFollowersByUser = (id) => {
  return instance.get(`/follow/followers/${id}`);
};

const handlePostFollower = (currUserId, followedUserId) => {
  return instance.post(
    `/follow/create?followerId=${currUserId}&followingId=${followedUserId}`
  );
};

const handlePostUnfollower = (currUserId, followedUserId) => {
  return instance.post(
    `/follow/unfollow?followerId=${currUserId}&followingId=${followedUserId}`
  );
};
const handleGetUserById = (id) => {
  return instance.get(`/stats/${id}`);
};



export {
  handleEditProfile,
  handleGetAllUser,
  handleDeleteUser,
  handleCreateUser,
  handleGetFollowingByUser,
  handleGetFollowersByUser,
  handlePostFollower,
  handlePostUnfollower,
  handleGetUserById,
  handleGetById,
};
