// src/Layouts/MartLayout.jsx
import React from "react";
import MartHeader from "../Components/Mart/Header/MartHeader";
import { Outlet } from "react-router-dom";
import MartFooter from "../Components/Mart/Footer/MartFooter";
const MartLayout = () => {
  return (
    <>
      <MartHeader />
      <main>
        <Outlet />
      </main>
      <MartFooter />
    </>
  );
};

export default MartLayout;
