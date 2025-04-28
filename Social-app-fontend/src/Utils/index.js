import { useTranslation } from "react-i18next";

export const formatTime = (dateString, t) => {
  const postDate = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now - postDate) / 36e5; // Chuyển đổi milliseconds thành giờ

  if (diffInHours < 24) {
    // Nếu trong vòng 24 giờ, hiển thị giờ
    const hours = Math.floor(diffInHours);
    if (hours === 0) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} ${t("newFed.phut")} `;
    }
    return `${hours}  ${t("newFed.Gio")}`;
  } else {
    // Nếu quá 24 giờ, hiển thị ngày
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return postDate.toLocaleDateString("vi-VN", options);
  }
};
