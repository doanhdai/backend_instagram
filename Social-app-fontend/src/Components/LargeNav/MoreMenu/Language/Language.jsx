import React, { useEffect, useState } from "react";
import vn from "../../../../assets/navlogo/VN.png";
import en from "../../../../assets/navlogo/GB.png";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { changeLanguageRedux } from "../../../../Redux/Reducer/appReducer";

const languages = {
  vi: { label: "Tiếng Việt", icon: vn },
  en: { label: "English", icon: en },
};

const Language = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const languageRedux = useSelector((state) => state.app.language);

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(languageRedux);
  }, [languageRedux, i18n]);

  const changeLanguageApp = (lang) => {
    dispatch(changeLanguageRedux(lang));
    setShowDropdown(false); // Ẩn dropdown sau khi chọn
  };

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {/* Hiển thị ngôn ngữ hiện tại */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg shadow-sm">
        <img
          src={languages[languageRedux].icon}
          className="w-5 h-5"
          alt={languageRedux}
        />
        <span className="text-sm font-medium">
          {languages[languageRedux].label}
        </span>
      </div>

      {/* Dropdown chọn ngôn ngữ */}
      {showDropdown && (
        <ul className="absolute left-0 top-full mt-0 bg-white shadow-md rounded-md w-36 border">
          {Object.entries(languages).map(([key, { label, icon }]) => (
            <li
              key={key}
              className={`flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer ${
                languageRedux === key ? "bg-gray-300" : ""
              }`}
              onClick={() => changeLanguageApp(key)}
            >
              <img src={icon} className="w-5 h-5" alt={key} />
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Language;
