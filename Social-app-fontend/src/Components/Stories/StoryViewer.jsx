import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStories, deleteStory } from "../../Service/storyApi";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { IoIosMore, IoIosPause } from "react-icons/io";
import { IoVolumeMediumOutline } from "react-icons/io5";
import { AiOutlineHeart, AiOutlineSend } from "react-icons/ai";
import { LuSend } from "react-icons/lu";
const StoryViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const durationRef = useRef(10000);
  const [message, setMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const fetchStories = async () => {
    try {
      const response = await getStories();
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const parsedId = parseInt(id, 10);
  const currentStory = stories.find((story) => story.id === parsedId);
  console.log(id);
  console.log(currentStory);
  const isVideo =
    currentStory?.url?.endsWith(".mp4") || currentStory?.url?.endsWith(".mp3");

  useEffect(() => {
    if (stories.length > 0) {
      const index = stories.findIndex((story) => story.id === parsedId);
      setCurrentStoryIndex(index >= 0 ? index : 0);
    }
  }, [stories, parsedId]);

  useEffect(() => {
    if (!currentStory) return;

    let isCancelled = false;

    const startProgress = () => {
      startTimeRef.current = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progressPercent = (elapsed / durationRef.current) * 100;

        if (progressPercent >= 100) {
          setProgress(100);
          if (!isCancelled) {
            if (currentStoryIndex < stories.length - 1) {
              const nextStory = stories[currentStoryIndex + 1];
              navigate(`/user/story/${nextStory.id}`);
            } else {
              navigate("/user/home");
            }
          }
        } else {
          setProgress(progressPercent);
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isVideo && videoRef.current) {
      const handleLoadedMetadata = () => {
        const videoDuration = videoRef.current.duration * 1000 || 10000;
        durationRef.current = videoDuration;
        setProgress(0);
        startProgress();
      };

      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        isCancelled = true;
        cancelAnimationFrame(animationRef.current);
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    } else {
      durationRef.current = 10000;
      setProgress(0);
      startProgress();

      return () => {
        isCancelled = true;
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [currentStoryIndex, currentStory?.url]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      const prevStory = stories[currentStoryIndex - 1];
      navigate(`/user/story/${prevStory.id}`);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextStory = stories[currentStoryIndex + 1];
      navigate(`/user/story/${nextStory.id}`);
      setProgress(0);
    } else {
      navigate("/user/home");
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  if (!currentStory) {
    return <div className="text-white text-center">Loading...</div>;
  }
  const timeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffHour >= 1) return `${diffHour} giờ`;
    if (diffMin >= 1) return `${diffMin} phút`;
    return "Vừa xong";
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Tin nhắn đã gửi:", message); // Thay bằng logic gửi tin nhắn thực tế
      setMessage(""); // Reset ô nhập sau khi gửi
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    console.log("Đã thích story:", currentStory.id);
  };

  const handleDeleteStory = async () => {
    try {
      await deleteStory(currentStory.id);
      const updatedStories = stories.filter(
        (story) => story.id !== currentStory.id
      );
      setStories(updatedStories);

      if (updatedStories.length === 0) {
        navigate("/user/home");
      } else {
        const nextIndex =
          currentStoryIndex >= updatedStories.length
            ? currentStoryIndex - 1
            : currentStoryIndex;
        const nextStory = updatedStories[nextIndex];
        navigate(`/user/story/${nextStory.id}`);
      }

      setShowDeleteConfirm(false);
      setShowOptions(false);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1b1b1b] flex justify-center items-center z-50">
      {/* Container lớn hơn để chứa cả ảnh và các nút */}
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Container cho ảnh/video */}
        <div className="w-full max-w-[400px] h-full bg-black relative overflow-hidden rounded-lg">
          {/* Thanh tiến trình */}
          <div className="absolute top-3 left-1 right-1 flex gap-10">
            <div className="flex-1 h-[2px] bg-white/30 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-white transition-none"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
          <div className="absolute top-7 left-2 right-2 flex items-center justify-between text-white z-10">
            {/* Left: Avatar, nickname, time */}
            <div className="flex items-center gap-2">
              <img
                src={
                  currentStory.user?.userImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span>{currentStory.user?.userNickname || "Unknown"}</span>
                  <span className="text-xs font-normal opacity-70">
                    • {timeAgo(currentStory.createdAt)}
                  </span>
                </div>
                {currentStory.music && (
                  <div className="text-xs opacity-80">
                    <span className="font-semibold">
                      {currentStory.music.artist}
                    </span>{" "}
                    - {currentStory.music.title}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-3 text-xl">
              <button className="hover:opacity-70">
                <IoVolumeMediumOutline />
              </button>
              <button className="hover:opacity-70">
                <IoIosPause />
              </button>
              <div className="relative">
                <button
                  className="hover:opacity-70"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <IoIosMore />
                </button>

                {/* Options Menu */}
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Xóa Story
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media Story */}
          <div
            onClick={handleClose}
            className="flex justify-center items-center h-full"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentStory.url}
                className="w-[400px] h-auto object-contain"
                autoPlay
                muted
              />
            ) : (
              <img
                src={currentStory.url}
                alt="story"
                className="w-[400px] h-auto object-contain"
              />
            )}
          </div>

          {/* Khu vực gửi tin nhắn và nút Thích/Chia sẻ */}
          <div className="absolute bottom-4 left-2 right-2 flex items-center gap-2 z-10">
            {/* Ô nhập tin nhắn */}
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Trả lời..."
                className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
            </div>
            {/* Nút Thích */}
            <button
              onClick={handleLike}
              className={`text-xl ${
                isLiked ? "text-red-500" : "text-white"
              } hover:opacity-70`}
            >
              <AiOutlineHeart size={30} />
            </button>
            {/* Nút Chia sẻ */}
            <button className="text-xl text-white hover:opacity-70">
              <LuSend />
            </button>
          </div>
        </div>

        {/* Nút Previous - Đặt bên ngoài container ảnh, lùi sang trái */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-[calc(50%-220px)] top-1/2 transform -translate-y-1/2 -translate-x-full bg-white/30 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
        >
          <GrFormPrevious />
        </button>

        {/* Nút Next - Đặt bên ngoài container ảnh, lùi sang phải */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-[calc(50%-220px)] top-1/2 transform -translate-y-1/2 translate-x-full bg-white/30 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
        >
          <GrFormNext />
        </button>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
              <p className="mb-6">Bạn có chắc chắn muốn xóa story này?</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={handleDeleteStory}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
