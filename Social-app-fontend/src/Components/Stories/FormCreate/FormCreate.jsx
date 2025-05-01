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
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [privacy, setPrivacy] = useState(privacyOptions[0].value);
  const { userInfo } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const [t] = useTranslation();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.warn("Vui lòng chọn ảnh!");

    const formData = new FormData();
    formData.append("userId", userInfo.id);
    formData.append("file", image);
    formData.append("access", privacy);
    formData.append("status", "1");

    try {
      const response = await createStory(formData);
      if (response?.statusCode === 200) {
        toast.success("Đăng story thành công!");
        setImage(null);
        setPreviewImage(null);
        setPrivacy(privacyOptions[0].value);
        navigate("/"); // hoặc nơi cần redirect
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
          <label className="block mb-1 text-sm">Hình ảnh</label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => document.getElementById("imageInput").click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Chọn ảnh
            </button>
          </div>

          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="border h-60 w-60 object-cover rounded-md"
          />
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
