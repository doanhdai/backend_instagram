import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import { useSelector } from "react-redux";
import { handleGetFollowingByUser } from "../../Service/UserAPI";
import { FaUsers } from "react-icons/fa"; // Thêm icon cho group

const ConversationList = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  loading,
  setShowNewConversation,
  onSearch,
  searchTerm,
  onStartNewChatWithUser,
}) => {
  const { t, i18n } = useTranslation();
  const currentUser = useSelector((state) => state.login?.userInfo) || {};
  const [friendCandidates, setFriendCandidates] = useState([]);

  // Lấy danh sách bạn bè khi searchTerm thay đổi
  useEffect(() => {
    const fetchFriends = async () => {
      if (!searchTerm || !currentUser.id) {
        setFriendCandidates([]);
        return;
      }
      try {
        const res = await handleGetFollowingByUser(currentUser.id);
        const friends = (res.data || []).filter(
          (item) =>
            item.friend &&
            (
              item.following.userFullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.following.userNickname.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFriendCandidates(friends.map(item => item.following));
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriendCandidates([]);
      }
    };
    fetchFriends();
  }, [searchTerm, currentUser.id]);

  // Tìm kiếm trong conversations - Sửa lại để xử lý cả group chat
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    
    return conversations.filter((conv) => {
      // Nếu là group chat, tìm theo tên nhóm
      if (conv.isGroupChat) {
        return conv.name?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      // Nếu là chat 1-1, tìm theo tên/nickname của người kia
      const otherUser = conv.participants?.find(
        (p) => (p.userId || p.id) !== currentUser?.id
      );
      return otherUser && (
        otherUser.userFullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        otherUser.userNickname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, conversations, currentUser?.id]);

  // Lọc bạn bè chưa có conversation
  const friendsWithoutConversation = useMemo(() => {
    if (!searchTerm || filteredConversations.length > 0) return [];
    
    // Lấy tất cả userId trong các conversation hiện có
    const conversationUserIds = conversations
      .flatMap(conv => {
        // Chỉ lấy id của những người trong chat 1-1, không lấy từ group chat
        if (!conv.isGroupChat) {
          return conv.participants?.map(p => p.userId || p.id);
        }
        return [];
      })
      .filter(id => id !== currentUser.id);
    
    return friendCandidates.filter(
      (user) => !conversationUserIds.includes(user.id)
    );
  }, [filteredConversations, friendCandidates, conversations, currentUser.id, searchTerm]);

  const formatLastMessageTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: vi });
    } else if (isYesterday(date)) {
      return t("messenger.yesterday");
    } else {
      return format(date, "dd/MM/yyyy", { locale: vi });
    }
  };

  // Hàm này cần được cải tiến để xử lý cả group chat
  const getConversationDisplay = (conversation) => {
    // Xử lý cho group chat
    if (conversation.isGroupChat) {
      return {
        name: conversation.name || t("messenger.groupChat"),
        image: "/group-avatar.png", // Avatar mặc định cho nhóm
        isGroup: true,
        participantCount: conversation.participants?.length || 0
      };
    }
    
    // Xử lý cho chat 1-1
    // Nếu đã có participants
    if (conversation.participants && conversation.participants.length > 0) {
      const otherUser = conversation.participants.find(
        (p) => (p.userId || p.id) !== currentUser?.id
      );
      if (otherUser) {
        return {
          name: otherUser.userFullname || otherUser.userNickname,
          image: otherUser.userImage || "/default-avatar.png",
          isGroup: false
        };
      }
    }

    // Fallback: Trích xuất từ tên cuộc trò chuyện
    if (conversation.name && conversation.name.includes("between")) {
      const nameParts = conversation.name
        .replace("Chat between ", "")
        .split(" and ");
      const otherUserName = nameParts.find(
        (name) => !name.toLowerCase().includes(currentUser?.userNickname?.toLowerCase())
      );

      return {
        name: otherUserName,
        image: "/default-avatar.png",
        isGroup: false
      };
    }

    return {
      name: t("messenger.untitled"),
      image: "/default-avatar.png",
      isGroup: false
    };
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header with title and new conversation button */}
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">
          {t("messenger.title")}
        </h1>
        <button
          onClick={() => setShowNewConversation(true)}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          title={t("messenger.createNewConversation")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <div className="p-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("messenger.searchConversations")}
          className="w-full py-2 px-3 bg-black text-white border border-gray-300 rounded-3xl focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Conversation list */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 && friendsWithoutConversation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{t("messenger.noConversations")}</p>
          </div>
        ) : (
          <>
            {filteredConversations.map((conversation) => {
              const displayInfo = getConversationDisplay(conversation);
              const isActive = conversation.id === currentConversationId;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`
                    flex items-center bg-black p-3 hover:bg-gray-950 cursor-pointer text-white
                    ${isActive ? "bg-gray-900" : ""}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative ">
                    {displayInfo.isGroup ? (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <FaUsers className="text-white" size={18} />
                      </div>
                    ) : (
                      <img
                        src={displayInfo.image}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">
                        {displayInfo.name}
                        {displayInfo.isGroup && (
                          <span className="text-xs text-gray-400 ml-2">
                            ({displayInfo.participantCount})
                          </span>
                        )}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatLastMessageTime(
                            conversation.lastMessage.createdAt
                          )}
                        </span>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {displayInfo.isGroup && conversation.lastMessage.senderId !== currentUser?.id && (
                          <span className="font-medium mr-1">
                            {conversation.participants?.find(
                              p => p.userId === conversation.lastMessage.senderId
                            )?.userNickname || "User"}:
                          </span>
                        )}
                        {conversation.lastMessage.senderId === currentUser?.id
                          ? `${t("messenger.you")}: ${conversation.lastMessage.content}`
                          : conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Friends without conversation */}
            {filteredConversations.length === 0 && friendsWithoutConversation.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 px-3 mb-2">{t("messenger.noChatYetButFriend")}</p>
                {friendsWithoutConversation.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                    onClick={() => onStartNewChatWithUser && onStartNewChatWithUser(user.id)}
                  >
                    <img
                      src={user.userImage || "/default-avatar.png"}
                      alt={user.userFullname}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.userFullname}</p>
                      <p className="text-gray-400 text-sm">@{user.userNickname}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
