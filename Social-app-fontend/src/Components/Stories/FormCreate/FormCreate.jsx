import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStory } from "../../../Service/storyApi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const privacyOptions = [
  { value: "PUBLIC", label: "Công khai" },
  { value: "ONLY_FRIEND", label: "Bạn bè" },
  { value: "PRIVATE", label: "Chỉ mình tôi" },
];

const FormCreateStory = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(""); // NEW: track loại file
  const [privacy, setPrivacy] = useState(privacyOptions[0].value);
  const { userInfo } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const [t] = useTranslation();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      setFileType("");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));

    // Kiểm tra loại file
    if (selectedFile.type.startsWith("image/")) {
      setFileType("image");
    } else if (selectedFile.type.startsWith("video/")) {
      setFileType("video");
    } else {
      toast.error("Chỉ chấp nhận file ảnh hoặc video!");
      setFile(null);
      setPreviewUrl(null);
      setFileType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warn("Vui lòng chọn ảnh hoặc video!");

    const formData = new FormData();
    formData.append("userId", userInfo.id);
    formData.append("file", file);
    formData.append("access", privacy);
    formData.append("status", "1");

    try {
      const response = await createStory(formData);
      if (response?.statusCode === 200) {
        toast.success("Đăng story thành công!");
        setFile(null);
        setPreviewUrl(null);
        setPrivacy(privacyOptions[0].value);
        navigate("/");
      } else {
        toast.error("Đăng story thất bại!");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Có lỗi xảy ra khi đăng story!");
    }
  };

  return (
    <div className="w-[600px] h-auto px-6 py-4 bg-[#0e0e0e] text-white shadow-md border border-gray-700 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Đăng Story Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm">Hình ảnh hoặc Video</label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Chọn tệp
            </button>
          </div>

          <input
            type="file"
            id="fileInput"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Preview ảnh hoặc video */}
        {previewUrl && (
          <div className="border rounded-md overflow-hidden">
            {fileType === "image" && (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-60 w-60 object-cover"
              />
            )}
            {fileType === "video" && (
              <video
                src={previewUrl}
                controls
                className="h-60 w-60 object-cover"
              />
            )}
          </div>
        )}

        <div>
          <label htmlFor="privacy" className="block mb-1 text-sm">
            Quyền riêng tư
          </label>
          <select
            id="privacy"
            className="w-full px-3 py-2 bg-[#1a1a1a] text-white border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
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

        <button
          type="submit"
          className="w-full mt-2 rounded-lg border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold py-2 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
        >
          {t("CreateNew.create") || "Đăng Story"}
        </button>
      </form>
    </div>
  );
};

export default FormCreateStory;