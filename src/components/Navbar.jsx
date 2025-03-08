import React from 'react';
import { User, Building, GraduationCap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerticalNavbar = ({ onClose }) => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col relative">
      {/* Close button for mobile */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>

      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <GraduationCap className="mr-2" />
        <h1 className="text-xl font-bold">Education Portal</h1>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* User Section */}
        <Link 
          to="/users"
          onClick={onClose}
          className="w-full flex items-center p-3 hover:bg-gray-800 rounded-md transition-colors mb-2"
        >
          <User className="mr-3 text-blue-400" />
          <span>Users</span>
        </Link>
        
        {/* Colleges Section */}
        <Link 
          to="/colleges"
          onClick={onClose}
          className="w-full flex items-center p-3 hover:bg-gray-800 rounded-md transition-colors mb-2"
        >
          <Building className="mr-3 text-green-400" />
          <span>Colleges</span>
        </Link>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © 2025 Education Portal
      </div>
    </div>
  );
};

export default VerticalNavbar;