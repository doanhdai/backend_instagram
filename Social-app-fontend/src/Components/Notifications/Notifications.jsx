import React, { useState, useEffect } from "react";
import { handlePostFollower } from "../../Service/UserAPI";
// import webSocketService from "../../Service/WebSocketService";
import notificationSocket from "../../Service/NotificationSocket";
import {
  fetchAllNotifications,
  fetchAllNotificationsbyUser,
} from "../../Service/notificationApi";
import { useDispatch, useSelector } from "react-redux";
import { useWebSocket } from "../../Utils/configCallVideo/websocket";
import { formatTime } from "../../Utils";
import { useTranslation } from "react-i18next";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const { userInfo } = useSelector((state) => state.login);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllNotificationsbyUser(userInfo.id);
        // const response = await fetchAllNotifications();
        setNotifications(response.data);
        console.log(userInfo.id);
        // console.log(response)
        console.log("Notification response:", response.data);
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const markAsRead = async (notificationId) => {
    // try {
    //   await instance.put(`/api/v1/notification/${notificationId}/read`);
    //   setNotifications((prev) =>
    //     prev.map((n) =>
    //       n.notificationId === notificationId ? { ...n, isRead: true } : n
    //     )
    //   );
    //   console.log("Marked notification as read:", notificationId);
    // } catch (error) {
    //   console.error("Error marking notification as read:", error);
    //   toast.error("Không thể đánh dấu thông báo đã đọc!");
    // }
  };

  useEffect(() => {
    if (!userInfo?.id) return;

    notificationSocket.init(dispatch, userInfo.id);

    notificationSocket.subscribeToNotifications((notification) => {
      // console.log("Received real-time notification:", notification);
      // notificationSocket.subscribeToLikeUpdates((data) => {
      //   setNotifications((prev) => {
      //     // Tránh trùng lặp theo notificationId
      //     if (prev.some((n) => n.notificationId === data.notificationId)) {
      //       return prev;
      //     }
      //     return [data, ...prev];
      //   });
      // });
      setNotifications((prev) => {
        // Ngăn trùng lặp dựa trên notificationId
        if (
          prev.some((n) => n.notificationId === notification.notificationId)
        ) {
          return prev;
        }
        return [notification, ...prev];
      });
    });

    // Cleanup khi component unmount
    return () => {
      notificationSocket.disconnect();
    };
  }, [userInfo?.id, dispatch]);

  useEffect(() => {
    notificationSocket.init(dispatch, userInfo.id);
    notificationSocket.subscribeToFollow((data) => {
      setNotifications((prev) => {
        // Kiểm tra trùng lặp dựa trên các trường khác, ví dụ: fromUserId và timestamp
        if (
          prev.some(
            (n) =>
              n.fromUserId === data.fromUserId && n.timestamp === data.timestamp
          )
        ) {
          return prev;
        }
        return [data, ...prev];
      });
    });
    return () => {
      notificationSocket.disconnect();
    };
  }, [userInfo?.id, dispatch]);

  return (
    <div className="lg:w-full w-full h-[60vh] py-4 px-4 bg-black shadow-md">
      <h2 className="text-2xl font-bold mb-5 text-gray-100">
        Thông báo người dùng
      </h2>

      <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {notifications.length === 0 ? (
          <p className="text-gray-100 text-center">Không có thông báo nào</p>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition"
            >
              <img
                src={
                  notification.senderAvatar ||
                  "https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/09/18/457/avatar-mac-dinh-1.jpg"
                }
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
              <div className="flex-1">
                <p className="text-gray-100">
                  <span className="font-semibold"></span>
                  {notification.message}
                </p>
                <span className="text-gray-400 text-xs">
                  {formatTime(notification.sentAt, t)}
                  {/* {moment(notification.sentAt).format("HH:mm DD/MM/YYYY")} */}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
