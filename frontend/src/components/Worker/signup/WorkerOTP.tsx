import React, { useState, useEffect } from 'react';
import Design from '../../../particial/Design';
import { toast } from 'react-toastify'; // Ensure toast is imported
import { useNavigate } from 'react-router-dom'; // For navigation
import { useSelector } from "react-redux";
import { RootState } from '../../../store';
import { useDispatch } from 'react-redux'; // For Redux actions
import { set_Worker_Credentials } from "../../../slice/workerSlice"; // Redux actions
import axiosInstance from '../../../API/axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for OTP verification
  const [isResendLoading, setIsResendLoading] = useState<boolean>(false); // Loading state for Resend OTP


  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { workerDetails } = useSelector((state: RootState) => state.worker);
  // Redirect authenticated users to the Dashboard page
  useEffect(() => {
    if (workerDetails) {
      navigate("/worker-dashboard");
    }
  }, [workerDetails, navigate]);


  // Countdown timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };


  const convertWebPToJPEG = async (file: File): Promise<File> => {
    if (file.type === 'image/webp') {
      // Create an image element
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      // Wait for image to load
      await new Promise(resolve => img.onload = resolve);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      // Convert to JPEG blob
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9);
      });
      
      // Create new file
      return new File([blob], file.name.replace(/\.webp$/, '.jpg'), {
        type: 'image/jpeg'
      });
    }
    return file;
  };
  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const signupData = JSON.parse(localStorage.getItem('worker_SignupData') || '{}');
      
      if (!signupData.email) {
        throw new Error("Signup data missing");
      }

      const formData = new FormData();

      // Append all text fields
      const textFields = [
        'fullName', 'email', 'mobile', 'password', 'category',
        'streetAddress', 'city', 'zipCode', 'workRadius',
        'workExperience', 'governmentIdNo'
      ];

      textFields.forEach(field => {
        if (signupData[field]) {
          formData.append(field, signupData[field]);
        }
      });

      // Append OTP
      formData.append('otp', otp.join(''));

      // Handle file uploads with WebP conversion
      const fileTypes = {
        profilePicture: {
          id: sessionStorage.getItem('profilePicture_id'),
          filename: 'profile.jpg'
        },
        governmentId: {
          id: sessionStorage.getItem('governmentId_id'),
          filename: 'government.jpg'
        }
      };

      for (const [key, { id }] of Object.entries(fileTypes)) {
        if (id) {
          const blobUrl = sessionStorage.getItem(id);
          if (blobUrl) {
            try {
              const response = await fetch(blobUrl);
              const blob = await response.blob();
              const file = new File([blob], `${key}.jpg`, { type: blob.type });
              
              // Convert if it's WebP
              const processedFile = await convertWebPToJPEG(file);
              formData.append(key, processedFile, processedFile.name);
            } catch (error) {
              console.error(`Error processing ${key}:`, error);
              throw new Error(`Failed to process ${key}`);
            }
          }
        }
      }

      // Log form data for debugging
      console.log('Form data entries:----->');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axiosInstance.post('worker/worker-verify-otp', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        // Clean up storage
        localStorage.removeItem('worker_SignupData');
        
        // Clean up file blobs
        Object.values(fileTypes).forEach(({ id }) => {
          if (id) {
            const blobUrl = sessionStorage.getItem(id);
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
            }
            sessionStorage.removeItem(id);
            sessionStorage.removeItem(`${id}_id`);
          }
        });

        dispatch(set_Worker_Credentials(response.data));
        toast.success("Registration successful!");
        navigate('/worker-dashboard');
      }
    } catch (error: any) {
      setOtp(new Array(4).fill(''));
      toast.error(error.response?.data?.message || "Verification failed.");
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
    }
  };



  // Resent OTP
  const handleResend = async () => {
    if (!canResend) return;
    setIsResendLoading(true);

    try {
      const signupData = JSON.parse(localStorage.getItem('worker_SignupData') || '{}');
      if (!signupData.email) throw new Error("Signup data missing");

      await axiosInstance.post('worker/worker-resend-otp', { email: signupData.email });
      toast.success("New OTP Resended!", { position: "top-center" });

      // Reset OTP inputs and timer
      setOtp(new Array(4).fill(''));
      setTimer(30);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.", { position: "top-center" });
    }
  };


  return (
    <div className="min-h-screen bg-gray-500 flex justify-center items-center">
      <div className="relative w-[500px] h-[600px] bg-white rounded-3xl shadow-lg p-8">
        {/* Top Logo */}
        {/* text-[#005073]  */}
        <div className="text-center mb-16">
          <Design />
          <h1 className="text-emerald-600 text-6xl font-bold">
            AVAILOASSIST
            <span className="block text-emerald-600 text-3xl text-right font-bold">Expertist</span>
          </h1>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-0 bottom-0">
          <div className="w-40 h-40 bg-emerald-600 rounded-full opacity-70 translate-x-[-50%] translate-y-[50%]" />
          <div className="absolute inset-0 bg-stripes-white rotate-45" />
        </div>
        <div className="absolute right-0 top-1/3">
          <div className="w-40 h-40 bg-emerald-600 rounded-full opacity-70 translate-x-[50%] translate-y-[-50%]" />
          <div className="absolute inset-0 bg-stripes-white -rotate-45" />
        </div>

        {/* OTP Form */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-emerald-700 mb-12">O T P</h2>

          <div className="text-center mb-8">
            <p className="text-emerald-700 mb-6">Enter Your OTP</p>
            <div className="flex justify-center gap-4">

              {otp.map((digit, index) => (
                <input key={index} type="text" name={`otp-${index}`} value={digit} onChange={(e) => handleChange(index, e.target.value)} className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-xl" maxLength={1} />
              ))}

            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-red-500 hover:text-red-600"
                disabled={isResendLoading} // Disable resend button when loading
              >
                {isResendLoading ? (
                  <div className="loader"></div> // Add spinner while resending OTP
                ) : (
                  "Resend OTP"
                )}
              </button>
            ) : (
              <p>Resend OTP in {timer} seconds</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 text-white rounded-md py-3 hover:bg-emerald-500 transition-colors"
            disabled={isLoading} // Disable the verify button when loading
          >
            {isLoading ? (
              <div className="spinner"></div> // Add spinner while verifying OTP
            ) : (
              "Verify"
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
