import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';

const DraggableCollegeItem = ({ college, index, moveCollege, handleRemoveCollege }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'COLLEGE',
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'COLLEGE',
    hover(item) {
      if (item.index === index) return;
      moveCollege(item.index, index);
      item.index = index;
    },
  });

  return (
    <tr 
      ref={(node) => drag(drop(node))} 
      className={`${isDragging ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'} transition-colors duration-200`}
    >
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-400 cursor-move mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
            <div className="text-xs text-gray-500">{college.city || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
          {college.selectedBranch || 'All Branches'}
        </span>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-right">
        <button 
          onClick={() => handleRemoveCollege(index)}
          className="text-red-600 hover:text-red-900 transition-colors duration-200"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default DraggableCollegeItem;
