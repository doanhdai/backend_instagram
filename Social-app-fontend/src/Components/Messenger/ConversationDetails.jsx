import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { FaTimes, FaUserPlus, FaEllipsisV } from "react-icons/fa";
import { updateConversationName } from "../../Redux/Reducer/chatSlice";
import instance from "../../Utils/AxiosApi/Axios";
import { toast } from "react-toastify";
import UserSearchModal from "./UserSearchModal";
import EditGroupNameModal from "./EditGroupNameModal"; // Import EditGroupNameModal

const ConversationDetails = ({ conversation, onClose, currentUser }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [newName, setNewName] = useState("");
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [blockStatus, setBlockStatus] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserOptions, setShowUserOptions] = useState(null);
  const [groupOwner, setGroupOwner] = useState(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false); // Sử dụng state này để mở modal

  useEffect(() => {
    if (conversation) {
      setNewName(conversation.name || "");
      if (!conversation.isGroupChat && conversation.participants?.length === 2) {
        const otherUser = conversation.participants.find(
          p => (p.userId || p.id) !== currentUser.id
        );
        if (otherUser) {
          checkBlockStatus(otherUser.userId || otherUser.id);
        }
      }
      if (conversation.isGroupChat) {
        fetchGroupOwner(conversation.id);
      }
    }
  }, [conversation, currentUser]);

  const fetchGroupOwner = async (conversationId) => {
    try {
      const response = await instance.get(`/chat/conversation/${conversationId}/owner`);
      if (response.data) {
        setGroupOwner(response.data);
      }
    } catch (error) {
      console.error("Error fetching group owner:", error);
    }
  };

  const checkBlockStatus = async (otherUserId) => {
    try {
      const response = await instance.get(`/chat/block-status?userId=${currentUser.id}&otherUserId=${otherUserId}`);
      setBlockStatus(response.data.isBlocked || false);
    } catch (error) {
      console.error("Error checking block status:", error);
    }
  };

  // Modify handleUpdateName to accept name parameter
  const handleUpdateName = async (name) => {
    if (!name || !name.trim()) return;
    try {
      await instance.put(`/chat/conversation/${conversation.id}/name?userId=${currentUser.id}`, {
        name
      });
      dispatch(updateConversationName({ 
        conversationId: conversation.id, 
        name 
      }));
      setShowEditNameModal(false); // Close modal on success
      toast.success(t("messenger.nameUpdated"));
    } catch (error) {
      console.error("Error updating conversation name:", error);
      toast.error(t("messenger.nameUpdateError"));
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await instance.delete(`/chat/conversation/${conversation.id}/participant/${userId}?removerId=${currentUser.id}`);
      toast.success(t("messenger.userRemoved"));
      setShowUserOptions(null);
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error(t("messenger.userRemoveError"));
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await instance.delete(`/chat/conversation/${conversation.id}/leave/${currentUser.id}`);
      onClose();
      toast.success(t("messenger.leftGroup"));
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(t("messenger.leaveGroupError"));
    }
  };

  const handleBlockUser = async () => {
    if (!conversation || conversation.isGroupChat) return;
    
    const otherUser = conversation.participants.find(
      p => (p.userId || p.id) !== currentUser.id
    );
    
    if (!otherUser) return;
    
    try {
      const endpoint = blockStatus ? 'unblock' : 'block';
      await instance.post(
        `/follow/${endpoint}?followerId=${currentUser.id}&followingId=${otherUser.userId || otherUser.id}`
      );
      
      setBlockStatus(!blockStatus);
      toast.success(blockStatus 
        ? t("messenger.userUnblocked") 
        : t("messenger.userBlocked"));
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error(t("messenger.blockActionError"));
    }
  };

  const handleAddMembers = (selectedUserIds) => {
    if (!selectedUserIds || selectedUserIds.length === 0) return;
    
    const existingUserIds = conversation.participants.map(p => p.userId || p.id);
    const newUserIds = selectedUserIds.filter(id => !existingUserIds.includes(id));
    
    if (newUserIds.length === 0) {
      toast.info(t("messenger.noNewMembers"));
      return;
    }
    Promise.all(
      newUserIds.map(userId => 
        instance.post(`/chat/conversation/${conversation.id}/add-member`, {
          userId,
          addedByUserId: currentUser.id
        })
      )
    )
    .then(() => {
      toast.success(t("messenger.membersAdded"));
      setShowAddMembersModal(false);
    })
    .catch(error => {
      console.error("Error adding members:", error);
      toast.error(t("messenger.addMemberError"));
    });
  };

  const isGroupOwner = groupOwner && groupOwner.id === currentUser.id;

  return (
    <div className="flex flex-col h-full bg-black text-white border-l border-gray-700">
      {/* Header */}
      <div className="py-4 px-4 border-b border-gray-700 flex justify-between items-center relative h-[73px]">
        <h2 className="text-lg font-semibold mx-auto">{t("messenger.details")}</h2>
        <button 
          className="absolute right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Conversation name (editable for group chats) */}
        {conversation.isGroupChat ? (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              {t("messenger.conversationName")}
            </h3>
            
            {/* Simplified display of name with edit button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {conversation.name || t("messenger.untitledGroup")}
              </h2>
              <button
                onClick={() => setShowEditNameModal(true)} // Open modal on click
                className="text-blue-500 text-sm hover:underline"
              >
                {t("messenger.edit")}
              </button>
            </div>
          </div>
        ) : null}

        {/* Members list */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400">
              {t("messenger.members")} ({conversation.participants?.length || 0})
            </h3>
            
            {conversation.isGroupChat && (
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-400 text-sm"
              >
                <FaUserPlus size={14} />
                <span>{t("messenger.addMembers")}</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {conversation.participants?.map((participant) => {
              const isCurrentUser = (participant.userId || participant.id) === currentUser.id;
              const isOwner = groupOwner && (participant.userId || participant.id) === groupOwner.id;
              
              return (
                <div 
                  key={participant.userId || participant.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-900 rounded-lg"
                >
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => window.open(`/user/friend-profile/${participant.userId || participant.id}`, '_blank')}
                  >
                    <img
                      src={participant.userImage || "/default-avatar.png"}
                      alt={participant.userFullname || participant.userNickname}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">
                        {participant.userFullname || participant.userNickname}
                        {isCurrentUser && (
                          <span className="ml-2 text-gray-400 text-sm">
                            ({t("messenger.you")})
                          </span>
                        )}
                        {isOwner && (
                          <span className="ml-2 text-yellow-500 text-xs">
                            ({t("messenger.groupOwner")})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        @{participant.userNickname}
                      </p>
                    </div>
                  </div>

                  {conversation.isGroupChat && !isCurrentUser && isGroupOwner && (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserOptions(
                          showUserOptions === participant.userId || showUserOptions === participant.id 
                            ? null 
                            : (participant.userId || participant.id)
                        )}
                        className="p-2 hover:bg-gray-800 rounded-full"
                      >
                        <FaEllipsisV />
                      </button>
                      
                      {(showUserOptions === participant.userId || showUserOptions === participant.id) && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                          <button
                            onClick={() => handleRemoveUser(participant.userId || participant.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                          >
                            {t("messenger.removeFromGroup")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with actions */}
      <div className="p-4 border-t border-gray-700">
        {conversation.isGroupChat ? (
          <div className="flex flex-col">
            <button
              onClick={handleLeaveGroup}
              className="text-red-500 hover:underline font-semibold self-start"
            >
              {t("messenger.leaveGroup")}
            </button>
            <div className="text-xs text-gray-400 mt-1 mb-4">
              {t("messenger.leaveGroupNote")}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <button
              onClick={handleBlockUser}
              className={`font-semibold hover:underline self-start ${
                blockStatus 
                  ? "text-blue-500 hover:text-blue-600" 
                  : "text-red-500 hover:text-red-600"
              }`}
            >
              {blockStatus 
                ? t("messenger.unblockUser") 
                : t("messenger.blockUser")
              }
            </button>
          </div>
        )}
      </div>

      {/* Add members modal */}
      {showAddMembersModal && (
        <UserSearchModal
          isOpen={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          onSelectUsers={handleAddMembers}
          currentUserId={currentUser.id}
          isForAddingMembers={true}
          excludeUserIds={conversation.participants?.map(p => p.userId || p.id) || []}
        />
      )}

      {/* Add EditGroupNameModal */}
      {showEditNameModal && (
        <EditGroupNameModal
          isOpen={showEditNameModal}
          onClose={() => setShowEditNameModal(false)}
          currentName={conversation.name || ""}
          onSave={handleUpdateName}
        />
      )}
    </div>
  );
};

export default ConversationDetails;