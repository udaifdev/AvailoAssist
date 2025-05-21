import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../../slice/userSlice";
import { RootState } from "../../../store";
import axiosInstance from "../../../API/axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Design from "../../../particial/Design";
import { initializeNotifications } from '../../../utils/webPushConfig';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "./login.css";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const blockedMessage = location.state?.message;

  const { userDetails } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (userDetails) {
      navigate("/");
    }
  }, [userDetails, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
        try {
          const response = await axiosInstance.post('/user/login', { email, password });
          if (response.status === 200) {
            dispatch(setCredentials(response.data));
            toast.success("Login successful!", { position: "top-center" });
            try {
              const notificationSetup = await initializeNotifications(response.data.id);
              if (notificationSetup) {
                console.log('Notifications initialized successfully...');
              } else {
                console.log('User denied notification permission...');
              }
            } catch (notifError) {
              console.error('Error setting up notifications...', notifError);
            }
            navigate("/");
          }
        } catch (err: any) {
          console.error('FULL ERROR............', { error: err,response: err.response,request: err.request});
          toast.error(err.response?.data?.message || "Login failed.", { position: "top-center" });
        } finally {
          setIsLoading(false);
        }
    } else {
      toast.error("Please fix the errors in the form.", { position: "top-center" });
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {blockedMessage && (
        <div className="text-red-500 mb-4">
          {blockedMessage}
        </div>
      )}
      <Design />
      <div className="grid md:grid-cols-2 rounded-lg max-w-6xl mx-auto">
        {/* Left Column: Login Form */}
        <div className="p-6 sm:p-10">
          <h1 className="text-5xl text-center font-bold text-tealCustom  mb-4 tracking-wider text-shadow">
            AVAILOASSIST
          </h1>
          <h3 className="text-2xl font-bold text-center text-tealCustom mb-6 text-shadow">
            User Login
          </h3>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={email}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <span
                className="absolute right-5 top-4 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <Link to="/forgotPassword">
              <span className="text-sm p-2 text-gray-400 justify-end flex">Forgot Password?</span>
            </Link>

            <button
              type="submit"
              className="w-full p-3 bg-tealCustom  text-white rounded-xl custom-button"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login & Continue"}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="custom-link text-green-700 underline ml-2">
              Signup
            </Link>
          </p>
        </div>

        {/* Right Column: Image */}
        <div className="flex items-center justify-center p-4">
          <DotLottieReact
            src="https://lottie.host/837303d2-b6ff-49fb-ab17-2215f5986d51/LsajYOv1qj.lottie"
            loop
            autoplay
            style={{ width: "450px", height: '450px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
