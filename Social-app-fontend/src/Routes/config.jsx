import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import NewsFeed from "../Pages/NewsFeed/index";
import Stories from "../Pages/Stories/index";
import FormCreateNewsFeed from "../Pages/Create/RenderFormNewsFeed/RenderNewsFeed";
import FormCreateStories from "../Pages/Create/RenderFormStories/RenderFormStories";
import EditProfile from "../Pages/Profile/RenderFormEdit/RenderFormEdit";
import Profile from "../Pages/Profile/RenderUserProfile/RenderUserProfile";
import RecommendUser from "../Pages/RecommendUser";
import Route from "../Components/Routes/index";
import Search from "../Pages/Search/index";
import Noti from "../Pages/Notification";
import Home from "../Pages/Home/index";
import ChatPage from "../Pages/Chat/ChatPage";
import StoryViewer from "../Components/Stories/StoryViewer";
import FriendProfile from "../Components/Profile/UserProfile/FriendProfile";
const routes = [
  /**
   * PATH FOR LOGIN AND REGISTER
   */

  /**
   * PATH FOR USER SESSION
   */
  // { path: USER_URL + Route.profile + "/:id", element: <Profile /> }, // Thêm id động
  { path: Route.profile, element: <Profile /> },
  { path: Route.default_session, element: <Home /> },
  { path: Route.create_newsfeed, element: <FormCreateNewsFeed /> },
  { path: Route.create_story, element: <FormCreateStories /> },
  { path: Route.edit_profile + "/:id", element: <EditProfile /> },
  { path: Route.friend_profile + "/:id", element: <FriendProfile /> },
  { path: Route.notification, element: <Noti /> },
  { path: Route.chat, element: <ChatPage /> },
  { path: Route.chat + "/:conversationId", element: <ChatPage /> },
  { path: Route.story + "/:id", element: <StoryViewer /> },
  { path: Route.search, element: <Search /> },
  /**
   * PATH FOR ADMIN SESSION
   */
  { path: Route.newsfeed, element: <NewsFeed /> },
];

export default routes;
