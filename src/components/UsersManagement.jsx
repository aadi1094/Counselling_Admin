import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, CheckCircle, Edit, Plus, Trash2, GripVertical } from 'lucide-react';
import OrderEditableList from './OrderEditableList';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const API_URL = 'http://localhost:3008';

// Add DraggableCollegeItem component
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
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <GripVertical size={16} className="text-gray-400 cursor-move mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{college.instituteName}</div>
            <div className="text-xs text-gray-500">{college.city || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
          {college.selectedBranch || 'All Branches'}
        </span>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-right">
        <button 
          onClick={() => handleRemoveCollege(index)}
          className="text-red-600 hover:text-red-900 transition-colors duration-200"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

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
  const [editingOrderList, setEditingOrderList] = useState(null);

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
      
      // Response.data should now include lists array for each user
      setUsers(response.data);
      setNextPageId(response.data.nextPageId);
      setHasMore(response.data.hasMore);
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
        setLoading(true);
        const authAxios = getAuthAxios();
        
        // First fetch the complete list details
        const listResponse = await authAxios.get(`/api/admin/list/${listId}`);
        const selectedList = listResponse.data;
        
        // Create timestamp
        const timestamp = new Date().toISOString();
        
        // Prepare list data for assignment with all required fields
        const listAssignment = {
            id: `${listId}_${selectedUserId}_${timestamp}`,
            originalListId: listId,
            title: selectedList.title,
            colleges: selectedList.colleges || [],
            createdAt: timestamp,
            updatedAt: timestamp,
            customized: false,
            isCustomized: false
        };

        // Assign list to user
        await authAxios.post(`/api/admin/user/${selectedUserId}/assign-list`, listAssignment);
        
        // Update local state
        setUsers(users.map(user => {
            if (user.id === selectedUserId) {
                return {
                    ...user,
                    lists: [...(user.lists || []), listAssignment]
                };
            }
            return user;
        }));
        
        setShowListsModal(false);
        setSelectedUserId(null);
        setLoading(false);
        alert('List assigned to user successfully');
    } catch (err) {
        setError('Failed to add list to user');
        console.error('Error adding list to user:', err);
        setLoading(false);
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
        
        // Find user from current users state
        const user = users.find(u => u.id === userId);
        if (user) {
            setSelectedUserLists(user.lists || []);
            setShowUserListModal(true);
        }
        setLoading(false);
    } catch (err) {
        console.error('Error fetching user lists:', err);
        setError('Failed to fetch user lists');
        setLoading(false);
    }
};

  // Update the handleEditUserList function to properly initialize data
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
        title: editListFormData.title,
        colleges: editListFormData.colleges,
        isCustomized: true
      };

      // Use the listId from the list assignment
      console.log(`/api/admin/user/${selectedUserListsId}/list/${editingUserList}`,);
      
      const response = await authAxios.put(
        `/api/admin/user/${selectedUserListsId}/list/${editingUserList.id}`, 
        listData
      );

      // Update the lists in state
      setSelectedUserLists(prevLists => 
        prevLists.map(list => 
          list.listId === editingUserList.listId ? response.data : list
        )
      );

      setShowEditListModal(false);
      setEditingUserList(null);
      setLoading(false);

      // Also update the user's lists in the main users array
      setUsers(users.map(user => {
        if (user.id === selectedUserListsId) {
          return {
            ...user,
            lists: user.lists.map(list => 
              list.listId === editingUserList.listId ? response.data : list
            )
          };
        }
        return user;
      }));

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

  const handleSaveOrder = async (updatedList) => {
    try {
      setLoading(true);
      const authAxios = getAuthAxios();
      
      // Change this to use listId instead of id
      const response = await authAxios.put(
        `/api/admin/user/${selectedUserListsId}/list/${updatedList.listId}`, 
        updatedList
      );
  
      // Update the lists in state using listId for comparison
      setSelectedUserLists(prevLists => 
        prevLists.map(list => 
          list.listId === updatedList.listId ? response.data : list
        )
      );
  
      // Update users array using listId for comparison
      setUsers(users.map(user => {
        if (user.id === selectedUserListsId) {
          return {
            ...user,
            lists: user.lists.map(list => 
              list.listId === updatedList.listId ? response.data : list
            )
          };
        }
        return user;
      }));
  
    } catch (err) {
      console.error('Error saving list order:', err);
      setError('Failed to save list order');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserList = async (list) => {
    if (window.confirm('Are you sure you want to remove this list from the user?')) {
      try {
        setLoading(true);
        const authAxios = getAuthAxios();
        await authAxios.delete(`/api/admin/user/${selectedUserListsId}/list/${list.id}`);
        
        // Update local state
        setSelectedUserLists(prevLists => prevLists.filter(l => l.id !== list.id));
        
        // Update users array
        setUsers(users.map(user => {
          if (user.id === selectedUserListsId) {
            return {
              ...user,
              lists: user.lists.filter(l => l.id !== list.id)
            };
          }
          return user;
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error removing list:', err);
        setError('Failed to remove list');
        setLoading(false);
      }
    }
  };

  const renderListModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Lists for {selectedUserName}</h2>
          <button 
            onClick={() => setShowUserListModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedUserLists.length > 0 ? (
          <div className="space-y-5">
            {selectedUserLists.map(list => (
              <div key={list.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="p-5 flex justify-between items-center">
                  <button
                    onClick={() => setEditingOrderList(list)}
                    className="text-lg font-medium text-left hover:text-blue-600 flex-grow"
                  >
                    {list.title}
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditUserList(list)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors flex items-center"
                    >
                      <Edit size={16} className="mr-2" />
                      Customize
                    </button>
                    <button
                      onClick={() => handleRemoveUserList(list)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
                {/* List details are only shown when expanded */}
                {list.expanded && (
                  <div className="border-t p-4">
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
                          {list.colleges?.map((college, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700">No Lists Assigned</h3>
              <p className="mt-2 text-gray-500">This user doesn't have any lists assigned yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Add drag and drop functionality to the edit modal colleges section
  const moveCollege = (dragIndex, hoverIndex) => {
    const dragCollege = editListFormData.colleges[dragIndex];
    const updatedColleges = [...editListFormData.colleges];
    updatedColleges.splice(dragIndex, 1);
    updatedColleges.splice(hoverIndex, 0, dragCollege);
    setEditListFormData(prevData => ({
      ...prevData,
      colleges: updatedColleges
    }));
  };

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
                        {user.lists && user.lists.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                              {user.lists.slice(0, 2).map((list, idx) => (
                                  <span key={idx} className="px-2 py-1 text-xs leading-tight rounded-full bg-indigo-100 text-indigo-800">
                                      {list.title}
                                  </span>
                              ))}
                              {user.lists.length > 2 && (
                                  <span className="px-2 py-1 text-xs leading-tight rounded-full bg-gray-100 text-gray-600">
                                      +{user.lists.length - 2} more
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

        {/* Edit User List Modal - Completely redesigned for better UI and spacing */}
        {showEditListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
            <DndProvider backend={HTML5Backend}>
              <div className="bg-white rounded-xl w-full max-w-7xl max-h-screen flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {editingUserList.isUserSpecific ? 'Edit Customized List' : 'Customize List for User'}
                  </h2>
                  <button 
                    onClick={() => setShowEditListModal(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                  <div className="max-w-6xl mx-auto space-y-6">
                    {/* List Title */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">List Title</label>
                      <input 
                        type="text" 
                        value={editListFormData.title}
                        onChange={(e) => setEditListFormData({...editListFormData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                        placeholder="Enter a descriptive title for this list..."
                        required
                      />
                    </div>
                    
                    {/* College Selection Area */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        Manage Colleges In This List
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Search & Results */}
                        <div className="flex flex-col h-[calc(100vh-350px)]">
                          <div className="mb-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Colleges</label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    value={searchCollegeQuery}
                                    onChange={handleSearchCollegeChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by name or code..."
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                  </div>
                                  {isSearchingColleges && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {collegeSearchResults.length} results found
                                </span>
                                <button
                                  type="button"
                                  onClick={() => searchColleges(searchCollegeQuery)}
                                  className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <Search size={14} className="mr-2" />
                                  Search
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Search Results with enhanced styling */}
                          <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                              <h4 className="font-medium text-gray-700">Search Results</h4>
                            </div>
                            <div className="h-full overflow-y-auto">
                              {collegeSearchResults.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                  {collegeSearchResults.map(college => (
                                    <div key={college.id} className="p-4 hover:bg-gray-50 transition-colors">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <div className="font-medium text-gray-800">{college.instituteName}</div>
                                          {college.city && (
                                            <span className="text-sm text-gray-500">{college.city}</span>
                                          )}
                                          <div className="text-sm text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">
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
                                        <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                                          {college.branches.map(branch => {
                                            const isSelected = editListFormData.colleges.some(
                                              c => c.id === college.id && c.selectedBranchCode === branch.branchCode
                                            );
                                            return (
                                              <div key={branch.branchCode} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-lg">
                                                <div className="flex items-center">
                                                  <div className="w-2 h-2 rounded-full bg-indigo-400 mr-3"></div>
                                                  <span className="font-medium text-sm">{branch.branchName}</span>
                                                  <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {branch.branchCode}
                                                  </span>
                                                </div>
                                                <button 
                                                  type="button" 
                                                  onClick={() => addCollegeToUserList(college, branch)}
                                                  disabled={isSelected}
                                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                                    isSelected ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                  }`}
                                                >
                                                  {isSelected ? 'Added' : 'Add Branch'}
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
                                <div className="p-8 text-center text-gray-500">
                                  {searchCollegeQuery ? (
                                    <>
                                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                      <p className="font-medium">No colleges found</p>
                                      <p className="text-sm mt-1">Try different search terms or filters</p>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p className="font-medium">Start Searching</p>
                                      <p className="text-sm mt-1">Search for colleges to add them to the list</p>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Column - Selected Colleges */}
                        <div className="flex flex-col h-[calc(100vh-350px)]">
                          <div className="mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-700 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Selected Colleges
                                {editListFormData.colleges.length > 0 && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                    {editListFormData.colleges.length}
                                  </span>
                                )}
                              </label>
                              {editListFormData.colleges.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setEditListFormData({...editListFormData, colleges: []})}
                                  className="text-sm text-red-500 hover:text-red-700 flex items-center"
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  Clear all
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Drag and drop to reorder colleges in the list</p>
                          </div>
                          
                          <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
                            <div className="h-full overflow-y-auto">
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
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t py-4 px-6 flex items-center justify-between shadow-lg">
                  <div className="text-sm text-gray-600">
                    {editListFormData.colleges.length > 0 && (
                      <span className="flex items-center">
                        <CheckCircle size={16} className="mr-2 text-green-500" />
                        {editListFormData.colleges.length} colleges selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowEditListModal(false)}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveUserList}
                      disabled={!editListFormData.title || editListFormData.colleges.length === 0}
                      className={`px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center font-medium ${
                        editListFormData.title && editListFormData.colleges.length > 0 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
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
        )}
        
        {/* Add the OrderEditableList modal */}
        {editingOrderList && (
          <OrderEditableList
            list={editingOrderList}
            onClose={() => setEditingOrderList(null)}
            onSave={handleSaveOrder}
          />
        )}
      </div>
    </div>
  );
};

export default UsersManagement;