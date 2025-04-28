import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { handleEditProfile } from "../../../../Service/UserAPI";
import _ from "lodash";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

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
});

const ModelEditUser = ({ isOpen, setIsOpen, dataProp }) => {
  const { t } = useTranslation();
  const userredux = useSelector((state) => state.login.userInfo);

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

  useEffect(() => {
    if (dataProp) {
      setValue("name", dataProp.userNickname);
      setValue("phone", dataProp.userPhone);
      setValue("birthDate", dataProp.userBday);
      setValue("gender", dataProp.userGender);
      setValue("description", dataProp.userBio);
      setValue("avatar", dataProp.userImage);
      setPreviewImage(dataProp.userImage);
    }
  }, [dataProp, setValue]);

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
    let cloneData = _.clone(data);

    let birthdate = new Date(cloneData.birthDate);

    const yyyy = birthdate.getFullYear();
    const mm = String(birthdate.getMonth() + 1).padStart(2, "0");
    const dd = String(birthdate.getDate()).padStart(2, "0");

    let ObjectData = {
      id: userredux.id,
      userNickname: cloneData.name,
      userPhone: cloneData.phone,
      userImage: cloneData.avatar,
      userBio: cloneData.description,
      userGender: cloneData.gender,
      userBday: `${yyyy}-${mm}-${dd}`,
    };
    console.log(ObjectData);
    let res = await handleEditProfile(ObjectData);
    console.log(res);
    if (res.statusCode === 200) {
      toast.success(t("manageUser.editUserSuccess"));
      setIsOpen(false);
    } else {
      toast.error(t("manageUser.editUserError"));
    }
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
          <div className="relative p-4 w-full max-w-4xl bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold">
                {t("manageUser.editUser")}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-2"
              >
                ✖
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    {t("manageUser.userName")}
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    defaultValue={dataProp.userNickname}
                    className="border p-2 rounded-lg outline-none"
                    placeholder={t("manageUser.enterName")}
                  />
                  <p className="text-red-500 text-xs">{errors.name?.message}</p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    {t("manageUser.phoneNumber")}
                  </label>
                  <input
                    type="text"
                    {...register("phone")}
                    className="border p-2 rounded-lg outline-none"
                    placeholder={t("manageUser.enterPhone")}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.phone?.message}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    {t("manageUser.birthDate")}
                  </label>
                  <input
                    type="date"
                    {...register("birthDate")}
                    className="border p-2 rounded-lg outline-none"
                  />
                  <p className="text-red-500 text-xs">
                    {errors.birthDate?.message}
                  </p>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium">
                    {t("manageUser.gender")}
                  </label>
                  <Select
                    options={options}
                    onChange={(selected) => setValue("gender", selected.value)}
                    defaultValue={dataProp.userGender}
                  />
                  <p className="text-red-500 text-xs">
                    {errors.gender?.message}
                  </p>
                </div>
              </div>

              {/* Chọn ảnh đại diện */}
              <div className="flex gap-4 items-center">
                <button
                  type="button"
                  className="bg-blue-600 text-white rounded-lg px-4 py-2"
                  onClick={() => document.getElementById("fileInput").click()}
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
                    className="border h-16 rounded-md w-16 object-cover"
                  />
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium">
                  {t("manageUser.description")}
                </label>
                <textarea
                  {...register("description")}
                  rows="4"
                  className="border p-2 w-full rounded-lg outline-none"
                  placeholder={t("manageUser.enterDescription")}
                ></textarea>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  {t("manageUser.cancel")}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
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

export default ModelEditUser;
