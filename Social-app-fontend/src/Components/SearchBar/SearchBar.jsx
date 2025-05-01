import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { handleGetAllUser } from "../../Service/UserAPI";
import { Link } from "react-router-dom";
import Route from "../../Components/Routes/index";
import { useTranslation } from "react-i18next";

const SearchBar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [originalUsers, setOriginalUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null); // 👈 Đã sửa chỗ này

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await handleGetAllUser();
        setOriginalUsers(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    const filtered = originalUsers.filter(
      (user) =>
        user.userNickname.toLowerCase().includes(value) ||
        user.userFullname.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredUsers([]);
  };

  if (!isOpen) return null; // 👈 Để đây luôn cho gọn

  return (
    <div
      ref={searchRef}
      className="fixed top-0 left-[270px] h-screen w-[397px] bg-black border-r border-gray-800 z-[100]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-black px-4 pt-3 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-semibold text-white">
            {t("search.title")}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500" size={16} />
          </div>
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#262626] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-116px)] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : searchTerm ? (
          <div className="py-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`${Route.friend_profile}/${user.id}`}
                  className="flex items-center px-4 py-3 hover:bg-[#121212] transition-colors"
                >
                  <div className="relative">
                    <img
                      src={user.userImage || "https://via.placeholder.com/150"}
                      alt={user.userNickname}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-white text-[15px] font-semibold">
                      {user.userNickname}
                    </p>
                    <div className="flex items-center text-gray-400 text-[13px]">
                      <p>{user.userFullname}</p>
                      <span className="mx-1">•</span>
                      <p>{t("search.following")}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="mb-4">
                  <FaSearch className="mx-auto text-gray-400" size={32} />
                </div>
                <p className="text-gray-400 text-[15px]">
                  {t("search.noResults", { term: searchTerm })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <div className="mb-4">
              <FaSearch className="mx-auto text-gray-400" size={32} />
            </div>
            <p className="text-gray-400 text-[15px]">
              {t("search.searchPeople")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
