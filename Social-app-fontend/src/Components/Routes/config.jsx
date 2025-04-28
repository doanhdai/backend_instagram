const ADMIN_PATH = "/admin";
const USER_PATH = "/user";

const routes = {
  /**
   * ROUTER FOR LOGIN - REGISTER
   **/
  // login: "/login",
  // register: "/register",

  /**
   * ROUTER FOR USER
   **/
  default_session: `${USER_PATH}/home`,
  profile: `${USER_PATH}/profile`,
  create_newsfeed: `${USER_PATH}/create-post`,
  create_story: `${USER_PATH}/create-story`,
  edit_profile: `/edit-profile`,
  chat: `${USER_PATH}/chat`,
  notification: `${USER_PATH}/notifications`,
  story: `${USER_PATH}/story`,
  friend_profile: `${USER_PATH}/friend-profile`,
  search: `${USER_PATH}/search`,
  // friend_profile_flower: `${USER_PATH}/friend-profile/flower`,

  /**
   * ROUTER FOR ADMIN
   **/
  // ADMIN_SESSION: `${ADMIN_PATH}/admin`,
  // account: `${ADMIN_PATH}/accounts`,
  // home: `${ADMIN_PATH}/newsfeed`,
  // stories: `${ADMIN_PATH}/newsfeed`
};

export default routes;
