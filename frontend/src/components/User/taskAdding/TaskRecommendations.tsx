import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, Star, MessageCircle, Filter } from 'lucide-react'; // Import the Calendar icon from lucide-react
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '../../../API/axios';
import TaskDateModal from './TaskDateModal';
import { useDispatch, useSelector } from "react-redux";  // Import the dispatch hook
import { setLocation, setDescription } from "../../../slice/bookingSlice";  // Import the Redux actions
import { RootState } from '../../../store';
import { useNavigate } from 'react-router-dom'; // Import navigate hook
import { Tasker, Review } from '../../../types/workerDisplay'
import './task.css'; // Import the external CSS file



const TaskRecommendations = () => {
    // const [selectedTime, setSelectedTime] = useState('');
    // const [isFlexible, setIsFlexible] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [availableWorkers, setAvailableWorkers] = useState<Tasker[]>([]);  // Available workers based on date selection
    const [selectedWorker, setSelectedWorker] = useState<Tasker | undefined>(undefined);
    const [filteredWorkers, setFilteredWorkers] = useState<Tasker[]>([]);

    // Filter states
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate(); // Hook for navigation
    // Get location and selected service from Redux store
    const location = useSelector((state: RootState) => state.booking.location);
    const selectedService = useSelector((state: RootState) => state.booking.selectedService);


    // If no location or service is available, redirect to task info page
    // useEffect(() => {
    //     if (!location || !selectedService) {
    //         navigate('/allSevices'); // Redirect to /taskInfo if location or service is missing
    //     }
    // }, [location, selectedService, navigate]);


    // Calculate today's date and the date 7 days from today
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);  // Add 7 days

    // Helper function to format a Date object as MM/DD/YY
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
    };

    useEffect(() => {
        setAnimationClass('animate-stop-at-task');
    }, []);

    const location_Selected = useSelector((state: RootState) => state.booking.coordinates);
    const address_aprt = useSelector((state: RootState) => state.booking.location);

    // Apply filters whenever filter values or available workers change
    useEffect(() => {
        applyFilters();
    }, [experienceFilter, ratingFilter, availableWorkers]);

    const applyFilters = () => {
        let filtered = [...availableWorkers];

        // Apply experience filter
        if (experienceFilter !== 'all') {
            const [minExp, maxExp] = experienceFilter.split('-').map(Number);
            filtered = filtered.filter(worker => {
                const experience = Number(worker.workExperience);
                return maxExp ? experience >= minExp && experience <= maxExp : experience >= minExp;
            });
        }

        // Apply rating filter
        if (ratingFilter !== 'all') {
            const minRating = Number(ratingFilter);
            filtered = filtered.filter(
                worker => worker.averageRating !== undefined && worker.averageRating >= minRating
            );
        }

        setFilteredWorkers(filtered);
    };


    const handleDateChange = async (date: Date | null) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = formatDate(date);
            console.log('Formatted Date for API...........', formattedDate);

            try {
                const response = await axiosInstance.get(`/user/taskers/available?date=${formattedDate}&service=${selectedService?.categoryName}`);
                // Fetch reviews for each worker
                const workersWithReviews = await Promise.all(
                    response.data.map(async (worker: any) => {
                        try {
                            const reviewsResponse = await axiosInstance.get(`/user/worker/reviews/${worker._id}`);
                            const reviews = reviewsResponse.data;

                            // Calculate average rating
                            const averageRating = reviews.length > 0
                                ? reviews.reduce((acc: number, rev: Review) => acc + rev.rating, 0) / reviews.length
                                : 0;

                            return {
                                id: worker._id,
                                fullName: worker.fullName,
                                category: worker.category,
                                workExperience: worker.workExperience,
                                profilePicture: worker.profilePicture || null,
                                city: worker.city,
                                streetAddress: worker.streetAddress,
                                reviews: reviews,
                                averageRating: Number(averageRating.toFixed(1))
                            };
                        } catch (error) {
                            console.error("Error fetching reviews for worker.........", error);
                            return {
                                ...worker,
                                reviews: [],
                                averageRating: 0 // Provide default value
                            };
                        }
                    })
                );
                setAvailableWorkers(workersWithReviews);
            } catch (error) {
                console.error("Error fetching available workers:", error);
            }
        } else {
            setAvailableWorkers([]);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
                <span className="ml-1 text-sm text-gray-600">{rating} / 5</span>
            </div>
        );
    };

    const renderReviews = (reviews: Review[] | undefined) => {
        if (!reviews || reviews.length === 0) {
            return (<p className="text-sm text-gray-500 mt-2">No reviews yet</p>);
        }
        return (
            <div className="mt-4">
                <h4 className="font-medium flex items-center gap-1 mb-1">
                    <MessageCircle className="w-5 h-5 text-tealCustom" />
                    Recent Reviews
                </h4>
                <div className={`space-y-4 ${reviews.length > 1 ? "max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" : ""
                    }`}>
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-gray-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                    {review.userId.image ? (
                                        <img src={review.userId.image} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{review.userId.name}</p>
                                    {renderStars(review.rating)}
                                </div>
                                <span className="text-xs text-gray-500 ml-auto">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">{review.review}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    const handleWorkerSelection = (worker: Tasker) => {
        setSelectedWorker(worker);  // Set the selected worker when the user chooses one
    };

    return (
        <div className="max-w-6xl mx-auto mt-5 p-6 mb-20">
            <div className="relative">
                <div className="h-1 bg-gray-200 rounded-full">
                    {/* Animated Progress Bar */}
                    <div
                        className={`h-1 bg-tealCustom rounded-full transition-all duration-500 ${animationClass}`}
                    ></div>
                </div>
                <div className="flex justify-between -mt-2">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex flex-col items-center">
                            <div
                                className={`w-4 h-4 rounded-full ${num <= 2 ? 'bg-tealCustom' : 'bg-gray-200'}`}
                            ></div>
                            <span
                                className={`text-sm mt-1 ${num <= 2 ? 'text-tealCustom' : 'text-gray-500'}`}
                            >
                                {num}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <h2 className="text-sm tems-center mb-8 gap-1 justify-center flex font-medium">
                <User className="w-4 h-4" />
                2: Browse Taskers & prices
            </h2>

            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filters</span>
                </button>
            </div>

            {showFilters && (
                <div className="bg-teal-50 p-5 rounded-lg shadow-md mb-6 border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        Filter Taskers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Experience Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Filter by Experience
                            </label>
                            <select
                                value={experienceFilter}
                                onChange={(e) => setExperienceFilter(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tealCustom"
                            >
                                <option value="all">All Experience Levels</option>
                                <option value="0-2">0-2 years</option>
                                <option value="3-5">3-5 years</option>
                                <option value="5-10">5-10 years</option>
                                <option value="10">10+ years</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select the minimum years of experience you prefer.
                            </p>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Filter by Minimum Rating
                            </label>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tealCustom"
                            >
                                <option value="all">All Ratings</option>
                                <option value="4.5">4.5+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="3.5">3.5+ Stars</option>
                                <option value="3">3+ Stars</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select the minimum star rating for taskers.
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* Main Content - Using flex row */}
            <div className="flex gap-6">
                <div>
                    {/* Left Column: Date & Time Picker */}
                    <div className="flex-1 gap-6 rounded-lg p-6 border-2 bg-tealCustom text-white shadow-sm">
                        <h3 className="font-bold mb-4">Date</h3>
                        <div className="flex justify-center mb-6">
                            <DatePicker
                                selected={selectedDate}
                                placeholderText='Choose a Dates '
                                onChange={handleDateChange}
                                dateFormat="MM/dd/yy"
                                minDate={today}  // Minimum date is today
                                maxDate={sevenDaysLater}  // Maximum date is 7 days from today
                                className="px-4 py-2 font-bold border rounded-lg bg-white text-tealCustom hover:border-white transition-colors cursor-pointer"
                            />
                        </div>

                        <div className="mt-4 text-center text-sm text-white">
                            Choose a specific date
                        </div>
                    </div>
                </div>

                <div className="flex-2 space-y-6  ">
                    {selectedDate ? (
                        <div className="md:col-span-2 space-y-6 ">
                            {filteredWorkers.length > 0 ? (
                                filteredWorkers.map((tasker) => (
                                    <div key={tasker.id} className="bg-white rounded-lg p-6 shadow-lg border-2     hover:shadow-md transition-shadow">
                                        <div className="flex gap-6">
                                            {/* Image Section */}
                                            <div>
                                                <div className="w-36 h-40 rounded-lg overflow-hidden bg-gray-200">
                                                    {tasker.profilePicture ? (
                                                        <img src={tasker.profilePicture} alt="Worker" className="object-cover w-full h-full" />
                                                    ) : (
                                                        <User size={40} className="text-gray-400" />
                                                    )}
                                                </div>

                                                {/* Button and Rate Section */}
                                                <div className="mt-4 items-center">
                                                    <p className="text-xl font-medium mb-2">₹{selectedService?.amount} / hr</p>
                                                    <button
                                                        onClick={() => { setShowDateModal(true); handleWorkerSelection(tasker) }}
                                                        className="px-6 py-2 bg-tealCustom text-white rounded-lg hover:bg-teal-600 transition-colors">
                                                        Select & Continue
                                                    </button>
                                                </div>
                                                <h3 className='mt-2 text-center text-tealCustom font-bold'>View Profile & <br />Reviews</h3>

                                            </div>

                                            {/* Worker Details Section */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold">{tasker.fullName}</h3>
                                                <p className="text-sm text-gray-500">Specialist On {tasker.category}</p>

                                                {/* New section for location */}
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Location:</strong> {tasker.streetAddress}, {tasker.city}
                                                    </p>
                                                </div>

                                                {/* Rating Section */}
                                                {typeof tasker.averageRating !== 'undefined' && tasker.averageRating > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {renderStars(tasker.averageRating)}
                                                        <span className="text-sm text-gray-500">
                                                            ({tasker.reviews?.length || 0} reviews)
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Description Section */}
                                                <div className="mt-4 bg-gray-100 p-2 rounded-xl">
                                                    <h6 className="font-medium text-sm">
                                                        With over {tasker.workExperience} years of experience, I specialize in {tasker.category} very well.
                                                    </h6>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        I have worked on numerous projects, gaining expertise in {tasker.category} tasks and ensuring high-quality outcomes for my clients.
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Whether it's a quick fix or a larger project, I guarantee reliable and professional service every time.
                                                    </p>
                                                </div>

                                                {/* Add Reviews Section */}
                                                {renderReviews(tasker.reviews)}

                                            </div>
                                        </div>



                                        {/* Additional Info Section */}
                                        <p className="text-sm text-gray-500 text-center mt-7">
                                            You can chat with your Tasker, after booking Service.
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-600 flex items-center justify-center gap-2">
                                    <Calendar size={44} className="text-tealCustom" />
                                    <p>
                                        There are no Taskers currently available to help with your task. <br />
                                        Try seeing who’s available on different days.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-600">
                            <p>Please select a date. Based on the date, available workers will be shown.</p>
                        </div>
                    )}
                </div>

            </div>

            {selectedWorker?.id && (
                <TaskDateModal
                    isOpen={showDateModal}
                    onClose={() => { setShowDateModal(false); setSelectedWorker(undefined) }}
                    workerId={selectedWorker.id}  // Only pass workerId if it's defined
                />
            )}


        </div>
    );
};

export default TaskRecommendations;
