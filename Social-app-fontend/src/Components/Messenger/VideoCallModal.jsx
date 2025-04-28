import React, { useEffect, useRef } from "react";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const VideoCallModal = ({
  stream,
  remoteStream,
  onEndCall,
  callAccepted,
  name,
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);

  useEffect(() => {
    console.log("VideoCallModal - Props update:", {
      hasLocalStream: !!stream,
      hasRemoteStream: !!remoteStream,
      callAccepted,
      name,
    });
  }, [stream, remoteStream, callAccepted, name]);

  // Handle local stream
  useEffect(() => {
    if (stream && localVideoRef.current) {
      console.log("Setting up local video");
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle remote stream
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Setting up remote video");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="w-full h-full relative">
        {/* Debug Info */}
        <div className="absolute top-2 left-2 text-white text-xs bg-black bg-opacity-50 p-2 rounded">
          <div>Local Video: {stream?.active ? "Active" : "Not Active"}</div>
          <div>
            Remote Video: {remoteStream?.active ? "Active" : "Not Active"}
          </div>
          <div>Call Accepted: {callAccepted ? "Yes" : "No"}</div>
          <div>Local Tracks: {stream?.getTracks().length || 0}</div>
          <div>Remote Tracks: {remoteStream?.getTracks().length || 0}</div>
        </div>

        {/* Remote Video */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {(!remoteStream || !callAccepted) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                  <FaVideo className="text-white text-2xl" />
                </div>
                <p>Waiting for remote video...</p>
              </div>
            </div>
          )}
          {callAccepted && (
            <div className="absolute bottom-4 left-4 text-white text-lg bg-black bg-opacity-50 px-3 py-2 rounded">
              {name || "Remote User"}
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute top-4 right-4 w-[300px] aspect-video bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                  <FaVideo className="text-white text-xl" />
                </div>
                <p className="text-sm">Camera off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioEnabled ? "bg-gray-600" : "bg-red-600"
            }`}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="text-white text-xl" />
            ) : (
              <FaMicrophoneSlash className="text-white text-xl" />
            )}
          </button>
          <button
            onClick={onEndCall}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors"
          >
            <FaPhoneSlash className="text-2xl" />
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoEnabled ? "bg-gray-600" : "bg-red-600"
            }`}
          >
            {isVideoEnabled ? (
              <FaVideo className="text-white text-xl" />
            ) : (
              <FaVideoSlash className="text-white text-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
