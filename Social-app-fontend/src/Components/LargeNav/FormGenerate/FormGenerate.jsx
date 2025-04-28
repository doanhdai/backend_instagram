import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Route from "../../../Components/Routes/index";
import FormCreateNewsFeed from "../../../Components/NewsFeed/FormCreate/FormCreate";
const MenuFormGenerate = ({ showCreateModal, setShowCreateModal }) => {
  const [t] = useTranslation();

  if (!showCreateModal) return null;

  return (
    <div className="relative w-full top-0">
      <div className="absolute bottom-[100px] left-0 bg-white rounded-lg shadow-lg w-56 p-2">
        <h2 className="text-xl font-semibold text-center mb-4">
          {t("Create New")}
        </h2>

        <Link
          to={Route.create_newsfeed}
          onClick={() => setShowCreateModal(false)}
          className="block w-full mb-2 py-2.5 rounded-lg text-center border border-black border-1 text-white bg-black hover:bg-gray-600"
        >
          {t("CreateNew.tellMeWhatYouThink")}
        </Link>

        <Link
          to={Route.create_story}
          onClick={() => setShowCreateModal(false)}
          className="block w-full mb-2 py-2.5 rounded-lg text-center border border-black border-1 text-white bg-gray-500 hover:bg-gray-600"
        >
          {t("CreateNew.howDoYouFeelToday")}
        </Link>

        <button
          onClick={() => setShowCreateModal(false)}
          className="w-full py-2 mt-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
        >
          {t("CreateNew.cancel")}
        </button>
      </div>
    </div>
  );
};

export default MenuFormGenerate;
