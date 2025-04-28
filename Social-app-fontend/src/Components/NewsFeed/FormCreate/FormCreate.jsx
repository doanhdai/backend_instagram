import React, { useState, useEffect } from "react";
import { handleCreatePost } from "../../../Service/postApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const privacyOptions = [
  { value: "PUBLIC", label: "Công khai" },
  { value: "ONLY_FRIEND", label: "Bạn bè" },
  { value: "PRIVATE", label: "Chỉ mình tôi" },
];

const FormNewsFeed = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [privacy, setPrivacy] = useState(privacyOptions[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.login);
  const { t } = useTranslation();

  // Clean up URL object khi component unmount hoặc khi media thay đổi
  useEffect(() => {
    return () => {
      if (previewMedia) {
        URL.revokeObjectURL(previewMedia);
      }
    };
  }, [previewMedia]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);

    if (file) {
      const mediaUrl = URL.createObjectURL(file);
      setPreviewMedia(mediaUrl);
      // Kiểm tra loại file dựa trên MIME type hoặc đuôi file
      setIsVideo(file.type.startsWith("video/") || file.name.endsWith(".mp4"));
    } else {
      setPreviewMedia(null);
      setIsVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", content);
      formData.append("access", privacy);
      formData.append("status", "True");
      formData.append("userId", userInfo.id);
      if (media) formData.append("media", media);

      const response = await handleCreatePost(formData);
      if (response.statusCode === 200) {
        toast.success("Đăng bài thành công!");
        setContent("");
        setMedia(null);
        setPreviewMedia(null);
        setIsVideo(false);
        setPrivacy(privacyOptions[0].value);
      } else {
        toast.error("Đăng bài thất bại!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng bài!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] p-6 bg-[#0e0e0e] text-white rounded-2xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {t("CreateNew.createNewsfeed")}
        </h2>
        <select
          id="privacy"
          className="bg-[#1a1a1a] text-white border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
        >
          {privacyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full h-32 bg-[#1a1a1a] border border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("CreateNew.caption")}
          required
        />

        <button
          type="button"
          className="bg-blue-600 rounded-lg text-white hover:bg-blue-700 px-4 py-2 transition"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {t("manageUser.chooseAvatar")}{" "}
          {/* Có thể đổi thành "Chọn ảnh hoặc video" */}
        </button>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          accept="image/*,video/mp4" // Hỗ trợ cả ảnh và video MP4
          onChange={handleMediaChange}
        />

        {previewMedia && (
          <div className="border rounded-md w-60 h-60 overflow-hidden">
            {isVideo ? (
              <video
                src={previewMedia}
                className="w-full h-full object-cover"
                controls
                muted
              >
                <source src={previewMedia} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={previewMedia}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        <button
          type="submit"
          className={`w-full text-center py-2 rounded-xl font-semibold transition duration-200 ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? t("CreateNew.loading") : t("CreatcreateeNew.")}
        </button>
      </form>
    </div>
  );
};

export default FormNewsFeed;
