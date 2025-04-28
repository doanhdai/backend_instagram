import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../Utils/AxiosApi/Axios";

const UserSearchModal = ({ isOpen, onClose, onCreateGroup, currentUserId }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách người mà user đang theo dõi
      const followingRes = await instance.get(`/follow/following/${currentUserId}`);
      const followingData = followingRes.data || [];
      
      // Lọc lấy những người có is_friend = true (thực sự là bạn bè)
      const friends = followingData.filter(item => item.friend === true)
        .map(item => item.following);
      
      // 2. Lấy danh sách người có conversation chung (và không block nhau)
      const conversationsRes = await instance.get(`/chat/conversationUsers/${currentUserId}`);
      const conversationUsers = conversationsRes.data || [];
      
      // 3. Kết hợp 2 danh sách, loại bỏ trùng lặp
      const allUserIds = new Set([
        ...friends.map(friend => friend.id),
        ...conversationUsers.map(user => user.id)
      ]);
      
      // 4. Lấy thông tin chi tiết của tất cả user
      const uniqueUsers = Array.from(allUserIds).map(id => {
        // Tìm trong friends trước
        const friend = friends.find(f => f.id === id);
        if (friend) return friend;
        
        // Nếu không có, tìm trong conversationUsers
        return conversationUsers.find(u => u.id === id);
      }).filter(Boolean); // Loại bỏ undefined
      
      setUsers(uniqueUsers);
    } catch (e) {
      console.error("Error fetching friends:", e);
      setUsers([]);
      
      // Thêm xử lý lỗi cụ thể để debug
      if (e.response) {
        console.error(`API error: ${e.response.status} - ${e.response.statusText}`);
      }
    }
    setLoading(false);
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length >= 2 && groupName.trim()) {
      onCreateGroup({
        name: groupName,
        userIds: [currentUserId, ...selectedUsers],
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userFullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userNickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {t("messenger.newConversation")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-4">{t("messenger.createGroupChat")}</h3>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t("messenger.enterGroupName")}
            className="w-full p-2 border rounded mb-4"
          />
          
          <p className="text-sm text-gray-600 mb-2">
            {t("messenger.selectMinTwoUsers")}
            {selectedUsers.length > 0 && ` (${selectedUsers.length} ${t("messenger.selected")})`}
          </p>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("messenger.searchFriends")}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          />
          
          {loading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => toggleUser(user.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-2"
                    />
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={user.userImage || "/default-avatar.png"}
                        alt={user.userFullname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.userFullname}</p>
                      <p className="text-sm text-gray-500">
                        @{user.userNickname}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {searchTerm
                    ? t("messenger.noUsersFound")
                    : t("messenger.noUsers")}
                </p>
              )}
            </div>
          )}
          <button
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={selectedUsers.length < 2 || !groupName.trim()}
            onClick={handleCreateGroup}
          >
            {t("messenger.createGroup")}
            {selectedUsers.length < 2 && ` (${t("messenger.needMoreUsers")})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
