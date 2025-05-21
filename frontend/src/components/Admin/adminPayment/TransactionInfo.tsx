import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent } from "../../ui/dailog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/dailog";
import { adminAxios } from '../../../API/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../store';

interface Transaction {
  service: string;
  clientName: string;
  amountPaid: number;
  workerName: string;
  workerFee: number;
  adminFee: number;
  dateTime: string;
  paymentStatus: string;
}

const TransactionInfo = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.admin.token);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchTransactions();
    fetchWalletData();
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await adminAxios.get('/admin/payments/transactions', config);
      setTransactions(response.data);
    } catch (err) {
      handleError(err);
    }
  };

  const fetchWalletData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await adminAxios.get('/admin/payments/wallet-balance', config);
      const wallet = response.data.balance?.wallet;
      setWalletBalance(wallet?.balanceAmount || 0);
      setTotalEarnings(wallet?.totalEarnings || 0);
      setTotalWithdraw(wallet?.totalWithdraw || 0);
    } catch (err) {
      handleError(err);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!validateWithdrawAmount()) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await adminAxios.post('/admin/payments/withdraw',
        { amount: Number(withdrawAmount) },
        config
      );

      toast.success("Withdrawal successful!");
      resetWithdrawState();
      fetchWalletData();
    } catch (err) {
      toast.error("Withdrawal failed. Please try again.");
      handleError(err);
    }
  };

  const validateWithdrawAmount = () => {
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return false;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient funds.");
      return false;
    }
    return true;
  };

  const resetWithdrawState = () => {
    setWithdrawAmount('');
    setIsWithdrawing(false);
  };

  const handleError = (err: any) => {
    if (err.response?.status === 401) {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-teal-700 text-center mb-8">
          Transaction Information
        </h1>

        {/* Wallet Info Section */}
        <Card className="bg-white shadow-lg rounded-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <h2 className="text-teal-700 font-semibold text-lg">Wallet Overview</h2>
              <div className="flex justify-around w-full space-x-8">
                <div className="text-center">
                  <h3 className="text-gray-500 text-sm">Total Earnings</h3>
                  <p className="text-teal-700 text-2xl font-bold">₹{totalEarnings}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-gray-500 text-sm">Current Balance</h3>
                  <p className="text-teal-700 text-2xl font-bold">₹{walletBalance}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-gray-500 text-sm">Total Withdrawals</h3>
                  <p className="text-teal-700 text-2xl font-bold">₹{totalWithdraw}</p>
                </div>
              </div>

              {isWithdrawing ? (
                <div className="space-y-4 w-full max-w-xs">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleWithdraw}
                      className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setIsWithdrawing(false);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsWithdrawing(true)}
                  className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 
                           transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Withdraw Funds
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='mb-0'>
          <h3 className='mb-0 font-semibold text-gray-500'>Transactions Overview</h3>
        </div>
        {/* Transactions Table */}
        <div className="bg-white mt-0 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-teal-50">
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Service</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Client Name</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Amount Paid</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Worker Name</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Worker Fee</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Admin Fee</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Date & Time</TableCell>
                  <TableCell className="py-4 px-6 text-teal-700 font-semibold">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                  >
                    <TableCell className="py-4 px-6">{transaction.service}</TableCell>
                    <TableCell className="py-4 px-6">{transaction.clientName}</TableCell>
                    <TableCell className="py-4 px-6 font-medium">₹{transaction.amountPaid.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-6">{transaction.workerName}</TableCell>
                    <TableCell className="py-4 px-6">₹{transaction.workerFee.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-6">₹{transaction.adminFee.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-6">{transaction.dateTime}</TableCell>
                    <TableCell className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${transaction.paymentStatus === 'success'
                            ? 'bg-green-100 text-green-700'
                            : transaction.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfo;
