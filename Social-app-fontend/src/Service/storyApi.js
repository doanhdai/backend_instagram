import axios from "../Utils/AxiosApi/Axios";

export const getStories = async () => {
  const response = await axios.get("/stories");
  return response;
};

export const createStory = async (story) => {
  const response = await axios.post("/stories", story);
  return response;
};

export const getAllStoryByUserId = async (userId) => {
  const response = await axios.get(`/stories/user/${userId}`);
  return response;
};

export const deleteStory = async (storyId) => {
  const response = await axios.delete(`/stories/${storyId}`);
  return response;
};

export const getStoryByFollowing = async (userId) => {
  const response = await axios.get(`/stories/following/${userId}`);
  return response;
}


