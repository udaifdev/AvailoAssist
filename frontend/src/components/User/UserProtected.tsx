import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';


const User_ProtectedRoute: React.FC = () => {
  const { userToken, isBlocked } = useSelector((state: RootState) => state.user);

  // If user is blocked, redirect to login with a message
  if (isBlocked) {
    return <Navigate to="/login" state={{ message: 'Your account has been blocked' }} />;
  }

  // If not authenticated, redirect to login
  if (!userToken) {
    return <Navigate to="/login" />;
  }

  // If authenticated and not blocked, render the protected routes
  return <Outlet />;
};
export default User_ProtectedRoute;