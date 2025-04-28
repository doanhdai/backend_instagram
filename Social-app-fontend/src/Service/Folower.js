import instance from "../Utils/AxiosApi/Axios";

const handleGetAllFollower = (id) => {
  return instance.get(`/follow/followers/${id}`);
};

const handleGetAllFollowing = (id) => {
  return instance.get(`/follow/following/${id}`);
};

export { handleGetAllFollower, handleGetAllFollowing };
