import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [username, setUsername] = useState('Arvind');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('satquery_username');
    if (savedName) setUsername(savedName);

    const handleStorageChange = () => {
      const currentName = localStorage.getItem('satquery_username');
      if (currentName) setUsername(currentName);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!showUserDropdown) return;
    const handleOutsideClick = () => {
      setShowUserDropdown(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showUserDropdown]);

  const handleChangeUsername = () => {
    const newName = window.prompt("Enter new Operator Call Sign:", username);
    if (newName && newName.trim() !== "") {
      const cleanName = newName.trim();
      setUsername(cleanName);
      localStorage.setItem('satquery_username', cleanName);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleLogOut = () => {
    const confirmLogOut = window.confirm("Are you sure you want to log out of the command console?");
    if (confirmLogOut) {
      localStorage.removeItem('satquery_auth_token');
      alert("Logged out successfully.");
      navigate('/');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(date.toLocaleTimeString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'OPERATIONAL COMMAND';
      case '/new-analysis':
        return 'TASKING PORTAL';
      case '/history':
        return 'TELEMETRY LOG';
      case '/reports':
        return 'INTELLIGENCE OUTPUT';
      case '/system':
        return 'CLUSTER INFRASTRUCTURE';
      case '/settings':
        return 'WORKSTATION PARAMETERS';
      default:
        return 'COMMAND CONSOLE';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-20 px-6 bg-[#08080a]/90 backdrop-blur border-b border-zinc-900">
      
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button 
          onClick={onMenuClick}
          className="p-1.5 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-slate-400 hover:text-slate-200 rounded transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 font-extrabold">
          <span>ROOT</span>
          <span>/</span>
          <span className="text-zinc-400">{getPageTitle()}</span>
        </div>
      </div>

      {/* Center Navbar Clocks & Security widgets */}
      <div className="hidden md:flex items-center gap-8">
        
        {/* Server Clock widget */}
        <div className="flex items-center gap-2.5 font-mono">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">UTC_SERVER_TIME</span>
          <span className="text-xs font-extrabold text-slate-300 tracking-wider">{time}</span>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono">
          <Shield className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">SEC_LEVEL: 4</span>
        </div>

      </div>

      {/* Right User Profile dropdown */}
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowUserDropdown(!showUserDropdown);
          }}
          className="flex items-center gap-3 hover:opacity-85 transition focus:outline-none text-left"
        >
          <div className="hidden lg:block font-mono">
            <p className="text-xs font-extrabold text-slate-200">{username}</p>
            <p className="text-[8px] font-bold text-zinc-500 mt-0.5 tracking-wider uppercase">OPERATOR_ID: 992</p>
          </div>
          <div className="w-9 h-9 rounded-sm border border-violet-500/20 overflow-hidden shadow-[0_0_10px_rgba(139,92,246,0.1)]">
            <img src="/avatar.jpg" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 mt-3 w-48 bg-zinc-950 border border-zinc-900 rounded shadow-2xl p-1.5 z-50 font-mono text-[10px] text-left">
            <div className="px-3 py-1.5 border-b border-zinc-900 text-zinc-500 uppercase font-bold text-[9px] tracking-wider">
              Operator settings
            </div>
            <button 
              onClick={() => {
                setShowUserDropdown(false);
                handleChangeUsername();
              }}
              className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-slate-350 hover:text-white rounded transition mt-1"
            >
              Change Call Sign
            </button>
            <button 
              onClick={() => {
                setShowUserDropdown(false);
                navigate('/settings');
              }}
              className="w-full text-left px-3 py-2 hover:bg-zinc-900 text-slate-350 hover:text-white rounded transition"
            >
              Manage Account
            </button>
            <button 
              onClick={() => {
                setShowUserDropdown(false);
                handleLogOut();
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#1a0f12] text-rose-500 hover:text-rose-400 rounded transition border-t border-zinc-900 mt-1 font-bold"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

    </header>
  );
};

export default Navbar;
