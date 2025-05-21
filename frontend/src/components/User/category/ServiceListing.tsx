import React, { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../API/axios';
import { Link } from 'react-router-dom';
import { XCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';  // Example Lucide icons
import Loader from '../../globle/Loader';
import { setSelectedService } from '../../../slice/bookingSlice'; // Import the action
import { RootState } from '../../../store';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './services.css'

type ServiceCardProps = {
  categoryName: string;
  categoryDescription: string;
  amount: number | string;
  picture: string;
  onClick: () => void;
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ categoryName, categoryDescription, amount, picture, onClick }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105" onClick={onClick}>
    <div className="h-48 overflow-hidden">
      <img
        src={picture || "/api/placeholder/400/300"}
        alt={categoryName}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800">{categoryName}</h3>
      <p className="text-sm text-gray-600 mt-1">{categoryDescription}</p>
      <p className="text-right mt-2 text-gray-700">₹{amount}/hr</p>
    </div>
  </div>
);

type ServiceItem = {
  categoryName: string;
  categoryDescription: string;
  amount: number | string;
  picture: string;
};

export const Modal: React.FC<{ service: ServiceItem, isOpen: boolean, onClose: () => void, onContinue: (service: ServiceItem) => void }> = ({ service, isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" style={{ zIndex: 50 }}>
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-end">
          <button onClick={onClose}>
            <XCircle className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <img src={service.picture} alt={service.categoryName} className="w-full h-48 object-cover rounded-lg" />
        <h2 className="text-2xl font-semibold mt-4">{service.categoryName}</h2>
        <p className="text-gray-600 mt-2">{service.categoryDescription}</p>
        <p className="text-xl text-gray-700 mt-2">₹{service.amount}/hr</p>

        <div className="flex justify-between mt-6">
          <button onClick={onClose} className="bg-red-600 text-white py-2 px-4 rounded-lg flex items-center">
            <XCircle className="mr-2" /> Cancel
          </button>
          <Link to={'/taskeInfo'}>
            <button
              onClick={() => onContinue(service)} // When user clicks Continue, dispatch the selected service to Redux
              className="bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center"
            >
              <CheckCircle className="mr-2" /> Continue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ServiceListing = () => {
  const dispatch = useDispatch();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [localService, setLocalService] = useState<ServiceItem | null>(null); // Local state for selected service
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get('/user/allServicesList');
        setServices(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const selectedService = useSelector((state: RootState) => state.booking.selectedService);

  useEffect(() => {
    console.log('Selected Service from Redux..........', selectedService);
  }, [selectedService]);

  const openModal = (service: ServiceItem) => {
    setLocalService(service); // Local state
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLocalService(null); // Reset local service state
  };

  const handleContinue = (service: ServiceItem) => {
    dispatch(setSelectedService(service)); // Dispatch the selected service to Redux
    setIsModalOpen(false); // Close the modal after continuing
  };

  const ITEMS_PER_PAGE = 6;

  // ===================================== Pagenation =========================================

  // Pagination calculations
  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = services.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md hover:bg-teal-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots1">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${currentPage === i
              ? 'bg-teal-600 text-white'
              : 'hover:bg-teal-100'
            }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md hover:bg-teal-100"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );

    return buttons;
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative flex  h-80 mb-12 rounded-xl overflow-hidden">
        <img
          src="https://i.pinimg.com/originals/26/7d/7b/267d7b0e9351f608ef3df5c16d734a43.gif" alt="Hero"
          className="w-full  h-full"
        />
        <img
          src="https://i.pinimg.com/originals/26/7d/7b/267d7b0e9351f608ef3df5c16d734a43.gif" alt="Hero"
          className="w-full  h-full"
        />
        <img
          src="https://i.pinimg.com/originals/26/7d/7b/267d7b0e9351f608ef3df5c16d734a43.gif" alt="Hero"
          className="w-full  h-full"
        />
        <img
          src="https://i.pinimg.com/originals/26/7d/7b/267d7b0e9351f608ef3df5c16d734a43.gif" alt="Hero"
          className="w-full  h-full"
        />

        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <h1 style={{ WebkitTextStroke: '1px white', color: 'teal', fontSize: '3rem', fontWeight: 'bold', animation: 'textAnimation 3s ease-in-out infinite', }}>
            Your to-do list is on us!
          </h1>
        </div>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-teal-800 text-center mb-12">
            Browse Our Expert Services
          </h2>

          {loading ? (
            <div className="flex justify-center items-center">
              <div className="loader w-6 h-6 border-4 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : paginatedServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedServices.map((service, index) => (
                  <ServiceCard
                    key={index}
                    categoryName={service.categoryName}
                    categoryDescription={service.categoryDescription}
                    amount={service.amount}
                    picture={service.picture}
                    onClick={() => openModal(service)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {renderPaginationButtons()}
              </div>

              {/* Services count */}
              <div className="text-center text-gray-600 mt-4">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, services.length)} of {services.length} services
              </div>
            </>
          ) : (
            <p className="text-center text-gray-700">No services found.</p>
          )}
        </div>
      </Suspense>

      {/* Modal */}
      <Modal
        service={localService!}
        isOpen={isModalOpen}
        onClose={closeModal}
        onContinue={handleContinue}  // Pass the continue handler to the modal
      />
    </div>
  );
};

export default ServiceListing;
