import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const WorkerProtectedRoute: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.worker.workerToken);

  return isAuthenticated ? <Outlet /> : <Navigate to="/worker-login" />;
};

export default WorkerProtectedRoute;
