// import React, { useState, useEffect, Suspense } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { toast } from "react-toastify";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { adminAxios } from '../../../API/axios';
// import Loader from '../../globle/Loader';

// const Show_Add_service = React.lazy(() => import('./AddServiceModal'));
// const EditServiceModal = React.lazy(() => import('./EditServiceModal'));

// const Service = () => {

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [serviceDetails, setServiceDetails] = useState<any[]>([]); // Service data from backend
//     const [loading, setLoading] = useState(true); // Loading state
//     const [block, setBlock] = useState(false);
//     const [editModalOpen, setEditModalOpen] = useState(false);
//     const [selectedService, setSelectedService] = useState<any>(null);

//     // Fetch all services on component mount
//     useEffect(() => {
//         const fetchServices = async () => {
//             try {
//                 const response = await axiosInstance.get("/admin/getAllServices");
//                 console.log('API response data ------->', response.data); // Log the response to check if it's in the expected format
//                 const services = Array.isArray(response.data) ? response.data : [];
//                 setServiceDetails(services); // Update state with fetched services
//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching services:', error);
//                 toast.error('Failed to fetch services. Please try again.');
//                 setLoading(false);
//             }
//         };

//         fetchServices();
//     }, [block]);

//     const handleModalOpen = () => {
//         console.log('Add New Service button clicked');
//         setIsModalOpen(true); // Open modal
//     };

//     const handleModalClose = () => {
//         setIsModalOpen(false); // Close modal
//     };

//     const handleEdit = (service: any) => {
//         setSelectedService(service);
//         setEditModalOpen(true);
//     };

//     return (
//         <div className="p-6">
//             <div className="flex justify-between items-center mb-8">
//                 <h2 className="text-3xl font-semibold text-teal-700">Service Information</h2>
//                 <button
//                     onClick={handleModalOpen}
//                     className=" mt-4 bg-teal-700 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-teal-800"
//                 >
//                     Add New Service
//                 </button>
//             </div>

//             {/* Service Stats Carousel */}
//             <div className="relative mb-12">
//                 <div className="flex justify-between items-center">
//                     <button className="p-2 rounded-full border border-teal-700">
//                         <ChevronLeft className="text-teal-700" />
//                     </button>

//                     <div className="flex gap-6 justify-center">
//                         {/* {serviceStats.map((stat, index) => (
//                             <div key={index} className="border-2 border-teal-700 rounded-lg p-6 w-48">
//                                 <div className="flex justify-center mb-4">
//                                     <div className="w-20 h-20 rounded-full border-4 border-teal-700 flex items-center justify-center">
//                                         <span className="text-2xl font-bold text-teal-700">{stat.count}</span>
//                                     </div>
//                                 </div>
//                                 <p className="text-center text-teal-700 font-medium">{stat.title}</p>
//                             </div>
//                         ))} */}
//                     </div>

//                     <button className="p-2 rounded-full border border-teal-700">
//                         <ChevronRight className="text-teal-700" />
//                     </button>
//                 </div>

//                 {/* Carousel Dots */}
//                 <div className="flex justify-center gap-2 mt-6">
//                     {[0, 1, 2].map((dot) => (
//                         <div
//                             key={dot}
//                             className={`w-2 h-2 rounded-full ${dot === 0 ? 'bg-teal-700' : 'bg-gray-300'}`}
//                         />
//                     ))}
//                 </div>
//             </div>

//             {/* Service Details Grid */}
//             {loading ? (
//                 <div className="flex justify-center items-center">
//                     <div className="loader w-6 h-6 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//             ) : serviceDetails.length > 0 ? (
//                 <div className="grid grid-cols-3 gap-9">
//                     {serviceDetails.map((service, index) => (
//                         <div key={index} className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-teal-700 rounded-lg p-3">
//                             <div className="space-y-2">
//                                 <div className="flex justify-center mb-4">
//                                     {/* Image */}
//                                     <img
//                                         src={service.picture || 'https://via.placeholder.com/150'} // Placeholder image if no image exists
//                                         alt={service.categoryName}
//                                         className="w-full h-52 object-cover rounded-md"
//                                     />
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-teal-700 font-semibold">Service:</span>
//                                     <span>{service.categoryName}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-teal-700 font-semibold">Total Orders:</span>
//                                     <span>{service.totalOrders || 'N/A'}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-teal-700 font-semibold">Amount:</span>
//                                     <span>{service.amount}</span>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <span className="text-teal-700 font-semibold">Status:</span>
//                                     <span className={`p-1 border ${service.status === 'Active' ? 'text-green-700 border-green-700' : 'text-red-700 border-red-700'}`}>
//                                         {service.status}
//                                     </span>
//                                 </div>

//                                 <div className="flex justify-center gap-4 mt-4">
//                                     <button onClick={() => handleEdit(service)} className="bg-teal-700 text-white px-6 py-1 rounded transition-all duration-300 hover:bg-teal-800">
//                                         Edit Service
//                                     </button>
//                                     {/* <button className="bg-teal-700 text-white px-6 py-1 rounded transition-all duration-300 hover:bg-teal-800">
//                                         Block
//                                     </button> */}
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p className="text-center text-teal-700">No services found.</p>
//             )}

//             {/* Modal Component */}
//             {isModalOpen && (
//                 <Suspense fallback={<Loader />} >
//                     <Show_Add_service
//                         onClose={handleModalClose}
//                         onSubmit={() => { }}
//                         isOpen={isModalOpen}
//                     />
//                 </Suspense>
//             )}

