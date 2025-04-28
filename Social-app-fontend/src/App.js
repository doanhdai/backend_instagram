import React from "react";
import { BrowserRouter } from "react-router-dom";
import RouterApp from "./Routes/RouterApp";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

function App() {
  const currentUser = useSelector((state) => state.login?.userInfo);
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-white">
        <RouterApp />
      </div>
    </BrowserRouter>
  );
}

export default App;
