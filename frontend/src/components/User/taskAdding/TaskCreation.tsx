import React, { useState, useEffect, useRef } from "react";
import { MapPin, Edit2, Locate } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLocation, setDescription, setCoordinates } from "../../../slice/bookingSlice";
import { RootState } from '../../../store';

interface LocationState {
  address: string;
  unit: string;
  lat?: number;
  lng?: number;
}

// Define Bangalore boundaries
const BANGALORE_BOUNDS = {
  north: 13.173706, // Northern boundary
  south: 12.704454, // Southern boundary
  west: 77.350198,  // Western boundary
  east: 77.850198   // Eastern boundary
};

// Define Bangalore center
const BANGALORE_CENTER = {
  lat: 12.9716,
  lng: 77.5946
};

const TaskCreationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [location, setLocationState] = useState<LocationState>({
    address: "",
    unit: "",
    lat: undefined,
    lng: undefined,
  });
  const [taskDescription, setTaskDescription] = useState("");
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [isLocationEditable, setIsLocationEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const selectedService = useSelector((state: RootState) => state.booking.selectedService?.categoryName);

  // Function to check if coordinates are within Bangalore bounds
  const isWithinBangalore = (lat: number, lng: number): boolean => {
    return (
      lat >= BANGALORE_BOUNDS.south &&
      lat <= BANGALORE_BOUNDS.north &&
      lng >= BANGALORE_BOUNDS.west &&
      lng <= BANGALORE_BOUNDS.east
    );
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    return () => {
      if (markerRef.current) {
        google.maps.event.clearListeners(markerRef.current, 'dragend');
      }
      if (autocompleteRef.current) {
        google.maps.event.clearListeners(autocompleteRef.current, 'place_changed');
      }
    };
  }, []);

  const initializeMap = () => {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    // Create a bounds object
    const bangaloreBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(BANGALORE_BOUNDS.south, BANGALORE_BOUNDS.west),
      new google.maps.LatLng(BANGALORE_BOUNDS.north, BANGALORE_BOUNDS.east)
    );

    mapRef.current = new google.maps.Map(mapElement, {
      center: BANGALORE_CENTER,
      zoom: 12,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      restriction: {
        latLngBounds: bangaloreBounds,
        strictBounds: true
      }
    });

    markerRef.current = new google.maps.Marker({
      position: BANGALORE_CENTER,
      map: mapRef.current,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    markerRef.current.addListener("dragend", handleMarkerDragEnd);
    initializeAutocomplete();
  };

  const initializeAutocomplete = () => {
    const input = document.getElementById("address-input") as HTMLInputElement;
    if (!input) return;

    // Create a bounds object for autocomplete
    const bangaloreBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(BANGALORE_BOUNDS.south, BANGALORE_BOUNDS.west),
      new google.maps.LatLng(BANGALORE_BOUNDS.north, BANGALORE_BOUNDS.east)
    );

    autocompleteRef.current = new google.maps.places.Autocomplete(input, {
      types: ["address"],
      componentRestrictions: { country: "IN" },
      bounds: bangaloreBounds,
      strictBounds: true
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        if (isWithinBangalore(lat, lng)) {
          updateMapLocation(lat, lng, place.formatted_address || "");
        } else {
          setError("Please select a location within Bangalore city limits");
          setLocationState(prev => ({ ...prev, address: "" }));
        }
      }
    });
  };

  const handleMarkerDragEnd = () => {
    const position = markerRef.current?.getPosition();
    if (!position) return;

    const lat = position.lat();
    const lng = position.lng();

    if (!isWithinBangalore(lat, lng)) {
      setError("Please select a location within Bangalore city limits");
      markerRef.current?.setPosition(BANGALORE_CENTER);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        updateMapLocation(lat, lng, results[0].formatted_address);
      }
    });
  };

  const updateMapLocation = (lat: number, lng: number, address: string) => {
    setLocationState(prev => ({ ...prev, lat, lng, address }));
    mapRef.current?.setCenter({ lat, lng });
    markerRef.current?.setPosition({ lat, lng });
    dispatch(setCoordinates({ lat, lng }));
    setError(null);
  };

  const fetchCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      if (!isWithinBangalore(latitude, longitude)) {
        setError("Your current location is outside Bangalore city limits");
        setIsLoading(false);
        return;
      }

      const geocoder = new google.maps.Geocoder();

      const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results) {
              resolve(results);
            } else {
              reject(new Error("Geocoding failed"));
            }
          }
        );
      });

      if (response[0]) {
        updateMapLocation(latitude, longitude, response[0].formatted_address);
      }
    } catch (err) {
      setError("Failed to get current location");
      console.error("Geolocation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your existing code remains the same...
  const validateLocation = () => {
    return location.address.trim() !== "" && location.unit.trim() !== "";
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(e.target.value);
  };

  const handleContinue = () => {
    if (validateLocation()) {
      setShowTaskDetails(true);
      setIsLocationEditable(false);
    }
  };

  const toggleLocationEdit = () => {
    setIsLocationEditable(true);
    setShowTaskDetails(false);
  };

  const handleProviderButtonClick = () => {
    dispatch(setLocation(location.address + " " + location.unit));
    dispatch(setDescription(taskDescription));
  };


  return (
    <div className="max-w-3xl mt-5 mx-auto p-6 mb-20">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="h-1 bg-gray-200 rounded-full">
            <div className="h-1 bg-emerald-600 rounded-full w-1/4"></div>
          </div>
          <div className="flex justify-between -mt-2">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
              <span className="text-sm text-emerald-600 mt-1">1</span>
            </div>
            {[2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <span className="text-sm text-gray-500 mt-1">{num}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <svg
          className="w-6 h-6 text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <p className="text-tealCustom">
          Tell us about your task. We use these details to show Taskers in your area who fit your needs.
        </p>
      </div>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-teal-700">{selectedService}</h1>

        {/* Location Section */}
        <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg flex text-teal-700 font-bold mb-4 gap-1">
            Your task location <MapPin className="text-emerald-600" size={20} />
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {showTaskDetails && !isLocationEditable && (
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-4">
              <p className="text-emerald-700 font-medium">
                Good News! AvailosAssist Available in your area
              </p>
              <button
                onClick={toggleLocationEdit}
                className="p-2 text-emerald-600 hover:bg-gray-100 rounded-full"
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <input
                id="address-input"
                type="text"
                name="address"
                placeholder="Bangalore Street address"
                value={location.address}
                onChange={handleLocationChange}
                disabled={showTaskDetails && !isLocationEditable || isLoading}
                className={`w-full px-4 py-2 border rounded-lg ${
                  showTaskDetails && !isLocationEditable
                    ? "bg-gray-200 cursor-not-allowed"
                    : "border-gray-300"
                }`}
              />
              <button
                onClick={fetchCurrentLocation}
                disabled={isLoading}
                className="absolute right-2 top-1 bottom-1 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Locate 
                  size={26} 
                  className={`text-teal-700 ${isLoading ? 'animate-spin' : ''}`} 
                />
              </button>
            </div>

            <input
              type="text"
              name="unit"
              placeholder="Unit or apt #"
              value={location.unit}
              onChange={handleLocationChange}
              disabled={showTaskDetails && !isLocationEditable || isLoading}
              className={`w-full px-4 py-2 border rounded-lg ${
                showTaskDetails && !isLocationEditable
                  ? "bg-gray-200 cursor-not-allowed"
                  : "border-gray-300"
              }`}
            />

            <div id="map" className="w-full h-64 rounded-lg border"></div>
          </div>

          {!showTaskDetails && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleContinue}
                disabled={!validateLocation() || isLoading}
                className={`px-8 py-2 ${
                  validateLocation() && !isLoading
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white rounded-lg transition-colors`}
              >
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Task Details Section */}
        {showTaskDetails && (
          <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg text-teal-700 font-bold mb-3">
              Tell us the details of your task
            </h2>
            <div>
              <p className="text-gray-600 mb-4">
                Start the conversation and tell your Tasker what you need done. This helps us show you only qualified
                and available Taskers for the job. Don't worry, you can edit this later.
              </p>
              <textarea
                value={taskDescription}
                onChange={handleDescriptionChange}
                placeholder="Add your issue to worker"
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg"
              ></textarea>
              <div className="mt-6 flex justify-center">
                <Link to="/recommandation">
                  <button
                    onClick={handleProviderButtonClick}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    See Provider & Prices
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCreationPage;




















// import React, { useState, useEffect } from "react";
// import { MapPin, Edit2 } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";  // Import the dispatch hook
// import { setLocation, setDescription } from "../../../slice/bookingSlice";  // Import the Redux actions
// import { RootState } from '../../../store';

// const TaskCreationPage = () => {
//   const dispatch = useDispatch();  // Initialize dispatch
//   const navigate = useNavigate();

//   const [location, setLocationState] = useState({
//     address: "",
//     unit: "",
//   });
//   const [taskDescription, setTaskDescription] = useState(""); // Added state for task description
//   const [showTaskDetails, setShowTaskDetails] = useState(false);
//   const [isLocationEditable, setIsLocationEditable] = useState(false);

//   const validateLocation = () => {
//     return location.address.trim() !== "" && location.unit.trim() !== "";
//   };

//   const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setLocationState((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setTaskDescription(e.target.value); // Update the description state
//   };

//   const selectedService = useSelector((state: RootState) => state.booking.location);
//   const selectedDescription = useSelector((state: RootState) => state.booking.description);

//   // Check if the service is not selected, then navigate to /allServices
//   // useEffect(() => {
//   //   if (!selectedService) {
//   //     // Redirect to the /allServices page if no service is selected
//   //     navigate('/allServices');
//   //   }
//   // }, [selectedService, navigate]);

//   // useEffect(() => {
//   //   console.log('Selected Location from Redux.....', selectedService, selectedDescription);
//   // }, [selectedService, selectedDescription]);

//   const handleContinue = () => {
//     if (validateLocation()) {
//       setShowTaskDetails(true);
//       setIsLocationEditable(false); // Disable editing when showing task details
//     }
//   };

//   const toggleLocationEdit = () => {
//     setIsLocationEditable(true); // Enable editing
//     setShowTaskDetails(false); // Hide task details section
//   };

//   const handleProviderButtonClick = () => {
//     // Dispatch Redux actions to store location and description
//     dispatch(setLocation(location.address + " " + location.unit));  // Store combined address + unit as location
//     dispatch(setDescription(taskDescription));  // Store the task description from the state

//     // After dispatching, navigate to the next page
//     // You can use `useNavigate` if you want to programmatically navigate (for example, using `react-router-dom`)
//     // e.g. navigate('/recommandation');
//   };

//   return (
//     <div className="max-w-3xl mt-5 mx-auto p-6 mb-20">
//       {/* Progress bar */}
//       <div className="mb-8">
//         <div className="relative">
//           <div className="h-1 bg-gray-200 rounded-full">
//             <div className="h-1 bg-emerald-600 rounded-full w-1/4"></div>
//           </div>
//           <div className="flex justify-between -mt-2">
//             <div className="flex flex-col items-center">
//               <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
//               <span className="text-sm text-emerald-600 mt-1">1</span>
//             </div>
//             {[2, 3, 4].map((num) => (
//               <div key={num} className="flex flex-col items-center">
//                 <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
//                 <span className="text-sm text-gray-500 mt-1">{num}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Header */}
//       <div className="flex items-center gap-2 mb-6">
//         <svg
//           className="w-6 h-6 text-gray-600"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//         >
//           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//         </svg>
//         <p className="text-tealCustom">
//           Tell us about your task. We use these details to show Taskers in your area who fit your needs.
//         </p>
//       </div>

//       {/* Main Form */}
//       <div className="space-y-6">
//         <h1 className="text-2xl font-bold text-teal-700">Plumbing help</h1>

//         {/* Location Section */}
//         <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
//           <h2 className="text-lg flex text-teal-700 font-bold mb-4 gap-1">
//             Your task location <MapPin className="text-emerald-600" size={20} />
//           </h2>
//           <div className="space-y-4">
//             {showTaskDetails && !isLocationEditable && (
//               <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
//                 <p className="text-emerald-700 font-medium">
//                   Good News! AvailosAssist Available in your area
//                 </p>
//                 <button
//                   onClick={toggleLocationEdit}
//                   className="p-2 text-emerald-600 hover:bg-gray-100 rounded-full"
//                 >
//                   <Edit2 size={18} />
//                 </button>
//               </div>
//             )}

//             <div className="relative">
//               <input
//                 type="text"
//                 name="address"
//                 placeholder="Bangalore Street address"
//                 value={location.address}
//                 onChange={handleLocationChange}
//                 disabled={showTaskDetails && !isLocationEditable} // Disable when not editable
//                 className={`w-full px-4 py-2 border rounded-lg ${showTaskDetails && !isLocationEditable
//                   ? "bg-gray-200 cursor-not-allowed"
//                   : "border-gray-300"
//                   }`}
//               />
//             </div>
//             <input
//               type="text"
//               name="unit"
//               placeholder="Unit or apt #"
//               value={location.unit}
//               onChange={handleLocationChange}
//               disabled={showTaskDetails && !isLocationEditable} // Disable when not editable
//               className={`w-full px-4 py-2 border rounded-lg ${showTaskDetails && !isLocationEditable
//                 ? "bg-gray-200 cursor-not-allowed"
//                 : "border-gray-300"
//                 }`}
//             />
//           </div>

//           <div className="flex justify-center mt-6">
//             <button
//               onClick={handleContinue}
//               disabled={!validateLocation()}
//               className={`px-8 py-2 ${validateLocation() ? "bg-teal-600" : "bg-gray-400 cursor-not-allowed"
//                 } text-white rounded-lg transition-colors`}
//             >
//               Continue
//             </button>
//           </div>
//         </div>

//         {/* Task Details Section */}
//         {showTaskDetails && (
//           <div className="bg-gray-100 rounded-lg border border-gray-200 p-6">
//             <h2 className="text-lg text-teal-700 font-bold mb-3">
//               Tell us the details of your task
//             </h2>
//             <div>
//               <p className="text-gray-600 mb-4">
//                 Start the conversation and tell your Tasker what you need done. This helps us show you only qualified
//                 and available Taskers for the job. Don't worry, you can edit this later.
//               </p>
//               <textarea
//                 value={taskDescription} // Bind the textarea to the taskDescription state
//                 onChange={handleDescriptionChange} // Update task description when user types
//                 placeholder="Add your issue to worker"
//                 className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg"
//               ></textarea>
//               <div className="mt-6 flex justify-center">
//                 <Link to={'/recommandation'}>
//                   <button
//                     onClick={handleProviderButtonClick}  // Dispatch Redux actions when button is clicked
//                     className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
//                   >
//                     See Provider & Prices
//                   </button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TaskCreationPage;
