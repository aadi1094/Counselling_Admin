import React from 'react';

const ListDetails = ({ list }) => {
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

export default ListDetails;
