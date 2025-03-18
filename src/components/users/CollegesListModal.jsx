import React, { useState, useEffect } from 'react';
import { X, GraduationCap, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableCollegeRow = ({ college, index, moveCollege }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'COLLEGE_ROW',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'COLLEGE_ROW',
    hover(item) {
      if (item.index === index) return;
      moveCollege(item.index, index);
      item.index = index;
    },
  });

  return (
    <tr
      ref={(node) => drag(drop(node))}
      className={`${isDragging ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-400 cursor-move mr-2" />
          <span>{index + 1}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {college.instituteName}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
          {college.selectedBranch || 'All Branches'}
        </span>
      </td>
    </tr>
  );
};

const CollegesListModal = ({ show, onClose, list }) => {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    if (list?.colleges) {
      setColleges(list.colleges);
    }
  }, [list]);

  if (!show) return null;

  const moveCollege = (dragIndex, hoverIndex) => {
    const dragCollege = colleges[dragIndex];
    const newColleges = [...colleges];
    newColleges.splice(dragIndex, 1);
    newColleges.splice(hoverIndex, 0, dragCollege);
    setColleges(newColleges);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <DndProvider backend={HTML5Backend}>
        <div className="relative bg-white w-full max-w-6xl max-h-[95vh] flex flex-col rounded-xl shadow-2xl animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <GraduationCap size={24} className="mr-3" />
                {list.title}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                {colleges.length} colleges in this list
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all"
            >
              <X size={22} />
            </button>
          </div>

          {/* Colleges Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">
                      Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Institute Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Branch
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {colleges.map((college, idx) => (
                    <DraggableCollegeRow
                      key={idx}
                      college={college}
                      index={idx}
                      moveCollege={moveCollege}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default CollegesListModal;
