import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import MessengerPage from "../../Components/Messenger/MessengerPage";

const ChatPage = () => {
  const messagesEndRef = useRef(null);
  const { conversationId } = useParams();
  const messages = []; 

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <>
      <MessengerPage conversationId={conversationId} />
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatPage;
