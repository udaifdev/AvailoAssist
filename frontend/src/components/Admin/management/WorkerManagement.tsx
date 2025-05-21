import React, { useState, useEffect, Suspense } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import StatusBtn from './Propertiece/StatusBtn';
import Loader from '../../globle/Loader';
import { adminAxios } from '../../../API/axios';


const WorkerProfileModal = React.lazy(() => import('./Propertiece/WorkerDetailsModal'));

const WorkerManagement = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [block, setBlock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await adminAxios.get('/admin/getallWorkers');
        const data = response.data;
        if (Array.isArray(data)) {
          setWorkers(data);
        } else {
          console.error('API response is not an array:', data);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };

    fetchWorkers();
  }, [block]);

  const handleViewClick = (worker: any) => {
    setSelectedWorker(worker);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.category.toLowerCase().includes(searchTerm) ||
      worker.fullName.toLowerCase().includes(searchTerm) ||
      worker.email.toLowerCase().includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' || 
      worker.serviceStatus.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const renderWorkers = filteredWorkers.map((worker, index) => (
    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
      <td className="py-4 px-6 text-teal-700 font-medium">{worker.category}</td>
      <td className="py-4 px-6">{worker.fullName}</td>
      <td className="py-4 px-6 text-teal-600">{worker.email}</td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block
          ${worker.serviceStatus === 'pending'
            ? 'bg-yellow-100 text-yellow-700'
            : worker.serviceStatus === 'Accepted'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {worker.serviceStatus}
        </span>
      </td>
      <td className="py-4 px-6">
        <StatusBtn
          worker={worker}
          onDecisionChange={(id, decision) => {
            setWorkers((prevWorkers) =>
              prevWorkers.map((w) =>
                w._id === id ? { ...w, serviceStatus: decision } : w
              )
            );
          }}
        />
      </td>
      <td className="py-4 px-6">
        <button
          className="px-4 py-1.5 border-2 border-tealCustom text-teal-600 rounded-lg hover:bg-teal-50 
                     transition-all duration-200 font-medium text-sm"
          onClick={() => handleViewClick(worker)}
        >
          View
        </button>
      </td>
    </tr>
  ));

  const filterOptions = ['all', 'pending', 'Accepted', 'Rejected'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-teal-700 mb-12 mt-5">
          Providers Management
        </h1>

        <div className="flex justify-between mb-8 gap-4">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search providers..."
              className="w-full pl-4 pr-12 py-2.5 border-2 border-teal-600 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute right-4 top-3 text-teal-600 w-5 h-5" />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">Filter by</span>
            <div className="relative">
              <select
                onChange={(e) => handleFilterChange(e.target.value)}
                value={filterStatus}
                className="appearance-none flex items-center gap-2 px-4 py-2.5 border-2 border-teal-600 rounded-lg 
                          text-gray-600 hover:bg-teal-50 transition-all duration-200 bg-white pr-10 cursor-pointer"
              >
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-teal-50 border-b border-teal-100">
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Service</th>
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Name</th>
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Email</th>
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Service Status</th>
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Decision</th>
                  <th className="py-4 px-6 text-left text-teal-700 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renderWorkers}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3, 4, '....', 9, 10].map((page, index) => (
            <button
              key={index}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all duration-200
                ${page === 1 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-200'}`}
            >
              {page}
            </button>
          ))}
        </div>

        <Suspense fallback={<Loader />}>
          {showModal && selectedWorker && (
            <WorkerProfileModal
              workerData={selectedWorker}
              onClose={handleCloseModal}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default WorkerManagement;















// import React, { useState, useEffect, Suspense } from 'react';
// import { Search, ChevronDown } from 'lucide-react';
// import StatusBtn from './Propertiece/StatusBtn';
// import Loader from '../../globle/Loader';
// import axiosInstance from '../../../API/axios';

// const WorkerProfileModal = React.lazy(() => import('./Propertiece/WorkerDetailsModal'));

// const WorkerManagement = () => {
//   const [workers, setWorkers] = useState<any[]>([]); // Initializing workers as an empty array
//   const [showModal, setShowModal] = useState(false); // Modal visibility state
//   const [selectedWorker, setSelectedWorker] = useState<any>(null); // State to store selected worker data
//   const [block, setBlock] = useState(false);

//   useEffect(() => {
//     const fetchWorkers = async () => {
//       try {
//         const response = await axiosInstance.get('/admin/getallWorkers');
//         const data = response.data;
//         console.log('responses data ------> ', response.data) ;

//         if (Array.isArray(data)) {
//           setWorkers(data); // Only set workers if data is an array
//         } else {
//           console.error('API response is not an array:', data);
//         }
//       } catch (error) {
//         console.error('Error fetching workers:', error);
//       }
//     };

//     fetchWorkers();
//   }, [block]);

//   const handleViewClick = (worker: any) => {
//     console.log('worker checking........', worker)
//     setSelectedWorker(worker); // Set the selected worker's data
//     setShowModal(true); // Show the modal
//   };

//   const handleCloseModal = () => {
//     setShowModal(false); // Hide the modal
//   };

//   // Render the worker data only if it's an array
//   const renderWorkers = workers && Array.isArray(workers) ? workers.map((worker, index) => (
//     <tr key={index} className="border-b border-gray-100">
//       <td className="py-4 px-4 text-teal-600">{worker.category}</td>
//       <td className="py-4 px-4">{worker.fullName}</td>
//       <td className="py-4 px-4 text-teal-600">{worker.email}</td>
//       <td className="py-4 px-4">
//         <span
//           className={`font-bold ${worker.serviceStatus === 'pending'
//               ? 'text-yellow-500'
//               : worker.serviceStatus === 'Accepted'
//                 ? 'text-green-600'
//                 : 'text-red-600'
//             }`}
//         >
//           {worker.serviceStatus}
//         </span>
//       </td>

//       <td className="py-4 px-4">
//         <StatusBtn
//           worker={worker}
//           onDecisionChange={(id, decision) => {
//             setWorkers((prevWorkers) =>
//               prevWorkers.map((w) =>
//                 w._id === id ? { ...w, serviceStatus: decision } : w
//               )
//             );
//           }}
//         />
//       </td>

//       <td className="py-4 px-4">
//         <button
//           className="px-4 py-1 border border-teal-600 text-teal-600 rounded-md"
//           onClick={() => handleViewClick(worker)}
//         >
//           View
//         </button>
//       </td>
//     </tr>
//   )) : null;

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-3xl text-center font-bold text-teal-600 mb-12 mt-5">Providers Management</h1>

//       <div className="flex justify-between mb-8">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="search"
//             className="pl-3 pr-10 py-2 border border-teal-600 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-600"
//           />
//           <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="text-gray-600">filter by</span>
//           <button className="flex items-center gap-2 px-2 text-xs py-1 border border-teal-600 rounded-md text-gray-400">
//             Pending Approvement
//             <ChevronDown className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       <div className="overflow-x-auto max-h-96"> {/* Added scrollable area with max-height */}
//         <table className="w-full table-auto">
//           <thead>
//             <tr className="border-b border-teal-600">
//               <th className="py-4 px-4 text-left text-teal-600">Service</th>
//               <th className="py-4 px-4 text-left text-teal-600">Name</th>
//               <th className="py-4 px-4 text-left text-teal-600">Email</th>
//               <th className="py-4 px-4 text-left text-teal-600">Service Status</th>
//               <th className="py-4 px-4 text-left text-teal-600">Decision</th>
//               <th className="py-4 px-4 text-left text-teal-600">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {renderWorkers}
//           </tbody>
//         </table>
//       </div>

//       <div className="flex justify-center gap-2 mt-6">
//         {[1, 2, 3, 4, '....', 9, 10].map((page, index) => (
//           <button
//             key={index}
//             className={`w-8 h-8 flex items-center justify-center rounded-full ${page === 1 ? 'bg-gray-200' : 'bg-white'}`}
//           >
//             {page}
//           </button>
//         ))}
//       </div>

//       <Suspense fallback={<Loader />}>
//         {showModal && selectedWorker && (
//           <WorkerProfileModal
//             workerData={selectedWorker}
//             onClose={handleCloseModal}
//           />
//         )}
//       </Suspense>
//     </div>
//   );
// };

// export default WorkerManagement;
