import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStories, deleteStory } from "../../Service/storyApi";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { IoIosMore, IoIosPause, IoIosPlay } from "react-icons/io";
import { IoVolumeMediumOutline, IoVolumeMuteOutline } from "react-icons/io5";
import { AiOutlineHeart } from "react-icons/ai";
import { LuSend } from "react-icons/lu";

const StoryViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const durationRef = useRef(10000);
  const savedProgressRef = useRef(0);

  const parsedId = Number(id);

  const fetchStories = async () => {
    try {
      const { data } = await getStories();
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const currentStory = stories.find((story) => story.id === parsedId);
  const isVideo =
    currentStory?.url?.endsWith(".mp4") || currentStory?.url?.endsWith(".mp3");

  useEffect(() => {
    if (!stories.length) return;
    const index = stories.findIndex((story) => story.id === parsedId);
    setCurrentStoryIndex(index >= 0 ? index : 0);
  }, [stories, parsedId]);

  useEffect(() => {
    if (!currentStory) return;
    let isCancelled = false;

    const startProgress = () => {
      if (isPaused) {
        if (!isVideo) {
          savedProgressRef.current = progress;
        }
        cancelAnimationFrame(animationRef.current);
        return;
      }

      const animate = () => {
        if (isPaused || isCancelled) return;

        let progressPercent;
        if (isVideo && videoRef.current) {
          progressPercent =
            (videoRef.current.currentTime / videoRef.current.duration) * 100;
        } else {
          const elapsed = Date.now() - (startTimeRef.current || Date.now());
          const remainingTime =
            durationRef.current * (1 - savedProgressRef.current / 100);
          progressPercent =
            savedProgressRef.current +
            (elapsed / remainingTime) * (100 - savedProgressRef.current);
        }

        if (progressPercent >= 100) {
          setProgress(100);
          if (!isCancelled) {
            if (currentStoryIndex < stories.length - 1) {
              navigate(`/user/story/${stories[currentStoryIndex + 1].id}`);
            } else {
              navigate("/user/home");
            }
          }
        } else {
          setProgress(progressPercent);
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      if (!isVideo) {
        startTimeRef.current = Date.now();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    let startTimeRef = { current: null };

    if (isVideo && videoRef.current) {
      const handleLoadedMetadata = () => {
        const videoDuration = (videoRef.current?.duration || 10) * 1000;
        durationRef.current = videoDuration;
        setProgress(0);
        savedProgressRef.current = 0;
        if (!isPaused) startProgress();
      };

      videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        isCancelled = true;
        cancelAnimationFrame(animationRef.current);
        videoRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    } else {
      durationRef.current = 10000;
      setProgress(savedProgressRef.current);
      if (!isPaused) startProgress();

      return () => {
        isCancelled = true;
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [
    currentStoryIndex,
    currentStory?.url,
    navigate,
    stories,
    isPaused,
    isVideo,
  ]);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
      videoRef.current.muted = isMuted;
    }
  }, [isPaused, isMuted, isVideo]);

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      navigate(`/user/story/${stories[currentStoryIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      navigate(`/user/story/${stories[currentStoryIndex + 1].id}`);
    } else {
      navigate("/user/home");
    }
  };

  const handleClose = () => navigate("/");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Tin nhắn đã gửi:", message);
      setMessage("");
    }
  };

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    console.log("Đã thích story:", currentStory.id);
  };

  const handleDeleteStory = async () => {
    if (!currentStory) return;
    try {
      await deleteStory(currentStory.id);
      const updatedStories = stories.filter(
        (story) => story.id !== currentStory.id
      );
      setStories(updatedStories);
      setShowDeleteConfirm(false);
      setShowOptions(false);

      if (updatedStories.length) {
        const nextStory =
          updatedStories[
            Math.min(currentStoryIndex, updatedStories.length - 1)
          ];
        navigate(`/user/story/${nextStory.id}`);
      } else {
        navigate("/user/home");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffHour >= 1) return `${diffHour} giờ trước`;
    if (diffMin >= 1) return `${diffMin} phút trước`;
    return "Vừa xong";
  };

  if (!currentStory) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-[#1b1b1b] flex justify-center items-center z-50">
      <div className="relative flex items-center justify-center w-full h-full">
        <div className="w-full max-w-[400px] h-full bg-black relative overflow-hidden rounded-lg">
          {/* Progress Bar */}
          <div className="absolute top-3 left-1 right-1 flex gap-10">
            <div className="flex-1 h-[2px] bg-white/30 relative">
              <div
                className="absolute top-0 left-0 h-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="absolute top-7 left-2 right-2 flex items-center justify-between text-white z-10">
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
                  <span className="text-xs opacity-70">
                    • {timeAgo(currentStory.createdAt)}
                  </span>
                </div>
                {currentStory.music && (
                  <div className="text-xs opacity-80">
                    <strong>{currentStory.music.artist}</strong> -{" "}
                    {currentStory.music.title}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xl">
              <button onClick={handleMuteToggle} className="hover:opacity-70">
                {isMuted ? <IoVolumeMuteOutline /> : <IoVolumeMediumOutline />}
              </button>
              <button onClick={handlePauseToggle} className="hover:opacity-70">
                {isPaused ? <IoIosPlay /> : <IoIosPause />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowOptions((prev) => !prev)}
                  className="hover:opacity-70"
                >
                  <IoIosMore />
                </button>
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Xóa Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media */}
          <div
            onClick={handleClose}
            className="flex justify-center items-center h-full"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentStory.url}
                className="w-[400px] h-auto object-contain"
                autoPlay={!isPaused}
                muted={isMuted}
              />
            ) : (
              <img
                src={currentStory.url}
                alt="story"
                className="w-[400px] h-auto object-contain"
              />
            )}
          </div>

          {/* Input & Actions */}
          <div className="absolute bottom-4 left-2 right-2 flex items-center gap-2 z-10">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Trả lời..."
              className="flex-1 px-3 py-2 bg-transparent border border-white/30 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/50"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleLike}
              className={`text-xl ${
                isLiked ? "text-red-500" : "text-white"
              } hover:opacity-70`}
            >
              <AiOutlineHeart size={30} />
            </button>
            <button className="text-xl text-white hover:opacity-70">
              <LuSend />
            </button>
          </div>
        </div>

        {/* Previous/Next Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-[calc(50%-220px)] top-1/2 transform -translate-y-1/2 -translate-x-full bg-white/30 text-white p-1 rounded-full hover:bg-opacity-75"
        >
          <GrFormPrevious />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-[calc(50%-220px)] top-1/2 transform -translate-y-1/2 translate-x-full bg-white/30 text-white p-1 rounded-full hover:bg-opacity-75"
        >
          <GrFormNext />
        </button>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-lg font-semibold mb-4">
                Bạn có chắc muốn xóa story này không?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDeleteStory}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Hủy
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
