import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import { useSelector } from "react-redux";
import { RootState } from '../../../store';
import { toast } from 'react-toastify';
import Design from '../../../particial/Design';
import axiosInstance from '../../../API/axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './workerSignup.css'

// Define interfaces for form data and errors
interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  category: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  workRadius: string;
  workExperience: string;
  profilePicture: File | null;
  governmentId: File | null;
  governmentIdNo: string;
}

interface FormErrors {
  [key: string]: string;
}


const WorkerRegistrationForm: React.FC = () => {

  // State management
  const [formData, setFormData] = useState<FormData>({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '', category: '', streetAddress: '', city: '',
    zipCode: '', workRadius: '', workExperience: '', profilePicture: null, governmentId: null, governmentIdNo: ''
  });

  const [categories, setCategories] = useState<{ _id: string; categoryName: string }[]>([]); // Store categories
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const navigate = useNavigate()

  const { workerDetails } = useSelector((state: RootState) => state.worker);

  // Redirect authenticated users to the Dashboard page
  useEffect(() => {
    if (workerDetails) {
      navigate("/worker-dashboard");
    }
  }, [workerDetails, navigate]);


  // Fetch categories from API and update state
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/worker/allCategoriesName");
        console.log('service name ......', response.data);
        // Assuming the response contains an array of category names (e.g., ['cleaning', 'handyman', 'plumbing'])
        setCategories(response.data); // Save categories array
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (formData.fullName.trim().length < 4) newErrors.fullName = 'Name must be at least 4 characters long';
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.mobile)) newErrors.mobile = 'Phone number must be exactly 10 digits';
    // Password validation
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    // Confirm password
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    // Category validation
    if (!formData.category) newErrors.category = 'Please select a category';
    // Zip code validation
    const zipRegex = /^\d{6}$/;
    if (!zipRegex.test(formData.zipCode)) newErrors.zipCode = 'ZIP code must be exactly 6 digits';
    // Work radius validation
    const radiusNum = Number(formData.workRadius);
    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 50) newErrors.workRadius = 'Work radius must be between 1 and 50';
    // Government ID validation
    if (!formData.governmentId) newErrors.governmentId = 'Government ID is required';
    if (!formData.governmentIdNo) newErrors.governmentIdNo = 'Government ID number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file inputs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Store the actual File object
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));

      // Also store the file in sessionStorage as a temporary file ID
      const fileId = `${name}_${Date.now()}`;
      sessionStorage.setItem(fileId, URL.createObjectURL(files[0]));
      sessionStorage.setItem(`${name}_id`, fileId);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        // Step 1: Initial signup to get OTP
        const initialResponse = await axiosInstance.post('/worker/worker-signup', {
          email: formData.email,
          mobile: formData.mobile
        });

        if (initialResponse.status === 201 || initialResponse.status === 200) {
          // Store form data and file information
          const formDataForStorage = {
            ...formData,
            profilePicture: sessionStorage.getItem('profilePicture_id'),
            governmentId: sessionStorage.getItem('governmentId_id'),
          };

          console.log('sign up page form data for storage...... ', formDataForStorage)

          localStorage.setItem('worker_SignupData', JSON.stringify(formDataForStorage));

          toast.success('Please check your email for OTP.');
          navigate('/worker-verify-otp');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Signup failed.');
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="max-w-7xl mx-auto p-12 bg-gray-50">
      <div className="grid md:grid-cols-12">
        {/* Left Column */}
        <div className="hidden md:block md:col-span-7">
          <h2 className="text-2xl font-bold text-green-900 mb-2">Earn money your way</h2>
          <p className="text-gray-600 mb-4">See how much you can make tasking on TaskRabbit</p>
          <div className="relative h-[700px] w-full">
            <DotLottieReact
              autoplay
              loop
              src="https://lottie.host/9b90511e-c23f-4fca-8f06-df880a4cf4f5/1JI7UYUwRc.lottie"
              style={{ height: '650px', width: '650px' }}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-5">
          <div className="mb-">
            <h2 className="text-4xl mb-3 font-bold text-green-800"> Provider's registration form</h2>
            <p className="text-sm text-end font-bold text-gray-600">Provide your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className={`mt-1 block w-full rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className={`mt-1 block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number"
                className={`mt-1 block w-full rounded-md border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`mt-1 block w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`mt-1 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Category */}
            <div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              >
                <option value="">Choose Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>



            {/* Address Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Street Address"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            {/* ZIP and Work Radius */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="ZIP Code (6 digits)"
                  className={`mt-1 block w-full rounded-md border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
              <div>
                <input
                  type="number"
                  name="workRadius"
                  value={formData.workRadius}
                  onChange={handleChange}
                  placeholder="Work Radius (1-50)"
                  className={`mt-1 block w-full rounded-md border ${errors.workRadius ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.workRadius && <p className="text-red-500 text-sm mt-1">{errors.workRadius}</p>}
              </div>
            </div>

            {/* Experience and Profile Picture */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <textarea
                  name="workExperience"
                  value={formData.workExperience}
                  onChange={handleChange}
                  placeholder="Work experience"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Profile Picture</label>
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            {/* Government ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Government ID</label>
                <input
                  type="file"
                  name="governmentId"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className={`mt-1 block w-full ${errors.governmentId ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.governmentId && <p className="text-red-500 text-sm mt-1">{errors.governmentId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Government ID No</label>
                <input
                  type="text"
                  name="governmentIdNo"
                  value={formData.governmentIdNo}
                  onChange={handleChange}
                  placeholder="Enter ID number"
                  className={`mt-1 block w-full rounded-md border ${errors.governmentIdNo ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                />
                {errors.governmentIdNo && <p className="text-red-500 text-sm mt-1">{errors.governmentIdNo}</p>}
              </div>
            </div>

            {/* Submit Button */}

            <button type="submit" className="w-full bg-emerald-700 text-white rounded-md py-3 hover:bg-emerald-600 transition-colors" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Get started'  // Show text when not loading
              )}
            </button>

            <p className=" text-gray-700 text-center mt-2">
              Already have an account?{" "}
              <Link to="/worker-login" className="text-emerald-600 hover:underline">
                Login
              </Link>
            </p>


          </form>
        </div>
      </div>

      <div className="bg-gray-400 max-w-6xl mx-auto py-14 px-8 rounded">
        <Design />
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-16">Getting Started</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">1. Sign up</h2>
            <p className="text-gray-600">Create your account. Then download the Tasker app to continue registration.</p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">2. Build your profile</h2>
            <p className="text-gray-600">Select what services you want to offer and where.</p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">3. Verify your eligibility to task</h2>
            <p className="text-gray-600">Confirm your identity and submit business verifications, as required.</p>
          </div>

          {/* Step 4 */}
          <div className="space-y-4 md:col-span-1">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">4. Set your schedule and work area</h2>
            <p className="text-gray-600">Set your weekly availability and opt in to receive same-day jobs.</p>
          </div>

          {/* Step 5 */}
          <div className="space-y-4 md:col-span-1">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">5. Start getting jobs</h2>
            <p className="text-gray-600">Grow your business on your own terms.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WorkerRegistrationForm;