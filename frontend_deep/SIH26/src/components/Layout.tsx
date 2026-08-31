import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AuroraBackground from './ui/aurora-background';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex relative overflow-x-hidden">
      {/* Detailed geographic map background with soft focal blur and high contrast overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center select-none"
        style={{ 
          backgroundImage: "url('/bg-map.jpg')",
          filter: "blur(2.5px) brightness(0.35) contrast(1.3) saturate(0.85)"
        }}
      />

      {/* Shimmering Space Command Aurora Canvas overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <AuroraBackground 
          className="!w-full !h-full bg-transparent" 
          starCount={60}
          gradientColors={[
            "rgba(139, 92, 246, 0.1)", // Violet 500
            "rgba(99, 102, 241, 0.1)"  // Indigo 500
          ]}
        />
      </div>

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main View Area */}
      <div className="flex-grow flex flex-col lg:pl-64 z-10 relative bg-transparent">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dynamic Route Content */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto relative z-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
