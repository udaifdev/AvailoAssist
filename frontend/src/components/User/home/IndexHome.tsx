import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../API/axios';
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Plumber from '../../../photos/categories/icons8-plumber-64.png';
import electricianImage from '../../../photos/categories/icons8-electrician-64.png';
import Repair from '../../../photos/categories/icons8-repairman-100.png';
import Cleaner from '../../../photos/categories/cleaner.png';
import Carpenter from '../../../photos/categories/carpenter.png';
import Driver from '../../../photos/categories/driver.png';
import gardener from '../../../photos/categories/gardener.png'; 
import painter from '../../../photos/categories/painter.png';
import salooner from '../../../photos/categories/salooner.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Modal, ServiceCard } from '../category/ServiceListing';
import './home.css'; // You can add additional custom CSS if needed.
import 'animate.css';
import { useDispatch } from 'react-redux';
import { setSelectedService as setServiceAction } from '../../../slice/bookingSlice';


// Define the service interface
interface Service {
  categoryName: string;
  picture: string;
  id: string;
  categoryDescription: string
  amount: number | string;
}

const IndexHome = () => {
  // Define the state to store services
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (service: Service) => {
    setSelectedService(service); // Set the selected service
    setIsModalOpen(true); // Open the modal
  };


  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();



  useEffect(() => {
    // Fetch data from the backend
    axiosInstance.get('/user/home')
      .then((response) => {
        setServices(response.data); // Assuming the response data is an array of services
      })
      .catch((error) => {
        console.error('There was an error connecting to the backend:', error);
      });
  }, []);


  // Handle search with backend
  const handleSearch = async (term: string) => {
    if (term.trim() === '') {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/user/services/search?query=${encodeURIComponent(term)}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching services:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search handler
  const debouncedHandleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      handleSearch(term);
    }, 300);
  };

  useEffect(() => {
    return () => {
      debounceTimeout.current && clearTimeout(debounceTimeout.current);
    };
  }, []);


  // Cleanup timeout on component unmount
  // useEffect(() => {
  //   return () => {
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current);
  //     }
  //   };
  // }, []);


  return (
    <div className="app-container">
      <div className='design'></div>
      <div className='design3'></div>

      {/* https://lottie.host/c2b51426-a263-42f8-8385-d02bd8cdc763/27jXY93xvH.lottie */}
      {/* https://lottie.host/02fa139a-69f4-429c-81d0-a34875ff45ea/NOtPj81I01.lottie */}
      {/* https://lottie.host/2be0ab3c-5b68-4afa-a35d-7cae00499bc9/su2OQcqa7Z.lottie */}
      {/* https://lottie.host/d2823444-9210-4bed-bc4a-fc584fa9e216/Ngscc678cc.lottie */}
      {/* https://lottie.host/262842ea-cfa9-46fa-9a48-305a56ea60ec/Ne52p0EbnF.lottie */}
      {/* https://lottie.host/a5c73c19-a441-4d0a-8c96-981fa7ecebc5/lg1dBx1O8s.lottie */}
      {/* https://lottie.host/a5c73c19-a441-4d0a-8c96-981fa7ecebc5/lg1dBx1O8s.lottie */}
       {/* https://lottie.host/6f24f482-6bdb-49f9-8dcb-e111a9404e86/sJKtX6Txk3.lottie */}

      {/* Main Section */}
      <section className="main-section relative overflow-hidden">
        {/* Background Lottie Animation */}
        <div className="absolute inset-0 z-0 flex justify-center items-center">
          <DotLottieReact
            src="https://lottie.host/a5c73c19-a441-4d0a-8c96-981fa7ecebc5/lg1dBx1O8s.lottie"
            loop
            autoplay
            style={{
              // transform: 'scale(0.5)', // Scale it down to 70%
                        // Adjust width as needed
              height: '70%',            // Adjust height as needed
              opacity: 0.5,  // Set opacity (0.0 is fully transparent, 1.0 is fully opaque)
            }}
          />
        </div>


        {/* Foreground Content */}
        <div className="relative z-10">
          <DotLottieReact
            src="https://lottie.host/9b90511e-c23f-4fca-8f06-df880a4cf4f5/1JI7UYUwRc.lottie"
            loop
            autoplay
            className="logo mx-auto mt-6 animate__animated animate__fadeIn"
          />
          <h1 className="text-center text-4xl font-bold text-white mt- animate__animated animate__fadeIn">
            Discover Trusted Services Near You!
          </h1>
          <h2 className="text-center text-2xl mt-4 animate__animated animate__fadeIn">
            Your Reliable Partner for Everyday Tasks
          </h2>

          <h5 className="text-center  mt-2 leading-6 animate__animated animate__fadeIn">
            Finding trusted service providers has never been this simple. From plumbing repairs to home cleaning, <br />
            connect with top-rated professionals in just a few clicks!
          </h5>


          <div className="relative animate__animated animate__fadeIn">
            <div className="search-container flex justify-center">
              <input
                type="text"
                value={searchTerm}
                onChange={debouncedHandleSearch}
                placeholder="What do you need help with?"
                className="search-input w-full border border-gray-300 rounded-l-md px-4 py-2 max-w-lg"
              />
              <button className="search-btn bg-blue-500 text-white px-4 py-2 rounded-r-md flex items-center justify-center">
                <FaSearch className="mr-2" />
              </button>
            </div>

            {showResults && searchTerm && (
              <div className="mt-1 bg-gray-200 rounded-md shadow-lg max-h-60 overflow-auto w-full max-w-lg mx-auto">
                {isLoading ? (
                  <div className="p-4 text-center">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((service) => (
                    <div
                      key={service.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => openModal(service)}
                    >
                      {service.categoryName}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No services found</div>
                )}
              </div>
            )}

            {isModalOpen && selectedService && (
              <Modal
                service={{
                  categoryName: selectedService.categoryName,
                  categoryDescription: selectedService.categoryDescription,
                  amount: selectedService.amount,
                  picture: selectedService.picture,
                }}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContinue={(service) => {
                  dispatch(setServiceAction(service)); // Dispatch the selected service to Redux
                  setIsModalOpen(false); // Close the modal after continuing
                }}
              />
            )}
          </div>



          <div className="  py-10 px-4 animate__animated animate__fadeIn">
            <div className="category-container grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="category text-center">
                <img src={Plumber} alt="Plumber" className="category-icon mx-auto" />
                <span className="block   mt-2">Plumber</span>
              </div>
              <div className="category text-center">
                <img src={electricianImage} alt="Electrician" className="category-icon mx-auto" />
                <span className="block mt-2">Electrician</span>
              </div>
              <div className="category text-center">
                <img src={Repair} alt="Repairman" className="category-icon mx-auto" />
                <span className="block  mt-2">Repairman</span>
              </div>
              <div className="category text-center">
                <img src={Cleaner} alt="Cleaning" className="category-icon mx-auto" />
                <span className="block   mt-2">Cleaning</span>
              </div>
              <div className="category text-center">
                <img src={Carpenter} alt="Carpenter" className="category-icon mx-auto" />
                <span className="block   mt-2">Carpenter</span>
              </div>
              <div className="category text-center">
                <img src={Driver} alt="Driver" className="category-icon mx-auto" />
                <span className="block  mt-2">Driver</span>
              </div>
              <div className="category text-center">
                <img src={gardener} alt="Gardener" className="category-icon mx-auto" />
                <span className="block   mt-2">Gardener</span>
              </div>
              <div className="category text-center">
                <img src={painter} alt="Painter" className="category-icon mx-auto" />
                <span className="block   mt-2">Painter</span>
              </div>
              <div className="category text-center">
                <img src={salooner} alt="Hair Cutter" className="category-icon mx-auto" />
                <span className="block mt-2">Hair Cutter</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className='mb-4 mt-14 animate__animated animate__fadeIn'>
        <div className="bg-blue-50 p-12">
          {/* Content Section */}
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
            {/* Text Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg w-full lg:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Assembly</h2>
              <p className="text-gray-600 mb-4">
                Assemble or disassemble furniture items by unboxing, building, and
                any cleanup.
              </p>
              <p className="text-gray-600">
                <span className="font-bold">Now Trending:</span> Curved sofas,
                computer desks, and sustainable materials.
              </p>
            </div>

            {/* Image Section */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <img src="https://elements-resized.envatousercontent.com/elements-video-cover-images/files/38ae245f-15f5-45af-b0e3-c067a8fd9c6b/inline_image_preview.jpg?w=500&cf_fit=cover&q=85&format=auto&s=6329fa761bbcbc0e7245932fc980d6346e478ec607b1f869c597fc498d17657f" alt="Worker assembling furniture"
                className="rounded-lg object-cover shadow-lg w-full h-auto lg:w-[500px] lg:h-[300px]" />
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div>
              <h3 className="text-gray-600 font-medium">Furniture Assemblies:</h3>
              <p className="text-lg font-bold text-gray-800">3.4 million+</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium">Moving tasks:</h3>
              <p className="text-lg font-bold text-gray-800">1.5 million+</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium">Items mounted:</h3>
              <p className="text-lg font-bold text-gray-800">1 million+</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium">Home Repairs:</h3>
              <p className="text-lg font-bold text-gray-800">700,000+</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium">Homes cleaned:</h3>
              <p className="text-lg font-bold text-gray-800">890,000+</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium">Assembly service provided</h3>
              <p className="text-lg font-bold text-gray-800">1 million+</p>
            </div>
          </div>
        </div>
        <div className='design2'></div>
      </div>


      {/* Services Section */}
      <div className="py-10 px-4">
        <h2 className="text-2xl font-bold text-green-900 mb-8">Explore Our Latest Services</h2>
        <div className="overflow-hidden">
          <div className="scrolling-container flex animate-scroll">
            {/* Original services */}
            {services.map((service) => (
              <div key={service.categoryName} className="service-item bg-white shadow-lg rounded-lg overflow-hidden mx-4">
                <Link to='allServices' >
                  <img
                    src={service.picture}
                    alt={service.categoryName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-green-900 text-center">{service.categoryName}</h3>
                  </div>
                </Link>
              </div>
            ))}

            {/* Duplicate services for seamless scroll */}
            {services.map((service) => (
              <div key={service.categoryName + "-duplicate"} className="service-item bg-white shadow-lg rounded-lg overflow-hidden mx-4">
                <img
                  src={service.picture}
                  alt={service.categoryName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-green-900 text-center">{service.categoryName}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Satisfaction Section */}
      <div className="bg-green-50 py-6 px-4 mt-10 lg:px-16">
        <div className='design4'></div>
        <div className='design5'></div>
        <div className="text-center mb-12">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
            Your satisfaction, <span className="text-blue-600">guaranteed</span>
          </h1>
        </div>

        {/* Features */}
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Happiness Pledge</h3>
            <p className="text-gray-600">
              If you’re not satisfied, <span className="font-semibold">we’ll work to make it right.</span>
            </p>
            <div className="mt-4 flex justify-center">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgm9JvfZovZGuCHvO0QvNQO4XnHdCWanKRXg&s"
                alt="Happiness Pledge"
                className="w-20 h-15"
              />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Vetted Taskers</h3>
            <p className="text-gray-600">
              Taskers are always background checked before joining the platform.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Dedicated Support</h3>
            <p className="text-gray-600">
              Friendly service when you need us – every day of the week.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-yellow-50 py-12 px-4 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full lg:w-1/2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How it works</h2>
            <div className="flex justify-center items-start gap-4 mb-4">
              <span className="bg-purple-200 text-purple-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">1</span>
              <p className="text-gray-600">Choose a Tasker by price, skills, and reviews.</p>
            </div>
            <div className="flex justify-center items-start gap-4 mb-4">
              <span className="bg-yellow-200 text-yellow-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">2</span>
              <p className="text-gray-600">Location, Schedule a Tasker as early as today.</p>
            </div>
            <div className="flex justify-center items-start gap-4 mb-4">
              <span className="bg-green-200 text-green-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">3</span>
              <p className="text-gray-600">Chat, pay and review in one place & take rest.</p>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:ml-8">
            <img
              src="https://plus.unsplash.com/premium_photo-1663091094603-1239a6410966?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHBlcnNvbiUyMG9uJTIwcGhvbmV8ZW58MHx8MHx8fDA%3D"
              alt="How it works"
              className="rounded-lg object-cover shadow-lg w-full h-auto lg:w-[500px] lg:h-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexHome;
