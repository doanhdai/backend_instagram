import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Route from "../../Components/Routes/index";
import { FaCircle } from "react-icons/fa";
import {
  handleGetAllUser,
  handleGetFollowersByUser,
  handlePostFollower,
} from "../../Service/UserAPI";
import { useWebSocket } from "../../Utils/configCallVideo/websocket";
import { useTranslation } from "react-i18next";
import { set } from "lodash";

const RecommendUser = () => {
  const [userList, setUserList] = useState([]);
  const [listOfFollowers, setListOfFollowers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const userApp = useSelector((state) => state.login);
  const { sendFollowNotification } = useWebSocket();
  const [t] = useTranslation();

  useEffect(() => {
    fetchData();
  }, [listOfFollowers]);

  const fetchData = async () => {
    try {
      const usersResponse = await handleGetAllUser();
      const followersResponse = await handleGetFollowersByUser(userApp.userInfo.id);

      const allUsers = usersResponse.data;
      const followers = followersResponse.data;
      setListOfFollowers(followers);

      const followerIds = followers.map((item) => item.follower.id);
      const filteredUsers = allUsers.filter(
        (user) => user.id !== userApp.userInfo.id && !followerIds.includes(user.id)
      );

      setUserList(filteredUsers);
    } catch (error) {
      console.error("Lỗi khi fetch data:", error);
    }
  };

  const handleAddFollow = async (followedId) => {
    // Thêm người dùng vào danh sách đã follow ngay lập tức
    setFollowedUsers(prev => new Set([...prev, followedId]));
    
    try {
      const response = await handlePostFollower(userApp.userInfo.id, followedId);

      if (response.statusCode === 201 || response.statusCode === 200) {
        sendFollowNotification({ toUserId: String(followedId) });
        // Sau khi follow thành công, cập nhật lại danh sách
        const followersResponse = await handleGetFollowersByUser(userApp.userInfo.id);
        setListOfFollowers(followersResponse.data);
      }
    } catch (error) {
      // Nếu có lỗi, xóa người dùng khỏi danh sách đã follow
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(followedId);
        return newSet;
      });
      console.error("Lỗi khi follow:", error);
    }
  };

  return (
    <div className="lg:w-[20vw] w-full h-[80vh] p-3 mt-5 bg-black shadow-md border border-gray-800 rounded-md">
      <p className="text-white font-semibold mb-2">
        {t("RecommentUser.title")}
      </p>
      <Link
        to={Route.profile}
        className="w-full flex items-center gap-x-4 p-3 hover:bg-gray-800/60 rounded-md group"
      >
        <img
          src={userApp.userInfo?.avatar || ""}
          alt="Profile img"
          className="w-10 h-10 rounded-full object-cover"
          style={{ imageRendering: "crisp-edges" }}
        />
        <div className="flex flex-col">
          <p className="text-white font-semibold">
            {userApp.userInfo?.nikName}
          </p>
          <p className="text-white text-sm">{userApp.userInfo?.email}</p>
        </div>
      </Link>

      {/* Danh sách followers */}
      <div className="mt-4">
        {listOfFollowers.length > 0 && (
          <div className="flex justify-between px-3 mb-2">
            <p className="text-gray-500 font-bold text-sm">
              {t("RecommentUser.followers")}
            </p>
            <p className="text-white text-sm cursor-pointer hover:underline">
              {t("RecommentUser.seeAll")}
            </p>
          </div>
        )}
        <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {listOfFollowers.map((item) => (
            <Link
              key={item.follower.id}
              to={`${Route.friend_profile}/${item.follower.id}`}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-900 rounded-md group"
            >
              <div className="flex items-center gap-x-2">
                <img
                  src={item.follower.userImage}
                  alt={item.follower.userNickname}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-white">{item.follower.userNickname}</p>
              </div>
              {!item.friend && !followedUsers.has(item.follower.id) && (
                <button
                  className="text-blue-400 text-sm hover:text-blue-600 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddFollow(item.follower.id);
                  }}
                >
                  {t("RecommentUser.follow")}
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Danh sách gợi ý người dùng */}
      <div className="mt-5">
        {userList.length > 0 && (
          <div className="flex justify-between px-3 mb-2">
            <p className="text-gray-500 font-bold text-sm">
              {t("RecommentUser.suggestedForYou")}
            </p>
            <p className="text-white text-sm cursor-pointer hover:underline">
              {t("RecommentUser.seeAll")}
            </p>
          </div>
        )}
        <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {userList.map((item) => (
            <Link
              key={item.id}
              to={`${Route.friend_profile}/${item.id}`}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-900 rounded-md group"
            >
              <div className="flex items-center gap-x-4">
                <img
                  src={
                    item.userImage === null
                      ? "https://byvn.net/Eq9z"
                      : item.userImage
                  }
                  alt={item.userNickname}
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ imageRendering: "crisp-edges" }}
                />
                <p className="text-white">{item.userNickname}</p>
              </div>
              {!followedUsers.has(item.id) && (
                <button
                  className="text-blue-400 text-sm hover:text-blue-600 font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddFollow(item.id);
                  }}
                >
                  {t("RecommentUser.follow")}
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendUser;
