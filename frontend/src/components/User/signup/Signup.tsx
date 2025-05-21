import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { ClipLoader } from 'react-spinners';
import axiosInstance from "../../../API/axios";
import { RootState } from '../../../store';
import Design from "../../../particial/Design";
import "./signup.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const Signup = () => {
  const navigate = useNavigate();
  const { userDetails } = useSelector((state: RootState) => state.user);

  // Redirect authenticated users to the home page
  useEffect(() => {
    if (userDetails) {
      navigate("/");
    }
  }, [userDetails, navigate]);

  const [formData, setFormData] = useState<{
    firstName: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobile: string;
    profilePic: File | null;
  }>({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    profilePic: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error for the specific field
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePic: e.target.files[0] });
      setErrors({ ...errors, profilePic: "" });
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (formData.firstName.trim().length < 4) newErrors.firstName = "Name must be at least 4 characters long.";
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be exactly 10 digits.";

    if (!formData.profilePic) {
      newErrors.profilePic = "Profile picture is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Send the essential data for OTP generation
        const response = await axiosInstance.post('user/signup', {
          firstName: formData.firstName,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
        });

        if (response.status === 201) {
          // Store essential data for the verification step
          const signupData = {
            firstName: formData.firstName,
            email: formData.email,
            password: formData.password,
            mobile: formData.mobile,
            hasProfilePic: !!formData.profilePic, // Flag for profile picture
          };

          // Store form data (excluding the profile picture) in localStorage
          localStorage.setItem('signupData', JSON.stringify(signupData));

          // If a profile picture exists, convert it to Base64 and store it in sessionStorage
          if (formData.profilePic) {
            const reader = new FileReader();
            reader.onloadend = () => {
              sessionStorage.setItem('profilePic', reader.result as string);
            };
            reader.readAsDataURL(formData.profilePic);
          }

          toast.success("OTP sent to your email!", { position: "top-center" });
          navigate('/verify-otp');
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "An error occurred.", { position: "top-center" });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please fix the errors in the form.", { position: "top-center" });
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Design />
      <div className="grid grid-cols-1 md:grid-cols-2  max-w-4xl mx-auto  p-4  ">
        {/* Left Column: Signup Form */}
        <div className="p-2 sm:p-10">
          <h1 className="text-5xl font-bold text-center text-tealCustom mb-1 tracking-wider text-shadow">
            AVAILOASSIST
          </h1>
          <h3 className="text-1xl font-bold text-center text-tealCustom mb-2 text-shadow">
            Create Your Account
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm">{errors.mobile}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i
                  className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                ></i>
              </span>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <label htmlFor="profilePic" className="text-gray-400 mb-1 text-xs">
                Profile Picture
              </label>
              <input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
              />
              {formData.profilePic && (
                <img
                  src={URL.createObjectURL(formData.profilePic)}
                  alt="Profile Preview"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                />
              )}
              {errors.profilePic && (
                <p className="text-red-500 text-sm">{errors.profilePic}</p>
              )}
            </div>



            <button
              type="submit"
              className="w-full custom-button bg-tealCustom text-white py-2 px-4 rounded focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Create account'
              )}
            </button>
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <Link to="/login" className="custom-link text-green-700 underline ml-2">
                Login
              </Link>
            </p>
          </form>
        </div>

        {/* Right Column: Image */}
        <div className="flex items-center justify-center p-">
          <DotLottieReact
            src="https://lottie.host/837303d2-b6ff-49fb-ab17-2215f5986d51/LsajYOv1qj.lottie"
            loop
            autoplay
            // className="rounded-lg   h-98 w-full"
            style={{ width: "550px", height: '550px' }}
          />
        </div>
      </div>
    </div>

  );
};

export default Signup;














{/* <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://romandecoratingproducts.com/wp-content/uploads/2022/07/workers-hanging-stylish-wall-paper-sheet-on-wall.jpg')", }}>

<Design />

<div className="bg-white p-6 sm:p-10 rounded-2xl shadow-md w-full max-w-md">
  <h1 className="text-5xl font-bold text-center text-green-800 mb-6 tracking-wider text-shadow">
    AVAILOASSIST
  </h1>

  <form className="space-y-4" onSubmit={handleSubmit}>
    <div>
      <input type="text" name="firstName" placeholder="First Name" className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
        value={formData.firstName} onChange={handleInputChange} />
      {errors.firstName && (
        <p className="text-red-500 text-sm">{errors.firstName}</p>
      )}
    </div>

    <div>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email Address"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email}</p>
      )}
    </div>

    <div>
      <input
        type="text"
        name="mobile"
        value={formData.mobile}
        onChange={handleInputChange}
        placeholder="Mobile Number"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
      />
      {errors.mobile && (
        <p className="text-red-500 text-sm">{errors.mobile}</p>
      )}
    </div>

    <div>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Password"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password}</p>
      )}
    </div>

    <div className="relative">
      <input
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        placeholder="Confirm Password"
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
      />
      <span
        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      >
        <i
          className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
        ></i>
      </span>
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
      )}
    </div>




    <div className="flex flex-col items-center">
      <label htmlFor="profilePic" className="text-gray-400 mb-2">
        Profile Picturen
      </label>
      <input
        type="file"
        id="profilePic"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
      />
      {formData.profilePic && (
        <img
          src={URL.createObjectURL(formData.profilePic)}
          alt="Profile Preview"
          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
        />
      )}
    </div>

    <p className="text-sm text-gray-500 text-center">
      Already have an account?{" "}
      <Link to="/login" className="custom-link text-green-700 underline ml-2">
        Login
      </Link>
    </p>

    <button type="submit" className="w-full custom-button text-white py-2 px-4 rounded focus:outline-none" disabled={isLoading}>
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        'Create account'  // Show text when not loading
      )}
    </button>
  </form>
</div>
</div>
); */}