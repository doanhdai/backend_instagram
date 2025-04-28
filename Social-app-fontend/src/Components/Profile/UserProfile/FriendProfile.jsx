import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleGetUserById } from "../../../Service/UserAPI";
import { handleGetAllPostByUserId } from "../../../Service/postApi";
import { getAllStoryByUserId } from "../../../Service/storyApi";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ModalCart from "../../NewsFeed/NewsFeedCart/ModalCart/ModalCart";

const FriendProfile = () => {
  const { id } = useParams();
  const [dataUser, setDataUser] = useState({});
  const [dataStory, setDataStory] = useState([]);
  const [dataPost, setDataPost] = useState([]);
  const [t] = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  useEffect(() => {
    fectDataUserbyId();
    fectDataStory();
    fectDataPost();
  }, [id]);

  const fectDataUserbyId = async () => {
    let res = await handleGetUserById(id);
    if (res.statusCode === 200 && res.data) {
      setDataUser(res.data);
    }
  };

  const fectDataStory = async () => {
    let res = await getAllStoryByUserId(id);
    if (res.statusCode === 200 && res.data) {
      setDataStory(res.data);
    }
  };

  const fectDataPost = async () => {
    let res = await handleGetAllPostByUserId(id);
    if (res.statusCode === 200 && res.data) {
      setDataPost(res.data);
    }
  };
  return (
    <div className="bg-black text-white min-h-screen px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={dataUser.avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
          />
        </div>
        <div>
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">{dataUser.username}</h2>
            <button className="bg-blue-500 px-4 py-1 rounded text-white text-sm">
              Theo dõi
            </button>
          </div>
          <div className="flex space-x-6 mt-2 text-sm">
            <span>
              <strong>{dataUser.postsCount}</strong> {t("userProfile.posts")}
            </span>
            <span>
              <strong className="cursor-pointer">
                {dataUser.followersCount}
              </strong>{" "}
              {t("userProfile.followers")}
            </span>
            <span className="cursor-pointer">
              <strong>{dataUser.followingCount}</strong>{" "}
              {t("userProfile.following")}
            </span>
          </div>
          <div className="mt-1 text-sm">✨ {dataUser.bio} ✨</div>
        </div>
      </div>

      {/* Story Highlights */}
      <div className="flex space-x-4 mt-6 cursor-pointer">
        {dataStory.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-xs"
            onClick={() => {
              navigate(`/user/story/${item.id}`);
            }}
          >
            <img
              src={item.url}
              alt="Story"
              className="w-16 h-16 rounded-full border"
            />
            <span className="mt-1">{t("userProfile.storyHighlights")}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-t border-gray-700 pt-2">
        <button className="mx-4 font-semibold border-b-2 border-white pb-1">
          {t("userProfile.posts")}
        </button>
        <button className="mx-4 text-gray-400">
          {t("userProfile.tagged")}
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 mt-2 cursor-pointer">
        {dataPost?.map((item, index) =>
          item?.media?.map((mediaItem, mediaIndex) => (
            <div
              key={`${index}-${mediaIndex}`}
              className="relative group w-full h-70 overflow-hidden "
              onClick={() => {
                setSelectedPost(item);
                setIsOpen(true);
              }}
            >
              <img
                src={mediaItem.url}
                alt="Post"
                className="w-full h-full object-cover"
              />

              {/* Overlay hiển thị khi hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <div className="flex gap-4 text-white text-lg font-semibold">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                  4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 
                  14.76 3 16.5 3 19.58 3 22 5.42 
                  22 8.5c0 3.78-3.4 6.86-8.55 
                  11.54L12 21.35z"
                      />
                    </svg>
                    <span>{item.commentsLikes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20 2H4a2 2 0 00-2 
                  2v20l4-4h14a2 2 0 002-2V4a2 
                  2 0 00-2-2z"
                      />
                    </svg>
                    <span>{item.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ModalCart
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        post={selectedPost}
        // comments={comments[selectedPost?.id] || []}
      />
    </div>
  );
};

export default FriendProfile;
