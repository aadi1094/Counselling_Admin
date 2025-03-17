import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical, X } from 'lucide-react';

const DraggableCollegeItem = ({ college, index, moveCollege }) => {
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
      className={`${isDragging ? 'opacity-50 bg-gray-50' : ''} hover:bg-gray-50`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-400 cursor-move mr-2" />
          <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
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

const OrderEditableList = ({ list, onClose, onSave }) => {
  const [colleges, setColleges] = React.useState(list.colleges || []);
  const [isSaving, setIsSaving] = React.useState(false);

  const moveCollege = (dragIndex, hoverIndex) => {
    const dragCollege = colleges[dragIndex];
    const updatedColleges = [...colleges];
    updatedColleges.splice(dragIndex, 1);
    updatedColleges.splice(hoverIndex, 0, dragCollege);
    setColleges(updatedColleges);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Make sure to include listId in the updated list data
      await onSave({ 
        ...list, 
        colleges,
        listId: list.listId || list.id // Use listId or fallback to id
      });
      onClose();
    } catch (error) {
      console.error('Error saving list order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{list.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Drag and drop colleges to reorder them. Changes will only affect this user's view.
          </div>

          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Institute Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Branch
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {colleges.map((college, index) => (
                  <DraggableCollegeItem
                    key={`${college.id}_${index}`}
                    college={college}
                    index={index}
                    moveCollege={moveCollege}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {isSaving ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default OrderEditableList;