//             {/* Edit Modal Component */}
//             {editModalOpen && selectedService && (
//                 <Suspense fallback={<Loader />}>
//                     <EditServiceModal
//                         isOpen={editModalOpen}
//                         onClose={() => setEditModalOpen(false)}
//                         service={selectedService}
//                         onUpdate={() => setBlock(prev => !prev)}
//                     />
//                 </Suspense>
//             )}
//         </div>
//     );
// };

// export default Service;





import React, { useState, useEffect, Suspense } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent } from '../../ui/dailog';

const Show_Add_service = React.lazy(() => import('./AddServiceModal'));
const EditServiceModal = React.lazy(() => import('./EditServiceModal'));

const Service = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceDetails, setServiceDetails] = useState<any[]>([]); // Service data from backend
    const [loading, setLoading] = useState(true);
    const [block, setBlock] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [currentStatsPage, setCurrentStatsPage] = useState(0);

    // Fetch all services and their worker counts
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await adminAxios.get("/admin/getAllServices");
                const services = Array.isArray(response.data) ? response.data : [];
                setServiceDetails(services); // Update state with fetched services
                setLoading(false);
            } catch (error) {
                console.error('Error fetching services:', error);
                toast.error('Failed to fetch services. Please try again.');
                setLoading(false);
            }
        };

        fetchServices();
    }, [block]);

    // Calculate service statistics
    const serviceStats = serviceDetails.map(service => ({
        title: service.categoryName,
        count: service.workerCount || 0,
        totalOrders: service.totalOrders || 0,
        revenue: service.amount * (service.totalOrders || 0)
    }));

    // Pagination for stats carousel
    const statsPerPage = 4;
    const totalPages = Math.ceil(serviceStats.length / statsPerPage);
    const displayedStats = serviceStats.slice(
        currentStatsPage * statsPerPage,
        (currentStatsPage + 1) * statsPerPage
    );

    const nextStatsPage = () => {
        setCurrentStatsPage((prev) => (prev + 1) % totalPages);
    };

    const prevStatsPage = () => {
        setCurrentStatsPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-semibold text-teal-700">Service Information</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-700 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-teal-800"
                >
                    Add New Service
                </button>
            </div>

            {/* Service Stats Carousel */}
            <div className="relative mb-12">
                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStatsPage}
                        className="p-2 rounded-full border border-teal-700 hover:bg-teal-50"
                    >
                        <ChevronLeft className="text-teal-700" />
                    </button>

                    <div className="flex gap-6 justify-center">
                        {displayedStats.map((stat, index) => (
                            <Card key={index} className="w-64 border-4 rounded-lg border-teal-700">
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 rounded-full border-4 border-teal-700 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-teal-700">{stat.count}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <p className="font-medium text-teal-700">{stat.title}</p>
                                        <p className="text-sm text-gray-600">Workers: {stat.count}</p>
                                        <p className="text-sm text-gray-600">Orders: {stat.totalOrders}</p>
                                        <p className="text-sm text-gray-600">Revenue: ${stat.revenue}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <button
                        onClick={nextStatsPage}
                        className="p-2 rounded-full border border-teal-700 hover:bg-teal-50"
                    >
                        <ChevronRight className="text-teal-700" />
                    </button>
                </div>

                {/* Carousel Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentStatsPage ? 'bg-teal-700' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Service Details Grid */}
            {loading ? (
                <div className="flex justify-center items-center">
                    <div className="loader w-6 h-6 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : serviceDetails.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
                    {serviceDetails.map((service, index) => (
                        <Card key={index} className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 rounded-lg border-teal-700">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={service.picture || '/api/placeholder/300/200'}
                                            alt={service.categoryName}
                                            className="w-full h-52 object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-teal-700 font-semibold">Service:</span>
                                        <span>{service.categoryName}</span>
                                        <span className="text-teal-700 font-semibold">Workers:</span>
                                        <span>{service.workerCount || 0}</span>
                                        <span className="text-teal-700 font-semibold">Total Orders:</span>
                                        <span>{service.totalOrders || 'N/A'}</span>
                                        <span className="text-teal-700 font-semibold">Amount:</span>
                                        <span>${service.amount}</span>
                                        <span className="text-teal-700 font-semibold">Status:</span>
                                        <span className={`p-1 text-center rounded ${service.status === 'Active'
                                                ? 'text-green-700 bg-green-50 border border-green-700'
                                                : 'text-red-700 bg-red-50 border border-red-700'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-center gap-4 mt-4">
                                        <button
                                            onClick={() => {
                                                setSelectedService(service);
                                                setEditModalOpen(true);
                                            }}
                                            className="bg-teal-700 text-white px-6 py-2 rounded transition-all duration-300 hover:bg-teal-800"
                                        >
                                            Edit Service
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-teal-700">No services found.</p>
            )}

            {/* Modals */}
            {isModalOpen && (
                <Suspense fallback={<div className="flex justify-center"><div className="loader"></div></div>}>
                    <Show_Add_service
                        onClose={() => setIsModalOpen(false)}
                        onSubmit={() => setBlock(prev => !prev)}
                        isOpen={isModalOpen}
                    />
                </Suspense>
            )}

            {editModalOpen && selectedService && (
                <Suspense fallback={<div className="flex justify-center"><div className="loader"></div></div>}>
                    <EditServiceModal
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        service={selectedService}
                        onUpdate={() => setBlock(prev => !prev)}
                    />
                </Suspense>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default Service;