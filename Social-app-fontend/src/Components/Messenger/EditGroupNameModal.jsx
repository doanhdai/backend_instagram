import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const EditGroupNameModal = ({ isOpen, onClose, currentName, onSave }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(currentName || "");

  const handleSave = () => {
    if (name.trim()) onSave(name.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t("messenger.editGroupName")}</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white mb-4"
          placeholder={t("messenger.enterGroupName")}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            {t("messenger.cancel")}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!name.trim()}
          >
            {t("messenger.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupNameModal;