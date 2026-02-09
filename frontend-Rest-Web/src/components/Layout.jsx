import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#222222] text-gray-900 dark:text-dark-text transition-colors duration-300 text-sm">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div
        className={`
          transition-all duration-300 min-h-screen flex flex-col
          ${sidebarCollapsed ? 'pl-20' : 'pl-64'}
        `}
      >
        <Navbar />

        <main className="flex-1 p-6 mt-16 animate-fade-in">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
