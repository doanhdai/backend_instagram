import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSmile, FaHeart } from 'react-icons/fa';
import Picker from 'emoji-picker-react';

const MessageInput = ({ value, onChange, onSend, inputRef }) => {
  const { t } = useTranslation();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    if (emojiData && emojiData.emoji) {
      onChange({ target: { value: value + emojiData.emoji } });
    }
  };

  // Hàm xử lý gửi trái tim trực tiếp
  const handleSendHeart = () => {
    // Gửi trái tim trực tiếp mà không thay đổi ô nhập
    onSend("❤️");
  };

  return (
    <div className="py-3 px-4 bg-black">
      <div className="relative flex items-center bg-black rounded-full px-1 border border-gray-700">
        {/* Emoji picker */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-400 hover:text-gray-200 transition-colors p-2"
        >
          <FaSmile size={18} />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-10">
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Message input */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={t('messenger.typeMessage')}
          className="flex-1 bg-transparent outline-none resize-none px-3 h-10 max-h-10 overflow-y-auto py-2 text-white"
          rows={1}
        />

        {/* Hiển thị nút gửi hoặc icon trái tim dựa vào giá trị của input */}
        {value.trim() ? (
          // Nếu có nội dung, hiển thị nút gửi bình thường
          <button
            type="button"
            onClick={() => onSend()}
            className="text-gray-400 hover:text-blue-500 active:text-white px-4 py-2 rounded-full font-semibold transition-colors"
          >
            {t('messenger.send')}
          </button>
        ) : (
          // Nếu không có nội dung, hiển thị icon trái tim
          <button
            type="button"
            onClick={handleSendHeart}
            className="text-gray-400 hover:text-red-500 active:text-red-600 px-4 py-2 rounded-full transition-colors"
          >
            <FaHeart size={22} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;