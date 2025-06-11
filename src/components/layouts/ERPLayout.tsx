import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar/Sidebar';
import ErpFooter from '@/components/common/Footer/ErpFooter';

interface ERPLayoutProps {
  children?: React.ReactNode;
}

const ERPLayout: React.FC<ERPLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Show Sidebar only on md and larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      {/* Show ErpFooter only on mobile screens */}
      <div className="md:hidden">
        <ErpFooter />
      </div>
    </div>
  );
};

export default ERPLayout;