import instance from "../Utils/AxiosApi/Axios";

export const fetchAllNotifications = () => instance.get('notification/all')

export const fetchAllNotificationsbyUser = (id_user) =>instance.get(`notification/user/${id_user}`)

export const fetchAllNotificationsUnread = (id_user) => instance.get(`notification/user/${id_user}/unread`)

export const setHasUnread = (id_user) => instance.post(`notification/mark-read?userId=${id_user}`)