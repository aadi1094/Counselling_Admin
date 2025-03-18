import React from 'react';
import { Plus } from 'lucide-react';

const NoListsPlaceholder = ({ openModal }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Plus size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Lists Created Yet</h3>
        <p className="text-gray-500 mb-4">Create your first list by clicking the "Add New List" button</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          onClick={() => openModal()}
        >
          <Plus size={20} className="mr-2" />
          Add New List
        </button>
      </div>
    </div>
  );
};

export default NoListsPlaceholder;
