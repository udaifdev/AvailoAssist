import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { set_Worker_Credentials } from "../../../slice/workerSlice";
import { RootState } from "../../../store";
import axiosInstance from "../../../API/axios";
import 'react-toastify/dist/ReactToastify.css';
import { initializeNotifications } from '../../../utils/webPushConfig';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const WorkerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { workerDetails } = useSelector((state: RootState) => state.worker);
    useEffect(() => {
        if (workerDetails) {
            navigate("/worker-dashboard");
        }
    }, [workerDetails, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Enter a valid email address.';
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post("worker/worker-login", { email, password });
    
                if (response.status === 201) {
                    dispatch(set_Worker_Credentials(response.data));
                    toast.success("Login successful!", { position: "top-center" });
    
                    // THIS IS THE ONLY PART YOU NEED TO CHANGE
                    const notificationSetup = await initializeNotifications(response.data.id);
                    if (!notificationSetup) {
                        console.warn('Worker denied notification permission...........');
                    }
    
                    navigate("/worker-dashboard");
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Login failed.", { position: "top-center" });
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error("Please fix the errors in the form.", { position: "top-center" });
        }
    };

    return (
        <div className="container min-h-screen  flex flex-col">
            <div className="flex justify-center mb-12 mt-12">
                <h1 className="text-5xl font-bold text-tealCustom hover:scale-105 transition-transform duration-300">
                    AVAILOASSIST
                </h1>
                <p className="text-2xl text-tealCustom font-bold ">Expertist</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 px-28">
                {/* Left side - Form */}
                <div className="w-full lg:w-1/2  lg:p-12 flex flex-col justify-center">
                    <form className="max-w-md mx-auto w-full space-y-6" onSubmit={handleSubmit}>
                        <h2 className="text-3xl font-bold text-tealCustom">Provider's Login Form</h2>
                        <p className="text-gray-600 text-sm">
                            Please login to continue to your work & get details.
                        </p>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleInputChange}
                                className="block w-full rounded-md px-3 py-2 focus:border-teal-900 focus:outline-none focus:ring-1 focus:ring-green-500 shadow-md"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleInputChange}
                                className="block w-full rounded-md px-3 py-2 pr-10 focus:border-green-900 focus:outline-none focus:ring-1 focus:ring-green-500 shadow-md"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-1 flex mt-4 items-center pr-5 text-gray-500"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link to="/worker-forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-tealCustom text-white py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform duration-200 hover:scale-105 shadow-md"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Get started'}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/workerSignup" className="text-tealCustom  hover:underline">
                                Signup
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Right side - Lottie Animation */}
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <DotLottieReact
                        autoplay
                        loop
                        src="https://lottie.host/b0c136ff-3f44-40ab-ab24-1f68886c8253/PmK2kU9olO.lottie"
                        style={{ height: '400px', width: '400px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default WorkerLogin;
