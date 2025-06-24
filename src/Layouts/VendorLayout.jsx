import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorNavBar from '../Components/Vendor/VendorHeader';
import VendorSideBar from '../Components/Vendor/VendorSideNav';

const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <VendorNavBar onToggleSidebar={toggleSidebar} />

      <div className="flex flex-row h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out transform md:relative md:transform-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-[250px] md:w-[0px]`}
        >
          <VendorSideBar isOpen={isSidebarOpen} />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 bg-yellow-50 p-4 overflow-x-auto transition-all duration-300 ease-in-out w-full md:w-auto ${
            isSidebarOpen ? 'md:ml-[220px]' : 'ml-0 md:ml-[60px]'
          }`} // No margin on mobile, only on md and above
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;