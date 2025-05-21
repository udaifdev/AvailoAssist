import React, { useEffect, useState } from 'react';
import { TrendingUp, Star, IndianRupee, Briefcase, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from '../../../store';
import axiosInstance from '../../../API/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
}

interface DashboardData {
  earnings: number;
  jobsCompleted: number;
  totalJobs: number;
  totalDistance: number;
  averageRating: number;
  monthlyEarnings: Array<{
    name: string;
    earnings: number;
  }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon }) => (
  <div className="p-4 bg-white bg-opacity-15 rounded-lg border-4 border-tealCustom shadow-lg hover:shadow-xl transition-all">
    <div className="flex flex-col items-center justify-center h-40">
      <div className="w-12 h-12 mb-3 flex items-center justify-center text-tealCustom">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <p className="text-sm text-gray-300">{title}</p>
      {trend && (
        <p className="text-xs text-gray-400 mt-2 flex items-center">
          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
          {trend}
        </p>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const { workerDetails } = useSelector((state: RootState) => state.worker);

  useEffect(() => {
    if (!workerDetails) {
      navigate("/worker-login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch worker status
        const statusResponse = await axiosInstance.get(`/worker/workerDashboard/${workerDetails.email}`);
        const status = statusResponse.data.status;

        if (status === 'pending') {
          setStatusMessage('Your account is pending approval. Please check back later.');
          setIsApproved(false);
        } else if (status === 'Rejected') {
          setStatusMessage('Your application has been rejected.');
          setIsApproved(false);
        } else if (status === 'Accepted') {
          setIsApproved(true);

          // Fetch additional dashboard data
          const [metricsResponse, ratingsResponse] = await Promise.all([
            axiosInstance.get(`/worker/metrics/${workerDetails.id}`),
            axiosInstance.get(`/worker/ratings/${workerDetails.id}`)
          ]);

          setDashboardData({
            ...metricsResponse.data,
            averageRating: ratingsResponse.data.averageRating
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStatusMessage('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [workerDetails, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tealCustom"></div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white bg-opacity-10 p-6 rounded-lg border border-tealCustom shadow-lg">
          <h2 className="font-bold text-tealCustom text-center text-2xl mb-4">Worker Status</h2>
          <p className="text-lg text-center p-4 font-semibold text-white">{statusMessage}</p>
          <DotLottieReact
            src="https://lottie.host/7a7fa126-5f67-423b-b631-2a3e201b9189/7AVTc0EACj.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white mb-8">Welcome Back..!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Earnings"
          value={`₹${dashboardData.earnings.toLocaleString()}`}
          icon={<IndianRupee className="w-8 h-8" />}
        />
        <MetricCard
          title="Jobs Completed"
          value={dashboardData.jobsCompleted.toString()}
          icon={<Briefcase className="w-8 h-8" />}
        />
        <MetricCard
          title="Total Jobs"
          value={dashboardData.totalJobs.toString()}
          icon={<Briefcase className="w-8 h-8" />}
        />
        <MetricCard
          title="Distance Covered"
          value={`${dashboardData.totalDistance} km`}
          icon={<MapPin className="w-8 h-8" />}
        />
        <MetricCard
          title="Average Rating"
          value={`${dashboardData.averageRating.toFixed(1)}/5.0`}
          icon={<Star className="w-8 h-8" />}
        />
      </div>

      <div className="bg-white bg-opacity-10 p-6 rounded-lg border border-tealCustom shadow-lg">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Monthly Earnings</h2>
            <p className="text-sm text-gray-400">Your earnings trend over time</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Earnings</p>
            <p className="text-lg font-semibold text-white">₹{dashboardData.earnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.monthlyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar dataKey="earnings" fill="#408B8F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;