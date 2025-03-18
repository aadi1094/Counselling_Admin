import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Search, CheckCircle, Plus, Trash2, School, BookOpen, MapPin, Filter } from 'lucide-react';
import DraggableCollegeItem from './DraggableCollegeItem';

const EditListModal = ({
  show,
  onClose,
  editingUserList,
  editListFormData,
  setEditListFormData,
  searchCollegeQuery,
  handleSearchCollegeChange,
  isSearchingColleges,
  collegeSearchResults,
  searchColleges,
  addCollegeToUserList,
  handleRemoveCollegeFromUserList,
  moveCollege,
  handleSaveUserList
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [showFilters, setShowFilters] = useState(false);
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <DndProvider backend={HTML5Backend}>
        <div className="relative bg-white w-full max-w-7xl max-h-[95vh] flex flex-col rounded-xl shadow-2xl animate-fadeIn overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editingUserList.isUserSpecific ? 'Edit Customized List' : 'Customize List for User'}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                {editListFormData.colleges.length} colleges in this list
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
              {/* List Title with floating style */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transform transition-all duration-200 hover:shadow-lg mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center mb-2">
                    <School className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-800">List Title</span>
                  </div>
                </label>
                <input 
                  type="text" 
                  value={editListFormData.title}
                  onChange={(e) => setEditListFormData({...editListFormData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-shadow duration-200"
                  placeholder="Enter a descriptive title for this list..."
                  required
                />
              </div>
              
              {/* Colleges Management Section */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-blue-600" />
                    Manage Colleges In This List
                  </h3>
                </div>
                
                {/* Tab navigation */}
                <div className="flex border-b">
                  <button 
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 ${
                      activeTab === 'search' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('search')}
                  >
                    <div className="flex items-center justify-center">
                      <Search size={18} className="mr-2" />
                      Search Colleges
                    </div>
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors duration-200 ${
                      activeTab === 'selected' 
                        ? 'text-green-600 border-b-2 border-green-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('selected')}
                  >
                    <div className="flex items-center justify-center">
                      <CheckCircle size={18} className="mr-2" />
                      Selected ({editListFormData.colleges.length})
                    </div>
                  </button>
                </div>
                
                <div className="p-5">
                  {/* Content based on active tab (search or selected) */}
                  {activeTab === 'search' ? (
                    <div className="lg:flex gap-6">
                      {/* Search Area */}
                      <div className="flex-1 lg:max-w-xl">
                        {/* Search Box */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Search Colleges</label>
                           
                          </div>
                          
                          {/* Main Search */}
                          <div className="relative">
                            <input 
                              type="text" 
                              value={searchCollegeQuery}
                              onChange={handleSearchCollegeChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                              placeholder="Search by college name or code..."
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search size={18} className="text-gray-500" />
                            </div>
                            {isSearchingColleges && (
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-blue-500"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm font-medium text-gray-700">
                              {collegeSearchResults.length} results
                            </span>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSearchCollegeChange({ target: { value: '' } });
                                }}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  searchCollegeQuery ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={!searchCollegeQuery}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => searchColleges(searchCollegeQuery)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              >
                                <Search size={14} className="mr-1.5" />
                                Search
                              </button>
                            </div>
                          </div>
                          
                          {/* Advanced Filters (expandable) */}
                          {showFilters && (
                            <div className="mt-3 border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <select className="w-full p-2 border border-gray-300 rounded-md">
                                  <option value="">All Cities</option>
                                  <option value="delhi">Delhi</option>
                                  <option value="mumbai">Mumbai</option>
                                  <option value="bangalore">Bangalore</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                                <select className="w-full p-2 border border-gray-300 rounded-md">
                                  <option value="">All Branches</option>
                                  <option value="cs">Computer Science</option>
                                  <option value="ce">Civil Engineering</option>
                                  <option value="me">Mechanical Engineering</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Search Results */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2.5 border-b flex justify-between items-center">
                            <h4 className="font-medium text-gray-800">Search Results</h4>
                            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {collegeSearchResults.length} colleges
                            </div>
                          </div>
                          
                          <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {collegeSearchResults.length > 0 ? (
                              <div className="divide-y divide-gray-200">
                                {collegeSearchResults.map(college => (
                                  <div key={college.id} className="p-4 hover:bg-blue-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium text-gray-800">{college.instituteName}</div>
                                        {college.city && (
                                          <div className="text-sm text-gray-600 flex items-center mt-1">
                                            <MapPin size={14} className="text-gray-500 mr-1" />
                                            {college.city}
                                          </div>
                                        )}
                                        <div className="text-sm text-gray-500 mt-1">
                                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-2 border border-blue-100">
                                            Code: {college.instituteCode}
                                          </span>
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => addCollegeToUserList(college)}
                                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm flex items-center"
                                      >
                                        <Plus size={14} className="mr-1" />
                                        Add
                                      </button>
                                    </div>
                                    
                                    {/* Show branches if available */}
                                    {college.branches && college.branches.length > 0 && (
                                      <div className="mt-3 space-y-1.5">
                                        <div className="text-xs text-gray-500 uppercase font-semibold pl-1">Available Branches:</div>
                                        <div className="ml-2 space-y-1 border-l-2 border-gray-200 pl-3">
                                          {college.branches.map(branch => {
                                            const isSelected = editListFormData.colleges.some(
                                              c => c.id === college.id && c.selectedBranchCode === branch.branchCode
                                            );
                                            return (
                                              <div key={branch.branchCode} className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                                <div className="flex items-center">
                                                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2.5"></div>
                                                  <span className="font-medium text-sm">{branch.branchName}</span>
                                                  <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                                    {branch.branchCode}
                                                  </span>
                                                </div>
                                                <button 
                                                  type="button" 
                                                  onClick={() => addCollegeToUserList(college, branch)}
                                                  disabled={isSelected}
                                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                                    isSelected 
                                                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                  }`}
                                                >
                                                  {isSelected ? 'Added' : 'Add Branch'}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center">
                                {searchCollegeQuery ? (
                                  <>
                                    <div className="mx-auto h-16 w-16 text-gray-400 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                      <Search size={24} className="text-gray-500" />
                                    </div>
                                    <p className="font-medium text-gray-700">No colleges found</p>
                                    <p className="text-gray-500 text-sm mt-1">Try different search terms</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="mx-auto h-16 w-16 text-gray-400 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                      <Search size={24} className="text-gray-500" />
                                    </div>
                                    <p className="font-medium text-gray-700">Begin your search</p>
                                    <p className="text-gray-500 text-sm mt-1">Search for colleges by name or code</p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Selected Colleges Preview */}
                      <div className="flex-1 mt-6 lg:mt-0">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-sm font-medium text-gray-700">
                              <CheckCircle size={16} className="text-green-500 mr-2" />
                              Selected Colleges
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                {editListFormData.colleges.length}
                              </span>
                            </div>
                            {editListFormData.colleges.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setEditListFormData({...editListFormData, colleges: []})}
                                className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Clear all
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {editListFormData.colleges.length === 0 
                              ? "No colleges selected yet" 
                              : "Drag items to reorder them in the list"}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-[400px]">
                          <div className="h-full overflow-y-auto scrollbar-thin">
                            {editListFormData.colleges.length > 0 ? (
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Institute Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Branch
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {editListFormData.colleges.map((college, index) => (
                                    <DraggableCollegeItem
                                      key={college.uniqueId || `${college.id}_${index}`}
                                      college={college}
                                      index={index}
                                      moveCollege={moveCollege}
                                      handleRemoveCollege={handleRemoveCollegeFromUserList}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="bg-gray-100 p-4 rounded-full mb-3">
                                  <Plus size={24} className="text-gray-500" />
                                </div>
                                <p className="font-medium text-gray-700">No colleges selected yet</p>
                                <p className="text-gray-500 text-sm mt-1">Search and select colleges from the left panel</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Selected Tab - Only shows the selected colleges in a larger view */
                    <div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">Selected Colleges</h3>
                            <p className="text-sm text-gray-600">Managing {editListFormData.colleges.length} colleges in this list</p>
                          </div>
                        </div>
                        
                        {editListFormData.colleges.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditListFormData({...editListFormData, colleges: []})}
                            className="flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-[500px]">
                        {editListFormData.colleges.length > 0 ? (
                          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                              <thead className="bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10 shadow-sm">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-6/12">
                                    Institute Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-4/12">
                                    Branch
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-2/12">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {editListFormData.colleges.map((college, index) => (
                                  <DraggableCollegeItem
                                    key={college.uniqueId || `${college.id}_${index}`}
                                    college={college}
                                    index={index}
                                    moveCollege={moveCollege}
                                    handleRemoveCollege={handleRemoveCollegeFromUserList}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="bg-gray-100 p-6 rounded-full mb-4">
                              <School size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Colleges Selected</h3>
                            <p className="text-gray-500 mb-6 max-w-md">Start adding colleges to this list by switching to the search tab</p>
                            <button
                              onClick={() => setActiveTab('search')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                            >
                              <Search size={18} className="mr-2" />
                              Search Colleges
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with actions */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t py-4 px-6 flex items-center justify-between shadow-lg z-10">
            <div className="text-sm text-gray-600 flex items-center">
              <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                <CheckCircle size={16} className="text-green-600 mr-2" />
                <span className="font-medium">{editListFormData.colleges.length}</span>
                <span className="text-gray-500 ml-1">colleges in list</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (editListFormData.title && editListFormData.colleges.length > 0) {
                    // Get the correct list ID - check all possible ID fields
                    const listId = editingUserList.id || editingUserList.listId || editingUserList.originalListId;
                    console.log('Saving list with ID:', listId);
                    console.log('Editing list object:', editingUserList);
                    
                    handleSaveUserList(listId);
                  }
                }}
                disabled={!editListFormData.title || editListFormData.colleges.length === 0}
                className={`px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center font-medium ${
                  editListFormData.title && editListFormData.colleges.length > 0 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle size={18} className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default EditListModal;
