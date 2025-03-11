import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const handleAddToList = async (userId) => {
    try {
      const authAxios = getAuthAxios();
      // You would implement the logic to add a user to a list
      // This would depend on your API structure
      alert(`Add user ${userId} to list functionality to be implemented`);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to add user to list');
      }
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAddToList(user.id)}
                          className="text-green-600 hover:text-green-900 mr-4 transition-colors duration-200"
                        >
                          Add to List
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
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      setNextPageId(null);
                    }
                  }}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (hasMore) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  disabled={!hasMore}
                  className={`px-3 py-1 rounded-md ${
                    !hasMore
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;