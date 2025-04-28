import React, { useState } from "react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { handleCreateUser } from "../../../../Service/UserAPI";

const userSchema = yup.object().shape({
  name: yup.string().required("Tên người dùng không được để trống"),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Số điện thoại chỉ chứa chữ số")
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không vượt quá 11 số")
    .required("Số điện thoại không được bỏ trống"),
  birthDate: yup.date().required("Vui lòng chọn ngày sinh"),
  gender: yup.string().required("Vui lòng chọn giới tính"),
  description: yup.string(),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email không được bỏ trống"),
  password: yup.string().required("Mật khẩu không được bỏ trống"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
  fullName: yup.string().required("Họ và tên không được bỏ trống"),
});

const ModelAddUser = ({ isOpenAdduser, setIsOpenAdduser }) => {
  const { t } = useTranslation();
  const options = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(userSchema),
  });

  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      const base64String = await convertImageToBase64(file);
      setValue("avatar", base64String);
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

  const onSubmit = async (data) => {
    console.log(data);
    let birthdate = new Date(data.birthDate);
    const yyyy = birthdate.getFullYear();
    const mm = String(birthdate.getMonth() + 1).padStart(2, "0");
    const dd = String(birthdate.getDate()).padStart(2, "0");
    let ObjectData = {
      userNickname: data.name,
      userPhone: data.phone,
      userImage: data.avatar,
      userBio: data.description,
      userGender: data.gender,
      userBday: `${yyyy}-${mm}-${dd}`,
      userPassword: data.password,
      userEmail: data.email,
      userFullname: data.fullName,
    };
    let res = await handleCreateUser(ObjectData);
    if (res.statusCode === 200) {
      toast.success(t("manageUser.addUserSuccess"));
      setIsOpenAdduser(false);
    } else {
      toast.error(t("manageUser.addUserError"));
    }
  };

  return (
    <div>
      {isOpenAdduser && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
          <div className="relative p-6 w-full max-w-4xl bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">
                {t("manageUser.addUser")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenAdduser(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 grid-cols-2">
                {/* Thông tin cơ bản */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.userName")}
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterName")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.name?.message}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.phoneNumber")}
                    </label>
                    <input
                      type="text"
                      {...register("phone")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterPhone")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.phone?.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("manageUser.birthDate")}
                      </label>
                      <input
                        type="date"
                        {...register("birthDate")}
                        className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.birthDate?.message}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("manageUser.gender")}
                      </label>
                      <Select
                        options={options}
                        onChange={(selected) =>
                          setValue("gender", selected.value)
                        }
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.gender?.message}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.email")}
                    </label>
                    <input
                      type="text"
                      {...register("email")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterEmail")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.email?.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.fullName")}
                    </label>
                    <input
                      type="text"
                      {...register("fullName")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterFullName")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.fullName?.message}
                    </p>
                  </div>
                </div>

                {/* Ảnh đại diện và mô tả */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t("manageUser.chooseAvatar")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 transition-colors"
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                      >
                        {t("manageUser.chooseAvatar")}
                      </button>
                      <input
                        id="fileInput"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="border h-20 w-20 rounded-lg object-cover shadow-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.description")}
                    </label>
                    <textarea
                      {...register("description")}
                      rows="5"
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterDescription")}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.pass")}
                    </label>
                    <input
                      type="text"
                      {...register("password")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterPass")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.password?.message}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("manageUser.confirmPass")}
                    </label>
                    <input
                      type="text"
                      {...register("confirmPassword")}
                      className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("manageUser.enterConfirmPass")}
                    />
                    <p className="mt-1 text-red-500 text-xs">
                      {errors.confirmPassword?.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpenAdduser(false)}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  {t("manageUser.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {t("manageUser.saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelAddUser;
