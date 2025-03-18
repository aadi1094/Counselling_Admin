import React, { useState } from 'react';
import { X, Edit, Trash2, GraduationCap, Search } from 'lucide-react';
import CollegesListModal from './CollegesListModal';

const UserListModal = ({ 
  showModal, 
  onClose, 
  loading, 
  userLists, 
  userName, 
  onEditList, 
  onRemoveList, 
  onSetEditingOrderList 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [editListFormData, setEditListFormData] = useState({ colleges: [] });

  if (!showModal) return null;

  // Simplified filter to only search by title
  const filteredLists = userLists.filter(list => 
    !searchQuery || list.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleListTitleClick = (list) => {
    // Create a copy of the list with indexed colleges
    const indexedList = {
      ...list,
      colleges: list.colleges?.map((college, index) => ({
        ...college,
        index: index + 1
      }))
    };
    setSelectedList(indexedList);
  };

  const handleAddSelectedColleges = (selectedColleges) => {
    // Add selected colleges to edit form data
    setEditListFormData(prev => ({
      ...prev,
      colleges: [...prev.colleges, ...selectedColleges]
    }));
    setSelectedList(null); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen w-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <GraduationCap size={26} className="mr-3" />
          Lists for {userName}
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 transition-all rounded-full p-2"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Simplified Search */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Search lists by title..."
              />
              <Search 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Lists Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLists.length > 0 ? (
            <div className="space-y-4">
              {filteredLists.map(list => (
                <div 
                  key={list.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <button
                          onClick={() => handleListTitleClick(list)}
                          className="text-xl font-semibold text-gray-800 hover:text-blue-600 text-left flex items-center group mb-2"
                        >
                          {list.title}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-blue-600 text-sm">
                            (View Colleges)
                          </span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {list.colleges?.length || 0} colleges
                          </span>
                          {list.customized && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Customized
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onEditList(list)}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Edit size={16} className="mr-2" />
                          Customize
                        </button>
                        <button
                          onClick={() => onRemoveList(list)}
                          className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <GraduationCap size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Lists Found</h3>
                <p className="text-gray-500 max-w-md">
                  {searchQuery 
                    ? "No lists match your search. Try a different search term."
                    : "This user doesn't have any lists assigned yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colleges List Modal */}
      <CollegesListModal 
        show={!!selectedList}
        onClose={() => setSelectedList(null)}
        list={selectedList}
        onAddToList={handleAddSelectedColleges}
      />
    </div>
  );
};

export default UserListModal;
