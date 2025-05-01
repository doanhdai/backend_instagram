import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MessageList = ({ messages, 
  currentUserId, 
  selectedUser, 
  loading, 
  onLoadMore, 
  allLoaded,
  forceUpdate,
  isGroupChat, 
  participants,
}) => {
  const { t } = useTranslation();
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isLoadingOld, setIsLoadingOld] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const formatTimeStamp = (currentTime, previousTime, isSenderChanged) => {
    if (!previousTime) {
      return format(new Date(currentTime), "PPPP, HH:mm", { locale: vi });
    }

    const current = new Date(currentTime);
    const previous = new Date(previousTime);
    const diffMinutes = Math.floor((current - previous) / (1000 * 60));

    // Hiển thị timestamp nếu:
    // - Cách nhau ≥5 phút (cùng người gửi)
    // - Hoặc đổi người gửi và cách nhau ≥1 phút
    if (diffMinutes >= 5 || (isSenderChanged && diffMinutes >= 1)) {
      const isSameDay = current.toDateString() === previous.toDateString();

      if (isSameDay) {
        return format(current, "HH:mm");
      }

      const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        return format(current, "EEEE, HH:mm", { locale: vi });
      } else {
        return format(current, "dd/MM/yyyy, HH:mm", { locale: vi });
      }
    }

    return null;
  };

  // Xác định tin nhắn đầu tiên trong chuỗi liên tiếp của một user
  const isFirstInCluster = (msg, index, sortedMessages) => {
    if (msg.senderId === currentUserId) return false;
    if (index === 0) return true;
    const prevMsg = sortedMessages[index - 1];
    return (
      prevMsg.senderId !== msg.senderId ||
      Math.abs(new Date(msg.createdAt) - new Date(prevMsg.createdAt)) / 60000 >= 5
    );
  };

  // Xác định tin nhắn cuối cùng trong chuỗi liên tiếp của một user
  const isLastInCluster = (msg, index, sortedMessages) => {
    if (msg.senderId === currentUserId) return false;
    if (index === sortedMessages.length - 1) return true;
    const nextMsg = sortedMessages[index + 1];
    return (
      nextMsg.senderId !== msg.senderId ||
      Math.abs(new Date(nextMsg.createdAt) - new Date(msg.createdAt)) / 60000 >= 5
    );
  };

  // 1. Effect cho việc cuộn xuống sau khi conversation được load lần đầu
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0 && !isLoadingOld) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [currentUserId, messages.length > 0]); 

  useEffect(() => {
    if (messages.length > 0 && messages.length > prevMessagesLength) {
      const latestMessage = messages[messages.length - 1];
      
      // Cuộn xuống nếu tin nhắn mới từ người dùng hiện tại hoặc mới load xong tin nhắn đầu tiên
      if ((latestMessage.senderId === currentUserId || prevMessagesLength === 0) && !isLoadingOld) {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    
    setPrevMessagesLength(messages.length);
    
    if (isLoadingOld) {
      setIsLoadingOld(false);
    }
  }, [messages.length, isLoadingOld, prevMessagesLength, currentUserId]);

  useEffect(() => {
    if (forceUpdate > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [forceUpdate]);

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !loading && !allLoaded) {
      setIsLoadingOld(true);
      const scrollHeight = e.target.scrollHeight;

      onLoadMore();

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const heightDifference = newScrollHeight - scrollHeight;
          messagesContainerRef.current.scrollTop = heightDifference;
        }
      }, 100);
    }
  };


  // Thêm hàm lấy thông tin người gửi từ participants
  const getSenderInfo = (senderId) => {
    if (!participants) return null;
    return participants.find(p => (p.userId || p.id) === senderId);
  };

  // Hàm xử lý nội dung tin nhắn
  const processMessageContent = (content, isSentByCurrentUser) => {
    // Kiểm tra nếu là chỉ emoji (hoặc chuỗi emoji)
    if (isOnlyEmojis(content)) {
      return (
        <span className="text-3xl leading-relaxed">{content}</span>
      );
    }
    
    // Kiểm tra và xử lý đường link
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(content)) {
      const parts = content.split(urlRegex);
      const elements = [];
      
      for (let i = 0; i < parts.length; i++) {
        if (urlRegex.test(parts[i])) {
          elements.push(
            <a 
              key={i} 
              href={parts[i]} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${isSentByCurrentUser ? 'text-white' : 'text-white'} hover:underline break-all`}
            >
              {parts[i]}
            </a>
          );
        } else if (parts[i]) {
          // Xử lý emoji trong đoạn text thường
          elements.push(processEmojisInText(parts[i], i));
        }
      }
      
      return <>{elements}</>;
    }
    
    // Xử lý emoji trong đoạn text thường
    return processEmojisInText(content);
  };
  
  // Thêm hàm để đếm emoji chính xác hơn
  const countEmojis = (text) => {
    // Sử dụng thư viện emoji-regex nếu có thể
    // Hoặc đếm bằng cách sử dụng regex phức tạp hơn
    return [...text.matchAll(/\p{Emoji}/gu)].length;
  };

  // Hàm kiểm tra chuỗi chỉ chứa emoji
  const isOnlyEmojis = (text) => {
    // Loại bỏ các ký tự không phải emoji (khoảng trắng, Zero Width Joiner, v.v.)
    const cleanText = text.replace(/[\s\u200D\uFE0F\u20E3]/g, '');
    // Regex để phát hiện emoji
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u;
    const emojiCount = countEmojis(text);
    // Nếu có ít hơn 8 emoji và chuỗi (đã làm sạch) chỉ chứa emoji
    return emojiCount <= 8 && emojiRegex.test(cleanText);
  };
  
  // Hàm xử lý emoji trong văn bản thường
  const processEmojisInText = (text, key = 0) => {
    const emojiRegex = /([\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F000}-\u{1F02F}]+)/gu;
    if (!emojiRegex.test(text)) return text;
    const parts = text.split(emojiRegex);
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (emojiRegex.test(parts[i])) {
        elements.push(
          <span key={`${key}-${i}`} className="text-xl align-middle">{parts[i]}</span>
        );
      } else if (parts[i]) {
        elements.push(<span key={`${key}-${i}`}>{parts[i]}</span>);
      }
    }
    
    return <>{elements}</>;
  };

  return (
    <div
      ref={messagesContainerRef}
      className='overflow-y-auto flex-1 p-4 bg-black scroll-smooth h-[calc(100vh-150px)]'
      onScroll={handleScroll}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          {allLoaded && (
            <div className="text-center text-gray-500 text-sm py-4 border-b border-gray-200 mb-4">
              <p>{t('messenger.conversationStart')}</p>
              {sortedMessages.length > 0 && sortedMessages[0]?.createdAt && (
                <p className="font-medium mt-1">
                  {format(new Date(sortedMessages[0].createdAt), 'PPP', { locale: vi })}
                </p>
              )}
            </div>
          )}

          <div className='flex flex-col gap-0.5'>
            {sortedMessages.map((msg, index) => {
              const isSentByCurrentUser = msg.senderId === currentUserId;
              const previousMsg = index > 0 ? sortedMessages[index - 1] : null;
              const isSenderChanged = previousMsg ? previousMsg.senderId !== msg.senderId : true;

              const timestamp = formatTimeStamp(
                msg.createdAt,
                previousMsg?.createdAt,
                isSenderChanged
              );

              const showTimestamp = !!timestamp;
              const showAvatar = isLastInCluster(msg, index, sortedMessages); // avatar ở cuối chuỗi
              const showSenderName = isFirstInCluster(msg, index, sortedMessages); // tên ở đầu chuỗi

              const sender = isGroupChat ? getSenderInfo(msg.senderId) : null;

              return (
                <React.Fragment key={`${msg.id || msg.tempId}-${index}-${msg.senderId}`}>
                  {/* Hiển thị mốc thời gian */}
                  {showTimestamp && (
                    <div className="flex justify-center my-2">
                      <div className="text-gray-500 text-xs px-3 py-1">
                        {timestamp}
                      </div>
                    </div>
                  )}

                  <div className="group mb-1 flex items-end">
                    {/* Avatar đối phương */}
                    {!isSentByCurrentUser && showAvatar ? (
                      <div className="flex-shrink-0">
                        <img
                          src={isGroupChat 
                            ? (sender?.userImage || "/default-avatar.png") 
                            : (selectedUser?.userImage || "/default-avatar.png")}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      </div>
                    ) : (
                      !isSentByCurrentUser && <div className="w-8 h-8 mr-2 flex-shrink-0" />
                    )}

                    {/* Cột tin nhắn */}
                    <div className="flex flex-col w-full">
                      {/* Hiển thị tên người gửi trong group chat */}
                      {isGroupChat && !isSentByCurrentUser && showSenderName && (
                        <div className="text-xs text-gray-400 mb-1 ml-1">
                          {sender?.userNickname || sender?.userFullname || "User"}
                        </div>
                      )}
                      
                      {/* Container tin nhắn */}
                      <div className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"} w-full`}>
                        <div
                          className={`relative break-words px-3 py-1 rounded-2xl
                            ${isSentByCurrentUser ? "bg-blue-600 text-white" : "bg-gray-800 text-white"}
                            ${isOnlyEmojis(msg.content) ? "bg-transparent !p-0" : msg.content.length < 20 ? "max-w-fit" : "max-w-[75%]"}
                            ${msg.pending ? "opacity-70" : ""}`}
                        >
                          {processMessageContent(msg.content, isSentByCurrentUser)}
                          {/* Tooltip thời gian */}
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none">
                            <div className={`text-xs px-2 py-1 rounded bg-gray-800 text-white whitespace-nowrap ${isSentByCurrentUser ? "right-0" : "left-0"}`}>
                              {formatMessageTime(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Đặt messagesEndRef tại vị trí cuối cùng của danh sách tin nhắn */}
          <div ref={messagesEndRef} style={{ height: "1px", marginBottom: "10px" }}></div>

          {sortedMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">{t("messenger.noMessages")}</p>
                <p className="text-sm">{t("messenger.sendFirstMessage")}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageList;