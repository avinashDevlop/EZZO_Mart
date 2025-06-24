// src/Layouts/MartLayout.jsx
import React, { useState } from "react";
import MartHeader from "../Components/Mart/Header/MartHeader";
import { Outlet } from "react-router-dom";
import MartFooter from "../Components/Mart/Footer/MartFooter";
import CartSidebar from "../Components/Mart/Cart"; // Import the CartSidebar component

const MartLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <MartHeader toggleCart={() => setIsCartOpen(!isCartOpen)} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <main>
        <Outlet />
      </main>
      <MartFooter />
    </>
  );
};

export default MartLayout;