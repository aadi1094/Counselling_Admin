import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import ListDetails from './ListDetails';

const ListCard = ({ 
  list, 
  expandedListId, 
  handleListClick, 
  handleEdit, 
  handleDelete 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
      {/* List Header - Always visible and clickable */}
      <div 
        className={`p-6 cursor-pointer ${
          expandedListId === list.id ? 'border-b border-gray-200' : ''
        }`}
        onClick={() => handleListClick(list.id)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{list.title}</h2>
            <div className="flex mt-2 space-x-2">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {list.colleges?.length || 0} colleges
              </span>
              {list.userIds && list.userIds.length > 0 && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  {list.userIds.length} users
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(list);
              }}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors"
              title="Edit list"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(list.id);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
              title="Delete list"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded List Content */}
      {expandedListId === list.id && (
        <div className="p-6">
          <ListDetails list={list} />
        </div>
      )}
    </div>
  );
};

export default ListCard;
