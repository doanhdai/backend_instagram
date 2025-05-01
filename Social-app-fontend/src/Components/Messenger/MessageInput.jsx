import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSmile, FaHeart } from 'react-icons/fa';
import Picker from 'emoji-picker-react';

const MessageInput = ({ value, onChange, onSend, inputRef, isBlocked, onFocus }) => {
  const { t } = useTranslation();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isBlocked) {
      e.preventDefault();
      onSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    if (emojiData && emojiData.emoji) {
      onChange({ target: { value: value + emojiData.emoji } });
    }
  };

  const handleSendHeart = () => {
    onSend("❤️");
  };

  return (
    <div className="p-3 bg-black">
      {isBlocked ? (
        <div className="bg-gray-800 p-3 rounded-lg text-center text-white">
          {t("messenger.blockedMessage")}
        </div>
      ) : (
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
            <div className="absolute bottom-14 left-0 z-10 bg-black">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {/* Message input */}
          <textarea
            ref={inputRef}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            placeholder={t('messenger.typeMessage')}
            className="flex-1 bg-transparent outline-none resize-none px-3 h-10 max-h-10 overflow-y-auto py-2 text-white"
            rows={1}
            onFocus={onFocus} // <-- thêm dòng này
          />

          {/* Send button or heart button */}
          {value.trim() ? (
            <button
              type="button"
              onClick={() => onSend()}
              className="text-gray-400 hover:text-blue-500 active:text-white px-4 py-2 rounded-full font-semibold transition-colors"
            >
              {t('messenger.send')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendHeart}
              className="text-gray-400 hover:text-red-500 active:text-red-600 px-4 py-2 rounded-full transition-colors"
            >
              <FaHeart size={22} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInput;