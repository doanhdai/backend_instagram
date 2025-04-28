import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import * as yup from "yup";
import { handleEditProfile, handleGetById } from "../../../Service/UserAPI";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userLoginData } from "../../../Redux/Reducer/UserAppDeucer";

const EditProfileModal = () => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState(null);
  const [gender, setGender] = useState(null);
  const userredux = useSelector((state) => state.login.userInfo);
  const accessToken = useSelector((state) => state.login.accessToken);

  const { id } = useParams();
  const [dataUser, setDataUser] = useState({});
  let navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(userredux);
  const userSchema = yup.object().shape({
    username: yup
      .string()
      .min(2, t("fromCreate.usernameMin"))
      .max(20, t("fromCreate.usernameMax"))
      .required(t("fromCreate.usernameRequired")),
    phone: yup
      .string()
      .matches(/^\d+$/, t("fromCreate.phoneInvalid"))
      .min(10, t("fromCreate.phoneMin"))
      .required(t("fromCreate.phoneRequired")),
    // birthdate: yup.date().required(t("fromCreate.birthdateRequired")),
    bio: yup.string().max(200, t("fromCreate.bioMax")),
    avatar: yup.mixed(),
    gender: yup.object().shape({
      value: yup.string().required(),
      label: yup.string().required(),
    }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(userSchema),
  });

  useEffect(() => {
    fechDataUserById();
  }, []);

  const fechDataUserById = async () => {
    let res = await handleGetById(id);
    if (res.statusCode === 200 && res.data) {
      const user = res.data;
      setDataUser(user);

      setValue("username", user.userNickname);
      setValue("phone", user.userPhone);
      // setValue("birthdate", user.userBday?.split("T")[0]);
      setValue("bio", user.userBio);
      setValue("avatar", user.userImage);

      if (user.userImage) {
        setPreviewImage(user.userImage);
      }

      const genderValue =
        user.userGender === "male"
          ? { value: "male", label: "Nam" }
          : { value: "female", label: "Nữ" };
      setGender(genderValue);
      setValue("gender", genderValue);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
  ];

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      const base64String = await convertImageToBase64(file);
      setValue("avatar", base64String);
    }
  };

  const handleGenderChange = (selectedOption) => {
    setGender(selectedOption);
    setValue("gender", selectedOption);
  };

  const onSubmit = async (data) => {
    let cloneData = _.clone(data);
    let birthdate = new Date(cloneData.birthdate);
    const yyyy = birthdate.getFullYear();
    const mm = String(birthdate.getMonth() + 1).padStart(2, "0");
    const dd = String(birthdate.getDate()).padStart(2, "0");

    let ObjectData = {
      id: userredux.id,
      userNickname: cloneData.username,
      userPhone: cloneData.phone,
      userImage: cloneData.avatar,
      userBio: cloneData.bio,
      userGender: cloneData.gender.value,
      // userBday: `${yyyy}-${mm}-${dd}`,
    };

    let res = await handleEditProfile(ObjectData);
    if (res.statusCode === 200 && res.data) {
      toast.success("Cập nhật thành công");
      setTimeout(() => {
        navigate("/user/profile");
      }, 1000);
      dispatch(
        userLoginData({
          user: {
            ...userredux, // Giữ lại các trường dữ liệu cũ của userredux
            nikName: cloneData.username, // Cập nhật username mới
            avatar: cloneData.avatar, // Cập nhật avatar mới
            // Các trường thông tin khác của user nếu cần
          },
          accessToken: accessToken, // Giữ nguyên accessToken không thay đổi
        })
      );
    }
  };

  return (
    <div className="">
      <div className="bg-black p-6 rounded-lg shadow-lg w-[600px] text-white">
        <div className="flex border-b justify-between items-center mb-4 pb-3">
          <h2 className="text-xl font-bold">{t("fromCreate.title")}</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-1">
                {t("fromCreate.name")}
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded w-full outline-none px-3 py-2 bg-black"
                {...register("username")}
              />
              {errors.username && (
                <span className="text-red-500 text-xs">
                  {errors.username.message}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm block mb-1">
                {t("fromCreate.phone")}
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded w-full outline-none px-3 py-2 bg-black"
                {...register("phone")}
              />
              {errors.phone && (
                <span className="text-red-500 text-xs">
                  {errors.phone.message}
                </span>
              )}
            </div>
            {/* <div>
              <label className="text-sm block mb-1">
                {t("fromCreate.date")}
              </label>
              <input
                type="date"
                className="border border-gray-300 rounded w-full outline-none px-3 py-2 bg-black text-white appearance-none [&::-webkit-calendar-picker-indicator]:invert"
                {...register("birthdate")}
              />

              {errors.birthdate && (
                <span className="text-red-500 text-xs">
                  {errors.birthdate.message}
                </span>
              )}
            </div> */}
            <div className="">
              <label className="text-sm block mb-1">
                {t("fromCreate.gender")}
              </label>
              <Select
                options={genderOptions}
                value={gender}
                onChange={handleGenderChange}
                className="w-full"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 999 }),
                  control: (base) => ({
                    ...base,
                    backgroundColor: "black",
                    borderColor: "#4B5563",
                    color: "white",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "black",
                    color: "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#1F2937" : "black",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1F2937",
                    },
                  }),
                }}
              />
              {errors.gender && (
                <span className="text-red-500 text-xs">
                  {t("fromCreate.genderRequired")}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1">
              {t("fromCreate.avata")}
            </label>
            <div className="flex gap-4 items-center">
              <button
                type="button"
                className="bg-blue-600 rounded-lg text-white hover:bg-blue-700 px-4 py-2 transition"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {t("manageUser.chooseAvatar")}
              </button>
              <input
                id="fileInput"
                type="file"
                className="hidden "
                accept="image/*"
                {...register("avatar")}
                onChange={handleImageChange}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="border h-16 rounded-md w-16 object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <label className="text-sm block mb-1">{t("fromCreate.bio")}</label>
            <textarea
              className="border border-gray-300 rounded w-full outline-none px-3 py-2 bg-black"
              {...register("bio")}
              rows="3"
            />
            {errors.bio && (
              <span className="text-red-500 text-xs">{errors.bio.message}</span>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 rounded text-white w-full font-bold hover:bg-blue-700 py-2"
          >
            {t("fromCreate.update")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
