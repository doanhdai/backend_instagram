import { useLocation } from "react-router-dom";

import Fragment from "../Fragment/index.jsx";
import LeftNav from "../Sidebar/Left/SidebarLeft.jsx";
import RightNav from "../Sidebar/Right/SidebarRight.jsx";

import ChatPage from "../../Pages/Chat/ChatPage.jsx";
import ChatAI from "../../Components/ChatAI/ChatAI.jsx";

const DefaultLayout = ({ socketData }) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes("/chat");

  return (
    <div className="flex w-full bg-black relative">
      <div className="fixed">
        <LeftNav />
      </div>

      {isChatPage ? (
        // Nếu là trang chat, hiển thị ChatPage với kích thước lớn hơn
        <div className="flex-1 min-h-screen bg-black ml-[270px]">
          <div className="h-full w-full">
            <ChatPage socketData={socketData} />
          </div>
        </div>
      ) : (
        // Nếu không phải trang chat, hiển thị Fragment và RightNav như bình thường
        <div className="flex w-full min-h-screen bg-black ml-[270px]">
          <Fragment />
          <RightNav />
        </div>
      )}
      <ChatAI />
    </div>
  );
};

export default DefaultLayout;
