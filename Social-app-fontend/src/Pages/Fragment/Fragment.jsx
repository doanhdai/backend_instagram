import { useRoutes } from "react-router-dom";
import routes from "../../Routes/config"; // Import danh sách routes

const Fragment = () => {
  const element = useRoutes(routes); // Lấy component phù hợp với đường dẫn

  return (
    <div className="flex-1 px-3 py-5 bg-black">
      {element || <div className="text-white">Error!</div>}
    </div>
  );
};

export default Fragment;
