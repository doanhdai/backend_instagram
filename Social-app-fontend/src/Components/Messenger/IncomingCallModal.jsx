import React from "react";
import { FaPhone, FaVideo, FaTimes } from "react-icons/fa";

const IncomingCallModal = ({ caller, onAccept, onReject }) => {
  console.log(caller);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-96">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img
              src={caller.userImage || "/default-avatar.png"}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {caller.userFullname} đang gọi video
          </h3>
          <p className="text-gray-400 mb-6">Cuộc gọi video đến</p>

          <div className="flex space-x-4">
            <button
              onClick={onAccept}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            >
              <FaVideo className="text-white text-xl" />
            </button>
            <button
              onClick={onReject}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
