import React, { useState, useEffect } from "react";
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import ModelEditUser from "./ModelEditUser/ModelEditUser";
import ModelDelete from "./ModelDelete/ModelDelete";
import { handleGetAllUser } from "../../../Service/UserAPI";
import { useTranslation } from "react-i18next";
import ModelAddUser from "./ModelAddUser/ModelAddUser";

const ManagerUser = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state lưu giá trị tìm kiếm
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenAdduser, setIsOpenAdduser] = useState(false);
  const [dataProp, setDataProp] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await handleGetAllUser();
    if (res) {
      setUsers(res.data);
    }
  };

  const handleDeleteUser = (data) => {
    setIsOpenDelete(true);
    setDataProp(data);
  };

  const handleEditUserModel = (data) => {
    setIsOpen(true);
    setDataProp(data);
  };

  // Lọc danh sách người dùng theo `searchTerm`
  const filteredUsers = users.filter((user) =>
    user.userFullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div>
        <h3 className="text-2xl font-bold">{t("managerUser.title")}</h3>
      </div>
      <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4 mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => setIsOpenAdduser(true)}
        >
          {t("managerUser.addUser")}
        </button>

        <div className="relative">
          <input
            type="text"
            id="table-search"
            className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder={t("managerUser.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị tìm kiếm
          />
        </div>
      </div>

      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              {t("managerUser.userName")}
            </th>
            <th scope="col" className="px-6 py-3">
              {t("managerUser.nickName")}
            </th>

            <th scope="col" className="px-6 py-3">
              {t("managerUser.status")}
            </th>
            <th scope="col" className="px-6 py-3">
              {t("managerUser.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4">{user.userFullname}</td>
              <td className="px-6 py-4">{user.userNickname}</td>

              <td className="px-6 py-4">
                {user.isOnline === true ? (
                  <span className="text-green-500">
                    {t("managerUser.online")}
                  </span>
                ) : (
                  <span className="text-red-500">
                    {t("managerUser.offline")}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 flex gap-2 cursor-pointer">
                <MdOutlineModeEdit
                  className="size-6 text-blue-500"
                  onClick={() => handleEditUserModel(user)}
                />
                <MdDeleteOutline
                  className="size-6 text-red-600"
                  onClick={() => handleDeleteUser(user)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4">
        {Array.from(
          { length: Math.ceil(filteredUsers.length / usersPerPage) },
          (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 border rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          )
        )}
      </div>

      <ModelEditUser
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dataProp={dataProp}
      />
      <ModelDelete
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        dataProp={dataProp}
        fetchData={fetchData}
      />
      <ModelAddUser
        isOpenAdduser={isOpenAdduser}
        setIsOpenAdduser={setIsOpenAdduser}
        dataProp={dataProp}
      />
    </div>
  );
};

export default ManagerUser;
