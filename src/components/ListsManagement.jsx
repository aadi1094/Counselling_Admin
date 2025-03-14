import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { Plus, Edit, Trash2, X, GripVertical, Search, CheckCircle, Filter } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// DraggableItem component for list items
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

// Add a new component for draggable college item
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
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-400 cursor-move mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
            <div className="text-xs text-gray-500">Status: {college.status || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {college.selectedBranchCode || college.instituteCode}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {college.city}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
          {college.selectedBranch || 'All Branches'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveCollege(index);
          }}
          className="text-red-600 hover:text-red-900 transition-colors duration-200"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

const ListsManagement = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    items: [],
    userIds: [] // Add this
  });
  const [newItem, setNewItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedListId, setExpandedListId] = useState(null);
  const [usersInList, setUsersInList] = useState({});
  const [availableCities, setAvailableCities] = useState([]);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [availableBranches, setAvailableBranches] = useState([]);
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [expandedColleges, setExpandedColleges] = useState({}); // Add this state to track expanded colleges
  const [citySearchInput, setCitySearchInput] = useState('');
  const [branchSearchInput, setBranchSearchInput] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);

  useEffect(() => {
    fetchLists();
    fetchAllCities();
    fetchAllBranches();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/lists');
      setLists(response.data);
      
      // Fetch user details for each list that has users
      const usersToFetch = new Set();
      response.data.forEach(list => {
        if (list.userIds && list.userIds.length > 0) {
          list.userIds.forEach(userId => usersToFetch.add(userId));
        }
      });
      
      if (usersToFetch.size > 0) {
        // Fetch details for all users in batches
        const userDetails = {};
        // In a real app, you might want to batch these requests
        for (const userId of usersToFetch) {
          try {
            const userResponse = await axiosInstance.get(`/api/admin/user/${userId}`);
            userDetails[userId] = userResponse.data;
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            userDetails[userId] = { name: 'Unknown user', id: userId };
          }
        }
        setUsersInList(userDetails);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch lists');
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all unique cities
  const fetchAllCities = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/search-colleges', {
        params: { fetchAllCities: true }
      });
      
      // Extract unique cities from the response
      if (response.data && response.data.length > 0) {
        // Get unique cities and sort them alphabetically
        const cities = [...new Set(response.data
          .filter(college => college.city)
          .map(college => college.city))]
          .sort();
          
        setAvailableCities(cities);
      }
    } catch (err) {
      console.error('Error fetching city list:', err);
    }
  };

  // Function to fetch all unique branches
  const fetchAllBranches = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/search-colleges', {
        params: { fetchAllBranches: true }
      });
      
      // Extract unique branches from the response
      if (response.data && response.data.length > 0) {
        // Get unique branch names from all colleges
        let allBranches = [];
        response.data.forEach(college => {
          if (college.branches && Array.isArray(college.branches)) {
            college.branches.forEach(branch => {
              if (branch.branchName) {
                allBranches.push(branch.branchName);
              }
            });
          }
        });
        
        // Filter unique branch names and sort alphabetically
        const branches = [...new Set(allBranches)].sort();
        setAvailableBranches(branches);
      }
    } catch (err) {
      console.error('Error fetching branch list:', err);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setShowBranchFilter(false);
    
    if (branch || selectedCity) {
      searchColleges(searchQuery, selectedCity, branch); // Search with current query, city, and branch
    } else {
      setSearchResults([]); // Clear results when "All Branches" is selected and no other filter is active
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityFilter(false);
    
    if (city || selectedBranch) {
      searchColleges(searchQuery, city, selectedBranch); // Search with current query, city, and branch
    } else {
      setSearchResults([]); // Clear results when "All Cities" is selected and no other filter is active
    }
  };

  const handleEdit = (list) => {
    setEditingList(list);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await axiosInstance.delete(`/api/admin/delete-list/${id}`);
        setLists(lists.filter(list => list.id !== id));
      } catch (err) {
        setError('Failed to delete list');
      }
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFormData({
        ...formData,
        items: [...formData.items, newItem.trim()]
      });
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // Improve the search function to properly handle city and branch filters together
  const searchColleges = async (query, cityFilter = selectedCity, branchFilter = selectedBranch) => {
    try {
      setIsSearching(true);
      
      // Build query parameters
      const params = {};
      if (query) {
        if (!isNaN(query)) {
          params.instituteCode = query;
        } else {
          params.instituteName = query;
        }
      }
      
      if (cityFilter) {
        params.city = cityFilter;
      }
      
      // Only make API call if we have at least one parameter or branch filter
      if (Object.keys(params).length === 0 && !branchFilter) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      const response = await axiosInstance.get('/api/admin/search-colleges', { params });
      let results = response.data;
      
      // If branch filter is applied, auto-expand and filter colleges with matching branches
      if (branchFilter) {
        const newExpandedColleges = {};
        
        results = results.filter(college => {
          if (college.branches && college.branches.some(branch => 
            branch.branchName.toLowerCase().includes(branchFilter.toLowerCase())
          )) {
            // Auto-expand colleges with matching branches
            newExpandedColleges[college.id] = true;
            return true;
          }
          return false;
        });
        
        // Update expanded colleges state
        setExpandedColleges(prev => ({...prev, ...newExpandedColleges}));
      }
      
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching colleges:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Update the search input to trigger search on every change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(() => {
        searchColleges(value, selectedCity, selectedBranch);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  // Modify the add college to list functionality
  const addCollegeToList = (college, branch = null) => {
    // Create a unique identifier for the college-branch combination
    const uniqueId = branch 
      ? `${college.id}_${branch.branchCode}`
      : college.id;
      
    // Check if this college-branch combo is already selected
    if (!selectedColleges.some(c => 
      (branch && c.id === college.id && c.selectedBranchCode === branch.branchCode) ||
      (!branch && c.id === college.id && !c.selectedBranchCode)
    )) {
      const collegeToAdd = {
        ...college,
        uniqueId,
        selectedBranch: branch ? branch.branchName : null,
        selectedBranchCode: branch ? branch.branchCode : null
      };
      
      setSelectedColleges([...selectedColleges, collegeToAdd]);
    }
  };

  // Fix the removeCollegeFromList function to use index instead of id and branchCode
  const removeCollegeFromList = (index) => {
    const updatedColleges = [...selectedColleges];
    updatedColleges.splice(index, 1);
    setSelectedColleges(updatedColleges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        title: formData.title,
        colleges: selectedColleges,
        userIds: formData.userIds || [] // Include userIds
      };

      if (editingList?.id) {
        await axiosInstance.post(`/api/admin/edit-list/${editingList.id}`, submitData);
        setLists(lists.map(list => 
          list.id === editingList.id ? { ...list, ...submitData } : list
        ));
      } else {
        const response = await axiosInstance.post('/api/admin/add-list', submitData);
        setLists([...lists, response.data]);
      }
      setShowModal(false);
      setEditingList(null);
      setFormData({ title: '' });
      setSelectedColleges([]);
    } catch (err) {
      setError('Failed to save list');
    }
  };

  const openModal = (list = null) => {
    if (list) {
      setFormData({
        title: list.title || ''
      });
      setSelectedColleges(list.colleges || []);
      setEditingList(list);
    } else {
      setFormData({ title: '' });
      setSelectedColleges([]);
      setEditingList(null);
    }
    setShowModal(true);
  };

  const moveItem = (dragIndex, hoverIndex) => {
    const dragItem = formData.items[dragIndex];
    const newItems = [...formData.items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const moveCollege = (dragIndex, hoverIndex) => {
    const dragCollege = selectedColleges[dragIndex];
    const newColleges = [...selectedColleges];
    newColleges.splice(dragIndex, 1);
    newColleges.splice(hoverIndex, 0, dragCollege);
    setSelectedColleges(newColleges);
  };

  // Update the renderSelectedColleges function to show branch information
  const renderSelectedColleges = () => (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Institute Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Branch Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              City
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
          {selectedColleges.map((college, index) => (
            <DraggableCollegeItem
              key={college.uniqueId || `${college.id}_${index}`}
              college={college}
              index={index}
              moveCollege={moveCollege}
              handleRemoveCollege={removeCollegeFromList}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleListClick = (listId) => {
    setExpandedListId(expandedListId === listId ? null : listId);
  };

  // Add toggle function for college branches
  const toggleCollegeBranches = (collegeId) => {
    setExpandedColleges(prev => ({
      ...prev,
      [collegeId]: !prev[collegeId]
    }));
  };

  // Filter cities based on search input
  useEffect(() => {
    if (citySearchInput) {
      const filtered = availableCities.filter(city => 
        city.toLowerCase().includes(citySearchInput.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(availableCities);
    }
  }, [citySearchInput, availableCities]);

  // Filter branches based on search input
  useEffect(() => {
    if (branchSearchInput) {
      const filtered = availableBranches.filter(branch => 
        branch.toLowerCase().includes(branchSearchInput.toLowerCase())
      );
      setFilteredBranches(filtered);
    } else {
      setFilteredBranches(availableBranches);
    }
  }, [branchSearchInput, availableBranches]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Update the search results section to display each branch as a separate entity
  const renderSearchResults = () => (
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
  );

  // Enhanced list details display
  const renderListDetails = (list) => {
    return (
      <>
        

        {/* Display colleges */}
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Colleges in this list
          </h4>
          {list.colleges && list.colleges.length > 0 ? (
            <div className="bg-white rounded-md shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Institute Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Branch Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Branch
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {list.colleges.map((college, index) => (
                    <tr key={college.uniqueId || `${college.id}_${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
                        <div className="text-xs text-gray-500">Status: {college.status || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {college.selectedBranchCode || college.instituteCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {college.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {college.selectedBranch || 'All Branches'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
              No colleges in this list
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Show back button when a list is expanded */}
          {expandedListId && (
            <button
              onClick={() => setExpandedListId(null)}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Lists
            </button>
          )}

          {/* Header section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {expandedListId ? 'List Details' : 'Lists Management'}
            </h1>
            {!expandedListId && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                onClick={() => openModal()}
              >
                <Plus size={20} className="mr-2" />
                Add New List
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md shadow-sm">
              {error}
            </div>
          )}

          {/* List Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
              <div className="bg-white w-full h-full max-h-screen flex flex-col">
                <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editingList ? 'Edit List' : 'Create New List'}
                  </h2>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
                  {/* List Details - Removed description */}
                  <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter list title..."
                        required
                      />
                    </div>
                  </div>

                  {/* College Selection Area - Full width with two column layout */}
                  <div className="border-t pt-6 mt-6 max-w-6xl mx-auto">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Select Colleges
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Search & Results */}
                      <div className="h-[calc(100vh-280px)] flex flex-col">
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
                                    setSearchQuery('');
                                    setSelectedCity('');
                                    setSelectedBranch('');
                                    searchColleges('', '', '');
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
                            {/* City Filter - Enhanced */}
                            <div className="relative bg-white p-4 rounded-md shadow-sm border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by City</label>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    value={citySearchInput}
                                    onChange={(e) => setCitySearchInput(e.target.value)}
                                    placeholder="Search cities..."
                                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Search size={14} className="text-gray-400" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedCity) {
                                      handleCitySelect('');
                                    } else {
                                      setShowCityFilter(!showCityFilter);
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {selectedCity ? <X size={14} /> : 'Browse'}
                                </button>
                              </div>
                              
                              {selectedCity && (
                                <div className="mt-1 flex items-center">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    {selectedCity}
                                    <button 
                                      className="ml-1 text-blue-600 hover:text-blue-800"
                                      onClick={() => handleCitySelect('')}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                </div>
                              )}
                              
                              {showCityFilter && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  <div 
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                                    onClick={() => handleCitySelect('')}
                                  >
                                    All Cities
                                  </div>
                                  {filteredCities.map((city) => (
                                    <div
                                      key={city}
                                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                                        city === selectedCity ? 'bg-blue-50 text-blue-700' : ''
                                      }`}
                                      onClick={() => handleCitySelect(city)}
                                    >
                                      {city}
                                      {city === selectedCity && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                          <CheckCircle size={16} className="text-blue-600" />
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Branch Filter - Enhanced */}
                            <div className="relative bg-white p-4 rounded-md shadow-sm border border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="relative flex-grow">
                                  <input
                                    type="text"
                                    value={branchSearchInput}
                                    onChange={(e) => setBranchSearchInput(e.target.value)}
                                    placeholder="Search branches..."
                                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Search size={14} className="text-gray-400" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedBranch) {
                                      handleBranchSelect('');
                                    } else {
                                      setShowBranchFilter(!showBranchFilter);
                                    }
                                  }}
                                  className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {selectedBranch ? <X size={14} /> : 'Browse'}
                                </button>
                              </div>
                              
                              {selectedBranch && (
                                <div className="mt-1 flex items-center">
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                                    {selectedBranch}
                                    <button 
                                      className="ml-1 text-green-600 hover:text-green-800"
                                      onClick={() => handleBranchSelect('')}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                </div>
                              )}
                              
                              {showBranchFilter && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  <div 
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                                    onClick={() => handleBranchSelect('')}
                                  >
                                    All Branches
                                  </div>
                                  {filteredBranches.map((branch) => (
                                    <div
                                      key={branch}
                                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                                        branch === selectedBranch ? 'bg-blue-50 text-blue-700' : ''
                                      }`}
                                      onClick={() => handleBranchSelect(branch)}
                                    >
                                      {branch}
                                      {branch === selectedBranch && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                          <CheckCircle size={16} className="text-blue-600" />
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Search Results with enhanced styling */}
                        <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white shadow-sm">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
                            <div className="text-xs text-gray-500">
                              {searchResults.length} colleges found
                            </div>
                          </div>
                          {renderSearchResults()}
                        </div>
                      </div>

                      {/* Right Column - Selected Colleges with enhanced styling */}
                      <div className="h-[calc(100vh-280px)] flex flex-col">
                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Selected Colleges
                              {selectedColleges.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                  {selectedColleges.length}
                                </span>
                              )}
                            </label>
                            {selectedColleges.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedColleges([])}
                                className="text-sm text-red-500 hover:text-red-700 flex items-center"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 border border-gray-200 rounded-md bg-gray-50 overflow-hidden shadow-sm">
                          <div className="h-full overflow-y-auto p-2">
                            {selectedColleges.length > 0 ? renderSelectedColleges() : (
                              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                                <div className="bg-gray-100 p-3 rounded-full mb-3">
                                  <Plus size={24} className="text-gray-400" />
                                </div>
                                <p className="font-medium">No colleges selected yet</p>
                                <p className="text-sm mt-1">Search and select colleges from the left panel</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions with improved styling - Moved to the bottom */}
                  <div className="sticky bottom-0 left-0 right-0 bg-white border-t mt-6 pt-4 pb-4 px-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {selectedColleges.length > 0 && 
                        <span className="flex items-center">
                          <CheckCircle size={16} className="mr-2 text-green-500" />
                          {selectedColleges.length} colleges selected
                        </span>
                      }
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!formData.title || selectedColleges.length === 0}
                        className={`px-5 py-2 rounded-md shadow-sm transition-colors flex items-center ${
                          formData.title && selectedColleges.length > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Save List
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lists Grid */}
          <div className="grid gap-6">
            {lists.length > 0 ? (
              lists.map((list) => (
                <div key={list.id} className="bg-white rounded-lg shadow-md transition-all hover:shadow-lg">
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
                            openModal(list);
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
                      {renderListDetails(list)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Lists Created Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first list by clicking the "Add New List" button</p>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                    onClick={() => openModal()}
                  >
                    <Plus size={20} className="mr-2" />
                    Add New List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ListsManagement;