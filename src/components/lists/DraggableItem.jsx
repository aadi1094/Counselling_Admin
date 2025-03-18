import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X } from 'lucide-react';

const DraggableItem = ({ id, index, item, moveItem, handleRemoveItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'LIST_ITEM',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'LIST_ITEM',
    hover(item) {
      if (item.index === index) return;
      moveItem(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center justify-between bg-gray-50 p-2 rounded ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical size={16} className="text-gray-400 cursor-move" />
        <span>{item}</span>
      </div>
      <button
        type="button"
        onClick={() => handleRemoveItem(index)}
        className="text-red-600 hover:text-red-800"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default DraggableItem;
