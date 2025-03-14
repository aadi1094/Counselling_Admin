import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3004';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [nextPageId, setNextPageId] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    phone: ''
  });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    premium: false
  });
  const [showListsModal, setShowListsModal] = useState(false);
  const [availableLists, setAvailableLists] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userLists, setUserLists] = useState({});
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [selectedUserLists, setSelectedUserLists] = useState([]);
  const [selectedUserListsId, setSelectedUserListsId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [editingUserList, setEditingUserList] = useState(null);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListFormData, setEditListFormData] = useState({
    title: '',
    colleges: []
  });
  const [searchCollegeQuery, setSearchCollegeQuery] = useState('');
  const [collegeSearchResults, setCollegeSearchResults] = useState([]);
  const [isSearchingColleges, setIsSearchingColleges] = useState(false);

  // Create axios instance with authentication header
  const getAuthAxios = () => {
    const token = localStorage.getItem('adminToken');
    return axios.create({
      baseURL: API_URL,
      headers: {
        token: token
      }
    });
  };

  // Fetch users on initial load and pagination changes
  useEffect(() => {
    if (!isSearchMode) {
      fetchUsers();
    }
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`/api/admin/all-users`, {
        params: {
          page: currentPage,
          limit: pageSize,
          lastDocId: nextPageId
        }
      });
      
      setUsers(response.data);
      setNextPageId(response.data.nextPageId);
      setHasMore(response.data.hasMore);
      
      // Get all lists to check user assignments
      const listsResponse = await authAxios.get('/api/admin/lists');
      const lists = listsResponse.data;
      
      // Create a mapping of user ID to their assigned lists
      const userListsMap = {};
      lists.forEach(list => {
        if (list.userIds && list.userIds.length) {
          list.userIds.forEach(userId => {
            if (!userListsMap[userId]) {
              userListsMap[userId] = [];
            }
            userListsMap[userId].push({ id: list.id, title: list.title });
          });
        }
      });
      
      setUserLists(userListsMap);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Authentication required. Please log in again.');
        // Redirect to login or handle token expiration
        // window.location.href = '/admin/login';
      } else {
        setError('Failed to fetch users');
      }
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setIsSearchMode(true);
      
      // Filter out empty search params
      const filteredParams = Object.entries(searchParams)
        .filter(([_, value]) => value !== '')
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      
      const authAxios = getAuthAxios();
      const response = await authAxios.post(`/api/admin/user/search`, filteredParams);
      
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to search users');
      }
      setLoading(false);
      console.error('Error searching users:', err);
    }
  };

  const resetSearch = () => {
    setSearchParams({
      name: '',
      phone: ''
    });
    setIsSearchMode(false);
    setCurrentPage(1);
    setNextPageId(null);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      premium: user.premium || false
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const authAxios = getAuthAxios();
        await authAxios.delete(`/api/admin/delete-user/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError('Failed to delete user');
        }
        console.error('Error deleting user:', err);
      }
    }
  };

  const fetchLists = async () => {
    try {
      setLoading(true);
      const authAxios = getAuthAxios();
      const response = await authAxios.get('/api/admin/lists');
      setAvailableLists(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to fetch lists');
      setLoading(false);
    }
  };

  const handleAddToList = async (userId) => {
    setSelectedUserId(userId);
    setShowListsModal(true);
    await fetchLists();
  };

  const handleListSelection = async (listId) => {
    try {
      const authAxios = getAuthAxios();
      await authAxios.post(`/api/admin/edit-list/${listId}`, {
        userId: selectedUserId
      });
      
      // Update the local list data to reflect the change
      setAvailableLists(availableLists.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              userIds: [...(list.userIds || []), selectedUserId],
              userCount: (list.userCount || 0) + 1
            } 
          : list
      ));
      
      // Also update the userLists state to show the change immediately in the UI
      const selectedList = availableLists.find(list => list.id === listId);
      if (selectedList) {
        setUserLists(prevUserLists => {
          const updatedUserLists = { ...prevUserLists };
          if (!updatedUserLists[selectedUserId]) {
            updatedUserLists[selectedUserId] = [];
          }
          // Don't add duplicate entries
          if (!updatedUserLists[selectedUserId].some(item => item.id === listId)) {
            updatedUserLists[selectedUserId].push({
              id: listId,
              title: selectedList.title
            });
          }
          return updatedUserLists;
        });
      }
      
      setShowListsModal(false);
      setSelectedUserId(null);
      // Show success message
      alert('User added to list successfully');
      
      // Optionally refresh the user data to ensure everything is in sync
      // fetchUsers();
    } catch (err) {
      setError('Failed to add user to list');
      console.error('Error adding user to list:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authAxios = getAuthAxios();
      if (editingUser && editingUser.id) {
        // Update existing user
        await authAxios.put(`/api/admin/update-user/${editingUser.id}`, formData);
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...formData } : user
         ));
      } else {
        // Add new user functionality would go here
        // For now, we'll just show an alert
        alert('Add new user functionality to be implemented');
      }
      setEditingUser(null);  // Reset editing state
      setFormData({
        name: '',
        phone: '',
        email: '',
        premium: false
      });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError(editingUser?.id ? 'Failed to update user' : 'Failed to add user');
      }
      console.error('Error saving user:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  // New function to view assigned lists for a specific user
  const handleViewUserLists = async (userId, userName) => {
    try {
      setLoading(true);
      setSelectedUserName(userName);
      setSelectedUserListsId(userId);
      
      const authAxios = getAuthAxios();
      
      // First get all lists assigned to this user
      const listsResponse = await authAxios.get('/api/admin/lists');
      const allLists = listsResponse.data;
      const userLists = allLists.filter(list => 
        list.userIds && list.userIds.includes(userId)
      );

      // Then fetch any user-specific customized versions
      const userListsResponse = await authAxios.get(`/api/admin/user/${userId}/lists`);
      const userSpecificLists = userListsResponse.data;
      
      // For each global list, check if there's a customized version
      const finalLists = userLists.map(globalList => {
        const customVersion = userSpecificLists.find(ul => ul.originalListId === globalList.id);
        if (customVersion) {
          return {
            ...customVersion,
            isCustomized: true
          };
        }
        return {
          ...globalList,
          isCustomized: false
        };
      });

      setSelectedUserLists(finalLists);
      setShowUserListModal(true);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user lists:', err);
      setError('Failed to fetch user lists');
      setLoading(false);
    }
  };

  const handleEditUserList = (list) => {
    setEditingUserList(list);
    setEditListFormData({
      title: list.title,
      colleges: list.colleges || [],
      originalListId: list.originalListId || list.id
    });
    setShowEditListModal(true);
  };

  const handleSaveUserList = async () => {
    try {
      setLoading(true);
      const authAxios = getAuthAxios();
      
      const listData = {
        ...editListFormData,
        userId: selectedUserListsId,
        originalListId: editingUserList.originalListId || editingUserList.id
      };

      let response;
      if (editingUserList.isCustomized) {
        // Update existing customized list
        response = await authAxios.put(
          `/api/admin/user/${selectedUserListsId}/lists/${editingUserList.id}`, 
          listData
        );
      } else {
        // Create new customized list
        response = await authAxios.post(
          `/api/admin/user/${selectedUserListsId}/lists`, 
          listData
        );
      }

      // Update UI
      setSelectedUserLists(prevLists => 
        prevLists.map(list => {
          if (list.id === (editingUserList.originalListId || editingUserList.id)) {
            return {
              ...response.data,
              isCustomized: true
            };
          }
          return list;
        })
      );

      setShowEditListModal(false);
      setEditingUserList(null);
      setLoading(false);
    } catch (err) {
      console.error('Error saving user list:', err);
      setError('Failed to save user list');
      setLoading(false);
    }
  };

  const handleRemoveCollegeFromUserList = (collegeIndex) => {
    setEditListFormData(prevData => ({
      ...prevData,
      colleges: prevData.colleges.filter((_, idx) => idx !== collegeIndex)
    }));
  };

  const searchColleges = async (query) => {
    try {
      setIsSearchingColleges(true);
      const authAxios = getAuthAxios();
      
      // Build query parameters
      const params = {};
      if (query) {
        if (!isNaN(query)) {
          params.instituteCode = query;
        } else {
          params.instituteName = query;
        }
      }
      
      // Only make API call if we have at least one parameter
      if (Object.keys(params).length === 0) {
        setCollegeSearchResults([]);
        setIsSearchingColleges(false);
        return;
      }
      
      const response = await authAxios.get('/api/admin/search-colleges', { params });
      setCollegeSearchResults(response.data);
    } catch (err) {
      console.error('Error searching colleges:', err);
      setCollegeSearchResults([]);
    } finally {
      setIsSearchingColleges(false);
    }
  };

  const handleSearchCollegeChange = (e) => {
    const value = e.target.value;
    setSearchCollegeQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchColleges(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const addCollegeToUserList = (college, branch = null) => {
    // Create a unique identifier for the college-branch combination
    const uniqueId = branch 
      ? `${college.id}_${branch.branchCode}`
      : college.id;
      
    // Check if this college-branch combo is already selected
    if (!editListFormData.colleges.some(c => 
      (branch && c.id === college.id && c.selectedBranchCode === branch.branchCode) ||
      (!branch && c.id === college.id && !c.selectedBranchCode)
    )) {
      const collegeToAdd = {
        ...college,
        uniqueId,
        selectedBranch: branch ? branch.branchName : null,
        selectedBranchCode: branch ? branch.branchCode : null
      };
      
      setEditListFormData(prevData => ({
        ...prevData,
        colleges: [...prevData.colleges, collegeToAdd]
      }));
    }
  };

  const renderListModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Lists for {selectedUserName}</h2>
          <button 
            onClick={() => setShowUserListModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedUserLists.length > 0 ? (
          <div className="space-y-4">
            {selectedUserLists.map(list => (
              <div 
                key={list.id}
                className={`p-4 border rounded-md ${
                  list.isCustomized ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg flex items-center">
                      {list.title}
                      {list.isCustomized && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Customized
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {list.colleges?.length || 0} colleges
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditUserList(list)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    {list.isCustomized ? 'Edit Customized List' : 'Customize List'}
                  </button>
                </div>

                {list.colleges && list.colleges.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Colleges in this list:</h4>
                    <div className="flex flex-wrap gap-2">
                      {list.colleges.slice(0, 5).map((college, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-800">
                          {college.instituteName} 
                          {college.selectedBranch ? ` (${college.selectedBranch})` : ''}
                        </span>
                      ))}
                      {list.colleges.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                          +{list.colleges.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            This user doesn't have any lists assigned yet.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Users Management</h1>
        </div>
        
        {/* Edit Form */}
        {editingUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="premium"
                    name="premium"
                    checked={formData.premium}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="premium" className="ml-2 block text-sm text-gray-900">
                    Premium User
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Users</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={searchParams.name}
                  onChange={handleSearchParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={searchParams.phone}
                  onChange={handleSearchParamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by phone"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-4">
              <button 
                type="button" 
                onClick={resetSearch}
                className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        
        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Users List</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p className="mt-2 text-gray-500 text-lg">
                No users found. {!isSearchMode && "Use the search function to find users."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Premium
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned Lists
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isPremium ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userLists[user.id] && userLists[user.id].length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {userLists[user.id].slice(0, 2).map((list, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs leading-tight rounded-full bg-indigo-100 text-indigo-800">
                                {list.title}
                              </span>
                            ))}
                            {userLists[user.id].length > 2 && (
                              <span className="px-2 py-1 text-xs leading-tight rounded-full bg-gray-100 text-gray-600">
                                +{userLists[user.id].length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No lists assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleAddToList(user.id)}
                          className="text-green-600 hover:text-green-900 mr-4 transition-colors duration-200"
                        >
                          Add to List
                        </button>
                        <button 
                          onClick={() => handleViewUserLists(user.id, user.name)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                        >
                          View Lists
                        </button>
                        <button 
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {currentPage}
                </span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      setNextPageId(null);
                    }
                  }}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                <button 
                  disabled={!hasMore}
                  onClick={() => {
                    if (hasMore) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={`px-3 py-1 rounded-md ${!hasMore ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Add Lists Modal */}
        {showListsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select List</h2>
                <button 
                  onClick={() => setShowListsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : availableLists.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableLists.map(list => {
                    const isSelected = list.userIds && list.userIds.includes(selectedUserId);
                    return (
                      <div 
                        key={list.id}
                        className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center ${
                          isSelected ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => !isSelected && handleListSelection(list.id)}
                      >
                        <div>
                          <h3 className="font-medium">{list.title}</h3>
                          {list.description && (
                            <p className="text-sm text-gray-500">{list.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {list.colleges?.length || 0} colleges
                            </span>
                            {list.userIds && list.userIds.length > 0 && (
                              <span className="text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                                {list.userIds.length} users
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No lists available. Create a list first.
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Lists Modal */}
        {showUserListModal && renderListModal()}

        {/* Edit User List Modal */}
        {showEditListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white rounded-lg w-full max-h-screen flex flex-col">
              <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingUserList.isUserSpecific ? 'Edit Customized List' : 'Customize List for User'}
                </h2>
                <button 
                  onClick={() => setShowEditListModal(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 gap-4 max-w-6xl mx-auto">
                  {/* List Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={editListFormData.title}
                      onChange={(e) => setEditListFormData({...editListFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter list title..."
                      required
                    />
                  </div>
                  {/* College Selection Area */}
                  <div className="border-t pt-6 mt-6 max-w-6xl mx-auto">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      </svg>
                      Colleges in this List
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Search & Results */}
                      <div className="h-[calc(100vh-280px)] flex flex-col">
                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Colleges to Add</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={searchCollegeQuery}
                                onChange={handleSearchCollegeChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by name or code..."
                              />
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                              </div>
                              {isSearchingColleges && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="h-full overflow-y-auto">
                            {collegeSearchResults.length > 0 ? (
                              <div className="divide-y divide-gray-200">
                                {collegeSearchResults.map(college => (
                                  <div key={college.id} className="p-3 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium text-gray-800">{college.instituteName}</div>
                                        {college.city && (
                                          <span className="text-xs text-gray-500">{college.city}</span>
                                        )}
                                        <div className="text-sm text-gray-500 mt-1">
                                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">
                                            Code: {college.instituteCode}
                                          </span>
                                        </div>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => addCollegeToUserList(college)}
                                        className="px-3 py-1 rounded-md text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                      >
                                        Add
                                      </button>
                                    </div>
                                    {/* Show branches if available */}
                                    {college.branches && college.branches.length > 0 && (
                                      <div className="mt-2 pl-4 space-y-1">
                                        {college.branches.map(branch => {
                                          const isSelected = editListFormData.colleges.some(
                                            c => c.id === college.id && c.selectedBranchCode === branch.branchCode
                                          );
                                          return (
                                            <div key={branch.branchCode} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded">
                                              <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                                                <span className="text-sm">{branch.branchName}</span>
                                                <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                  {branch.branchCode}
                                                </span>
                                              </div>
                                              <button 
                                                type="button" 
                                                onClick={() => addCollegeToUserList(college, branch)}
                                                disabled={isSelected}
                                                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                                                  isSelected ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                              >
                                                {isSelected ? 'Added' : 'Add'}
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                {searchCollegeQuery ? 'No colleges found. Try different search terms.' : 'Search for colleges to add them to the list.'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Right Column - Selected Colleges */}
                      <div className="h-[calc(100vh-280px)] flex flex-col">
                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                              Selected Colleges
                              {editListFormData.colleges.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                  {editListFormData.colleges.length}
                                </span>
                              )}
                            </label>
                          </div>
                          <div className="h-full overflow-y-auto p-2">
                            {editListFormData.colleges.length > 0 ? (
                              <div className="flex-1 border border-gray-200 rounded-md bg-gray-50 overflow-hidden shadow-sm">
                                <div className="h-full overflow-y-auto p-2">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
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
                                        <tr key={college.uniqueId || `${college.id}_${index}`} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
                                            <div className="text-xs text-gray-500">{college.city || 'N/A'}</div>
                                          </td>
                                          <td className="px-6 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                              {college.selectedBranch || 'All Branches'}
                                            </span>
                                          </td>
                                          <td className="px-6 py-3 whitespace-nowrap text-right">
                                            <button 
                                              onClick={() => handleRemoveCollegeFromUserList(index)}
                                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                            >
                                              Remove
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
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
                </div>
              </div>
              {/* Footer with actions */}
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-4 pb-4 px-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {editingUserList.isUserSpecific ? "You're editing a user-specific list" : "This customized list will only affect this user's view"}
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowEditListModal(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveUserList}
                    disabled={!editListFormData.title || editListFormData.colleges.length === 0}
                    className={`px-5 py-2 rounded-md shadow-sm transition-colors flex items-center ${
                      editListFormData.title && editListFormData.colleges.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;