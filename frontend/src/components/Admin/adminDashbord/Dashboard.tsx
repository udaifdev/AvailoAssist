import React, { useEffect, useState } from 'react';
import { Users, UserCog, Calendar, DollarSign, AlertCircle, LucideIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StatCardProps, DashboardData } from '../../../types/dashboard';
import { adminAxios } from '../../../API/axios';

const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, subtext }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
        {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAxios.get<DashboardData>('/admin/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error || !dashboardData) return (
    <div className="flex items-center justify-center h-screen text-red-500">
      <AlertCircle className="w-6 h-6 mr-2" />
      {error || 'No data available'}
    </div>
  );

  const {
    userStats,
    workerStats,
    bookingStats,
    paymentStats,
    categoryStats
  } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={userStats.totalUsers}
          subtext={`${userStats.newUsersThisMonth} new this month`}
          Icon={Users}
        />
        <StatCard
          title="Active Workers"
          value={workerStats.activeWorkers}
          subtext={`${workerStats.pendingWorkers} pending approval`}
          Icon={UserCog}
        />
        <StatCard
          title="Total Bookings"
          value={bookingStats.totalBookings}
          subtext={`${bookingStats.monthlyBookings} this month`}
          Icon={Calendar}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${paymentStats.totalEarnings.toLocaleString()}`}
          subtext={`₹${paymentStats.monthlyEarnings.toLocaleString()} this month`}
          Icon={DollarSign}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Service Categories</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Booking Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingStats.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id"
                  tickFormatter={(value: { year: number; month: number }) => {
                    const date = new Date(value.year, value.month - 1);
                    return date.toLocaleDateString('default', { month: 'short' });
                  }}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Worker</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentBookings.map((booking, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-3">{booking.serviceName}</td>
                    <td className="py-3">{booking.userName}</td>
                    <td className="py-3">{booking.workerName}</td>
                    <td className="py-3">₹{booking.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.bookedStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        booking.bookedStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.bookedStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;