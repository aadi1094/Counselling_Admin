import React from 'react';

const CollegeSearchResults = ({ searchResults, selectedColleges, addCollegeToList, searchQuery, selectedCity, selectedBranch }) => {
  return (
    <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
        <div className="text-xs text-gray-500">
          {searchResults.length} colleges found
        </div>
      </div>
      <div className="h-full overflow-y-auto">
        {searchResults.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {searchResults.flatMap(college => {
              // Create an array of branch items for each college
              const branchItems = [];
              
              // Add the college as a main item
              branchItems.push(
                <div key={college.id} className="p-3 border-b border-gray-200">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-t-md">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{college.instituteName}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">
                          Code: {college.instituteCode}
                        </span>
                        {college.city && (
                          <span className="text-xs text-gray-500">
                            {college.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
              
              // Add each branch as a separate item
              if (college.branches && college.branches.length > 0) {
                college.branches
                  .filter(branch => !selectedBranch || branch.branchName.toLowerCase().includes(selectedBranch.toLowerCase()))
                  .forEach(branch => {
                    const isSelected = selectedColleges.some(
                      c => c.id === college.id && c.selectedBranchCode === branch.branchCode
                    );
                    
                    branchItems.push(
                      <div key={`${college.id}_${branch.branchCode}`} className="border-b border-gray-100">
                        <div className="flex justify-between items-center p-3 hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="pl-2 flex-1">
                              <div className="font-medium text-gray-700 flex items-center">
                                <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                                {college.instituteName}
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {branch.branchCode}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 ml-4 mt-1">
                                {branch.branchName}
                                {college.city && ` • ${college.city}`}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addCollegeToList(college, branch)}
                            disabled={isSelected}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {isSelected ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  });
              }
              
              return branchItems;
            })}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchQuery || selectedCity || selectedBranch 
              ? 'No colleges found. Try different search terms.' 
              : 'Search for colleges to add them to your list.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeSearchResults;
