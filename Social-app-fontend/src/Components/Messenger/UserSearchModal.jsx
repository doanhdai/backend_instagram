import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../Utils/AxiosApi/Axios";

// Update props to add support for adding members
const UserSearchModal = ({ 
  isOpen, 
  onClose, 
  onSelectUser, 
  onCreateGroup,
  onSelectUsers, // New prop for selecting multiple users
  currentUserId,
  isForAddingMembers = false, // New prop to indicate if this is for adding members
  excludeUserIds = [] // New prop to exclude certain users from the list
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [fetchAttempted, setFetchAttempted] = useState(false); // Thêm trạng thái để theo dõi việc đã fetch chưa

  // Sửa useEffect để tránh gọi liên tục
  useEffect(() => {
    // Chỉ fetch dữ liệu khi modal được mở và chưa fetch trước đó
    if (isOpen && !fetchAttempted) {
      fetchFriends();
      setFetchAttempted(true); // Đánh dấu đã fetch
    }

    // Khi modal đóng, reset trạng thái fetchAttempted để lần sau mở lại sẽ fetch mới
    if (!isOpen) {
      setFetchAttempted(false);
    }
  }, [isOpen, fetchAttempted]);

  const fetchFriends = async () => {
    if (!currentUserId) return; // Thêm kiểm tra để tránh gọi API khi không có currentUserId
    
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
      
      // 4. Loại bỏ các user đã được exclude
      const filteredUserIds = Array.from(allUserIds).filter(id => 
        !excludeUserIds.includes(id)
      );
      
      // 5. Lấy thông tin chi tiết của tất cả user
      const uniqueUsers = filteredUserIds.map(id => {
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
    } finally {
      setLoading(false);
    }
  };

  // Reset state khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setGroupName("");
      setSearchTerm("");
    }
  }, [isOpen]);

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

  const handleAddMembers = () => {
    if (selectedUsers.length > 0) {
      onSelectUsers(selectedUsers);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userFullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userNickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">
            {isForAddingMembers 
              ? t("messenger.addMembers") 
              : t("messenger.newConversation")
            }
          </h2>
        </div>
        
        <div className="p-4">
          {!isForAddingMembers && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("messenger.groupName")}
              className="w-full p-2 border rounded mb-4 bg-gray-800 text-white border-gray-700"
            />
          )}
          
          <p className="text-sm text-gray-400 mb-2">
            {isForAddingMembers 
              ? t("messenger.selectUsersToAdd")
              : t("messenger.selectMinTwoUsers")
            }
            {selectedUsers.length > 0 && ` (${selectedUsers.length} ${t("messenger.selected")})`}
          </p>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("messenger.searchFriends")}
            className="w-full p-2 border border-gray-700 rounded-lg mb-4 bg-gray-800 text-white"
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
                    className="flex items-center p-3 hover:bg-gray-800 rounded-lg cursor-pointer"
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
                    <div className="text-white">
                      <p className="font-medium">{user.userFullname}</p>
                      <p className="text-sm text-gray-400">
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
          <div className="mt-4 flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              {t("messenger.cancel")}
            </button>
            <button
              onClick={isForAddingMembers ? handleAddMembers : handleCreateGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isForAddingMembers 
                ? selectedUsers.length < 1 
                : selectedUsers.length < 2 || !groupName.trim()
              }
            >
              {isForAddingMembers 
                ? t("messenger.addSelected")
                : t("messenger.createGroup")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
