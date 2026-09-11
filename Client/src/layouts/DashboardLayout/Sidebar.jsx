import { useState } from 'react';
import { 
  Dashboard as DashboardIcon, 
  ChevronRight as ChevronRightIcon, 
  ChevronLeft as ChevronLeftIcon 
} from '@mui/icons-material';

export default function Sidebar() {
  // State to manage if the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(true);
  
  // Mock active state
  const isActive = true;

  return (
    <aside className={`${isOpen ? 'w-60' : 'w-20'} h-screen border-r border-gray-100 flex flex-col sticky top-0 bg-white shadow-sm transition-all duration-300 relative z-40`}>
      
      {/* Toggle Open/Close Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3.5 top-9 bg-white border-2 border-[#1b7f43] text-[#1b7f43] rounded-full w-7 h-7 flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors z-50"
      >
        {isOpen ? (
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        ) : (
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        )}
      </button>

      {/* Brand / Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-transparent overflow-hidden mt-2">
        <h1 className="font-bold tracking-wide text-gray-800 whitespace-nowrap transition-all duration-300">
          {isOpen ? (
            <span className="text-2xl">Hotel<span className="text-[#1b7f43]">Admin</span></span>
          ) : (
            <span className="text-xl text-[#1b7f43]">HA</span>
          )}
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 pt-2 pb-6 overflow-x-hidden">
        <ul className="space-y-1">
          <li>
            {/* Dashboard Tab */}
            <a 
              href="/"
              className={`flex items-center px-2 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-[#f4f9f6]' : 'hover:bg-gray-50'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
            >
              <div className="flex items-center">
                {/* Inner Icon Box */}
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                  isActive ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'text-gray-400'
                }`}>
                  <DashboardIcon sx={{ fontSize: 18 }} />
                </div>
                
                {/* Tab Label (Hidden when closed) */}
                <span className={`ml-3 text-[14px] font-semibold whitespace-nowrap transition-opacity duration-200 ${
                  isOpen ? 'opacity-100 block' : 'opacity-0 hidden'
                } ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                  Dashboard
                </span>
              </div>

              {/* Chevron Arrow (Hidden when closed) */}
              {isOpen && (
                <div className="pr-2">
                  <ChevronRightIcon 
                    fontSize="small" 
                    className={isActive ? 'text-[#a3b1c6]' : 'opacity-0'} 
                  />
                </div>
              )}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
