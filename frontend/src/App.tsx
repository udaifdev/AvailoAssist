import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from "react-redux";
// import { setUser, setToken } from "./slice/userSlice";

// User Parts
import SignupPage from './pages/user/SignupPage';
import LoginPage from './pages/user/LoginPage';
import ForgotPage from "./pages/user/ForgotPage";
import HomePage from './pages/user/HomePage';
import Otp from './components/User/signup/Otp';
import ServicePage from "./pages/user/ServicePage";
import ProfilePage from "./pages/user/ProfilePage";
import UserForgotPassOTP from "./components/User/forgotPass/UserForgotPassOTP";
import UserResetPass from "./components/User/forgotPass/UserResetPass";


// Worker Parts
import WorkerProtectedRoute from "./components/Worker/WorkerProtected";
import WorkerSignup from "./pages/worker/WorkerSignup";
import WorkerOTP from "./components/Worker/signup/WorkerOTP"
import WorkerForgotPass from "./components/Worker/workerForgotPass/WorkerForgotPass";
import WorkerResetPass from "./components/Worker/workerForgotPass/WorkerResetPass";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerLoginPage from "./pages/worker/WorkerLoginPage";
import User_ProtectedRoute from "./components/User/UserProtected";
import JobsPage from "./pages/worker/JobsPage";
import WalletPage from "./pages/worker/WalletPage";
import AboutPage from "./pages/user/AboutPage";
import AvailiblityPage from "./pages/worker/AvailiblityPage";

// Admin Part
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUser from "./pages/admin/AdminUser";
import AdminWorker from "./pages/admin/AdminWorker";
import AdminServiceCategory from "./pages/admin/AdminServiceCategory";
import TaskerPage from "./pages/user/TaskerPage";
import RecommendationPage from "./pages/user/RecommendationPage";
import ConfirmationPage from "./pages/user/ConfirmationPage";
import Succsuss from "./pages/user/SuccsusPage";
import WorkerProfile from "./components/Worker/workerProfile/WorkerProfile";
import AdminPayment from "./pages/admin/AdminPayment";

// import { requestPermission } from "./firebase";
 

const App = () => {

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registration successful');
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    });
  }

  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* User Router's */}
        <Route path="/" element={<HomePage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/verify-otp' element={<Otp />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgotPassword' element={<ForgotPage/>} />
        <Route path='/forgotPassword-OTP' element={<UserForgotPassOTP />} />
        <Route path='/reset-password' element={<UserResetPass />} />
        {/* <Route path='/reset-password' element={<ResetPasswordPage />} /> You'll need to create this */}
        <Route path='/allServices' element={<ServicePage />} />
        <Route path='/careers' element={<AboutPage />} />
        <Route path='/bookingSuccess/:bookingId' element={<Succsuss />} />

        <Route path="" element={<User_ProtectedRoute />}>
          <Route path='/taskeInfo' element={<TaskerPage />} />
          <Route path='/recommandation' element={<RecommendationPage />} />
          <Route path='/bookingConfirm' element={<ConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>




        {/* Worker Router's */}
        <Route path="/workerSignup" element={<WorkerSignup />} />
        <Route path="/worker-verify-otp" element={<WorkerOTP />} />
        <Route path="/worker-login" element={<WorkerLoginPage />} />
        <Route path="/worker-forgot-password" element={<WorkerForgotPass />} />
        <Route path="/worker-reset-password" element={<WorkerResetPass />} />

        <Route path="" element={<WorkerProtectedRoute />}>
          <Route path="/worker-jobs" element={<JobsPage />} />
          <Route path="/worker-wallet" element={<WalletPage />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/worker-profile" element={<WorkerProfile />} />
          <Route path="/worker-availablityManagement" element={<AvailiblityPage/>} />
        </Route>



        {/* Admin Route's */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-usermanagement" element={<AdminUser />} />
        <Route path="/admin-workermanagement" element={<AdminWorker />} />
        <Route path="/admin-serviceCategory" element={<AdminServiceCategory />} />
        <Route path="/admin-paymentHistory" element={<AdminPayment/>} />

      </Routes>
    </Router>
  );
}

export default App;
