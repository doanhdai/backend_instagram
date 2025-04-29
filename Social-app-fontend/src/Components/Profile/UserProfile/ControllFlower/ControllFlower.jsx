import React, { useEffect, useState } from "react";
import { handleGetAllFollower } from "../../../../Service/Folower";
import { useSelector } from "react-redux";
import { handlePostFollower } from "../../../../Service/UserAPI";
import { useWebSocket } from "../../../../Utils/configCallVideo/websocket";

export default function ControllFollower({
  isOpen,
  onClose,
  id,
  fetchDataUser,
}) {
  const [dataFollower, setDataFollower] = useState([]);
  const currentUser = useSelector((state) => state.login?.userInfo);
  const { sendFollowNotification } = useWebSocket();

  useEffect(() => {
    if (isOpen) {
      fectDataFollower();
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const fectDataFollower = async () => {
    let res = await handleGetAllFollower(id);
    if (res.statusCode === 200 && res.data) {
      setDataFollower(res.data);
      console.log(res.data);
    }
  };

  const handleGetFollowersByUser = async (user) => {
    console.log(user.id?.followerId, currentUser.id);
    try {
      const response = await handlePostFollower(
        currentUser.id,
        user.id?.followerId
      );
      if (response.statusCode === 201 || response.statusCode === 200) {
        console.log("Đã follow thành công:", response.data);

        // Gửi thông báo qua WebSocket
        sendFollowNotification({ toUserId: String(user.id?.followerId) });

        // Cập nhật state `dataFollower` để phản ánh thay đổi giao diện
        const updatedFollowers = dataFollower.map((follower) => {
          if (follower.id === user.id) {
            return { ...follower, friend: true }; // Đánh dấu đã theo dõi
          }
          return follower;
        });
        setDataFollower(updatedFollowers);
        fetchDataUser(); // Cập nhật lại state
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Nền mờ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose} // Click nền để đóng
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 rounded-xl p-4 w-[400px] z-50 max-h-[90vh] overflow-y-auto">
        {/* Nội dung */}
        <div className="bg-zinc-900 text-white w-full max-w-md rounded-xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
            <h2 className="font-semibold text-lg">Người theo dõi</h2>
            <button
              className="text-2xl font-light hover:text-gray-300"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full p-2 rounded bg-zinc-800 text-white placeholder-gray-400 outline-none"
            />
          </div>

          {/* Danh sách */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
            {dataFollower.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      user.follower?.userImage ||
                      "https://via.placeholder.com/40"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {user.follower?.userNickname}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user.follower?.userFullname}
                    </p>
                  </div>
                </div>
                <button
                  className={`
                    px-3 py-1 text-sm rounded font-medium
                    ${
                      user.friend
                        ? "bg-zinc-700 text-white cursor-default pointer-events-none"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }
                  `}
                  onClick={
                    user.friend
                      ? undefined
                      : () => handleGetFollowersByUser(user)
                  }
                  disabled={user.friend}
                >
                  {user.friend ? "Đang theo dõi" : "Theo dõi lại"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
