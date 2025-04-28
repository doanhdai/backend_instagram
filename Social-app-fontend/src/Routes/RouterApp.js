import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import DefaultLayout from "../Layout/DefaultLayout/DefaultLayout";
import appRoutes from "../Routes/config";
import PrivateRouter from "./PrivateRoutes/PrivateRoutes";
import Sibar from "../Components/Admin/Sibar/Sibar";
import ManagerUser from "../Components/Admin/ManagerUser/ManagerUser";
import ManagerPost from "../Components/Admin/ManagerPost/ManagerPost";

const RouterApp = () => {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <Routes>
        {/* ROUTE FOR LOGIN AND REGISTER */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Sibar />}>
          <Route path="manager-user" element={<ManagerUser />} />
          <Route path="manager-post" element={<ManagerPost />} />
        </Route>
        {/* ROUTE FOR VIDEO CALL */}

        {/* ROUTE FOR ADMIN */}
        <Route
          path="/*"
          element={
            <PrivateRouter>
              <DefaultLayout />
            </PrivateRouter>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default RouterApp;
