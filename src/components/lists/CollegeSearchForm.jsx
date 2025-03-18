import React from 'react';
import { Search, X } from 'lucide-react';
import FilterDropdown from './FilterDropdown';

const CollegeSearchForm = ({
  searchQuery,
  handleSearchChange,
  searchColleges,
  isSearching,
  selectedCity,
  citySearchInput,
  setCitySearchInput,
  showCityFilter,
  setShowCityFilter,
  handleCitySelect,
  filteredCities,
  selectedBranch,
  branchSearchInput,
  setBranchSearchInput,
  showBranchFilter,
  setShowBranchFilter,
  handleBranchSelect,
  filteredBranches
}) => {
  return (
    <div className="mb-4 space-y-3">
      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Colleges</label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap mt-3 gap-2">
          <button
            type="button"
            onClick={() => searchColleges(searchQuery, selectedCity, selectedBranch)}
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Search size={14} className="mr-1" />
            Search
          </button>
          {(searchQuery || selectedCity || selectedBranch) && (
            <button
              type="button"
              onClick={() => {
                searchColleges('', '', '');
                return { searchQuery: '', selectedCity: '', selectedBranch: '' };
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X size={14} className="mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FilterDropdown 
          label="Filter by City"
          searchValue={citySearchInput}
          onSearchChange={(e) => setCitySearchInput(e.target.value)}
          placeholder="Search cities..."
          showFilter={showCityFilter}
          toggleFilter={() => {
            if (selectedCity) {
              handleCitySelect('');
            } else {
              setShowCityFilter(!showCityFilter);
            }
          }}
          selectedValue={selectedCity}
          onValueSelect={handleCitySelect}
          filteredOptions={filteredCities}
          bgColor="blue"
        />
        
        <FilterDropdown 
          label="Filter by Branch"
          searchValue={branchSearchInput}
          onSearchChange={(e) => setBranchSearchInput(e.target.value)}
          placeholder="Search branches..."
          showFilter={showBranchFilter}
          toggleFilter={() => {
            if (selectedBranch) {
              handleBranchSelect('');
            } else {
              setShowBranchFilter(!showBranchFilter);
            }
          }}
          selectedValue={selectedBranch}
          onValueSelect={handleBranchSelect}
          filteredOptions={filteredBranches}
          bgColor="green"
        />
      </div>
    </div>
  );
};

export default CollegeSearchForm;
