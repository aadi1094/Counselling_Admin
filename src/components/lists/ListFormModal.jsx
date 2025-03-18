import React, { useState } from 'react';
import { X, Plus, Search, Trash2, GraduationCap, List, Filter } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CollegeSearchForm from './CollegeSearchForm';
import CollegeSearchResults from './CollegeSearchResults';
import SelectedColleges from './SelectedColleges';

const ListFormModal = ({
  editingList,
  formData,
  setFormData,
  handleSubmit,
  closeModal,
  selectedColleges,
  setSelectedColleges,
  searchQuery,
  handleSearchChange,
  isSearching,
  searchResults,
  searchColleges,
  addCollegeToList,
  citySearchInput,
  setCitySearchInput,
  showCityFilter,
  setShowCityFilter,
  handleCitySelect,
  filteredCities,
  selectedCity,
  branchSearchInput,
  setBranchSearchInput,
  showBranchFilter,
  setShowBranchFilter,
  handleBranchSelect,
  filteredBranches,
  selectedBranch,
  moveCollege,
  removeCollegeFromList
}) => {
  const [activeTab, setActiveTab] = useState('search');

  const clearColleges = () => {
    if (window.confirm('Are you sure you want to clear all selected colleges?')) {
      setSelectedColleges([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen w-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <GraduationCap size={26} className="mr-3" />
          {editingList ? 'Edit College List' : 'Create New College List'}
        </h2>
        <button
          onClick={closeModal}
          className="text-white hover:bg-white/20 transition-all rounded-full p-2"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
      </div>

      {/* List Title Section */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            List Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a descriptive title for this list"
            required
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex max-w-6xl mx-auto">
          <button
            type="button"
            className={`px-6 py-4 font-medium flex items-center text-lg transition-all ${
              activeTab === 'search' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={20} className="mr-2" />
            Search Colleges
          </button>
          <button
            type="button"
            className={`px-6 py-4 font-medium flex items-center text-lg transition-all ${
              activeTab === 'selected' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('selected')}
          >
            <List size={20} className="mr-2" />
            Selected Colleges
            <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {selectedColleges.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Takes all available space */}
      <div className="flex-grow overflow-y-auto bg-gray-100">
        <DndProvider backend={HTML5Backend}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            {activeTab === 'search' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Search Panel */}
                <div className="flex flex-col space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Filter size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-800">Search and Filter</h3>
                    </div>
                    <CollegeSearchForm
                      searchQuery={searchQuery}
                      handleSearchChange={handleSearchChange}
                      searchColleges={searchColleges}
                      isSearching={isSearching}
                      selectedCity={selectedCity}
                      citySearchInput={citySearchInput}
                      setCitySearchInput={setCitySearchInput}
                      showCityFilter={showCityFilter}
                      setShowCityFilter={setShowCityFilter}
                      handleCitySelect={handleCitySelect}
                      filteredCities={filteredCities}
                      selectedBranch={selectedBranch}
                      branchSearchInput={branchSearchInput}
                      setBranchSearchInput={setBranchSearchInput}
                      showBranchFilter={showBranchFilter}
                      setShowBranchFilter={setShowBranchFilter}
                      handleBranchSelect={handleBranchSelect}
                      filteredBranches={filteredBranches}
                    />
                  </div>
                  <div className="bg-white rounded-lg shadow-sm flex-grow border border-gray-200 overflow-y-auto">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                        <Search size={20} className="text-blue-600 mr-2" />
                        Search Results
                        {searchResults.length > 0 && (
                          <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                            {searchResults.length} colleges found
                          </span>
                        )}
                      </h3>
                      <CollegeSearchResults
                        searchResults={searchResults}
                        selectedColleges={selectedColleges}
                        addCollegeToList={addCollegeToList}
                        searchQuery={searchQuery}
                        selectedCity={selectedCity}
                        selectedBranch={selectedBranch}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Selected Colleges Panel */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center">
                      <GraduationCap size={20} className="text-blue-600 mr-2" />
                      Selected Colleges ({selectedColleges.length})
                    </h3>
                    {selectedColleges.length > 0 && (
                      <button
                        type="button"
                        onClick={clearColleges}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    <SelectedColleges
                      selectedColleges={selectedColleges}
                      clearColleges={clearColleges}
                      moveCollege={moveCollege}
                      removeCollegeFromList={removeCollegeFromList}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Selected Tab Content */
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <GraduationCap size={20} className="text-blue-600 mr-2" />
                    Selected Colleges ({selectedColleges.length})
                  </h3>
                  {selectedColleges.length > 0 && (
                    <button
                      type="button"
                      onClick={clearColleges}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded flex items-center text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Clear All
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto">
                  <SelectedColleges
                    selectedColleges={selectedColleges}
                    clearColleges={clearColleges}
                    moveCollege={moveCollege}
                    removeCollegeFromList={removeCollegeFromList}
                  />
                </div>
              </div>
            )}
          </div>
        </DndProvider>
      </div>

      {/* Footer - Action Buttons */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end gap-4 max-w-7xl mx-auto">
          <button
            type="button"
            onClick={closeModal}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title || selectedColleges.length === 0}
            className={`px-6 py-3 rounded-lg text-white font-medium flex items-center transition-all text-lg ${
              !formData.title || selectedColleges.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus size={20} className="mr-2" />
            {editingList ? 'Update List' : 'Create List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFormModal;