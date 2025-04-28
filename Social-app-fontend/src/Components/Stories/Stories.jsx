import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TextEllipse from "../../Utils/TextEllipse/TextEllipse";
import {
  getAllStoryByUserId,
  getStories,
  getStoryByFollowing,
} from "../../Service/storyApi";
import { useSelector } from "react-redux";

const Stories = () => {
  const [stories, setStories] = useState([]);
  const { userInfo } = useSelector((state) => state.login);

  const fetchStories = async () => {
    const response = await getStoryByFollowing(userInfo.id);
    setStories(response.data);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-[50vw] mb-4">
      <div className="w-full max-w-full h-[100px] flex items-center gap-x-6 bg-black overflow-x-auto px-4 ml-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {stories.map((item) => (
          <Link
            to={`/user/story/${item.id}`}
            key={item.id}
            className="flex items-center justify-center flex-col flex-shrink-0"
          >
            <div className="w-[70px] h-[70px] rounded-full object-cover p-[3px] bg-sky-700 hover:scale-105 transition-transform duration-200">
              <img
                src={
                  item.user?.userImage ||
                  "https://th.bing.com/th/id/OIP.1kk00EfkrBD32cR2_VxmMgHaE7?rs=1&pid=ImgDetMain"
                }
                alt="story img"
                className="rounded-full w-full h-full object-cover border-1 border-white"
              />
            </div>
            <TextEllipse username={item.user?.userNickname} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Stories;
