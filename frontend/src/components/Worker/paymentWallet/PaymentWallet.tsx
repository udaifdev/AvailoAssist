import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../../store';
import axiosInstance from '../../../API/axios';
import { Transaction, PaymentStats } from '../../../types/transaction';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Wallet, ArrowDown } from 'lucide-react'; // Importing Lucide icons

const PaymentWallet = () => {
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayments: 0,
    totalCommission:0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const workerId = useSelector((state: RootState) => state.worker.workerDetails?.id);
  const totalWithdraw = stats.totalEarnings - stats.availableBalance;
 
  useEffect(() => {
    fetchPaymentDetails();
  }, [workerId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/worker/worker-payments/${workerId}`);
      const { totalEarnings, availableBalance, pendingPayments, totalCommission, recentTransactions } = response.data;

      setStats({ totalEarnings, availableBalance, pendingPayments, totalCommission });
      setTransactions(recentTransactions);
    } catch (err) {
      toast.error('Failed to fetch payment details', { position: 'top-right' });
      setError('Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > stats.availableBalance) {
      toast.error('Invalid withdrawal amount', { position: 'top-center' });
      setWithdrawAmount(0);
      return;
    }

    try {
      await axiosInstance.post(`/worker/withdraw/${workerId}`, { amount: withdrawAmount });
      toast.success(`Withdrawal successful: ₹${withdrawAmount}`, { position: 'top-right' });
      fetchPaymentDetails();
      setWithdrawAmount(0);
    } catch (err) {
      toast.error('Failed to withdraw balance', { position: 'top-right' });
      setError('Failed to withdraw balance');
    }
  };

  const renderTransactionRow = (transaction: Transaction) => {
    const isWithdrawal = transaction.paymentMethod === 'withdrawal';
    return (
      <tr key={transaction._id} className="border-b hover:bg-gray-50">
        <td className="py-3 px-4">
          {new Date(transaction.paymentDate).toLocaleDateString()}
        </td>
        <td className="py-3 px-4">
          {isWithdrawal ? (
            <span className="flex items-center">
              <ArrowDown className="w-4 h-4 mr-2 text-red-600" />
              Withdrawal
            </span>
          ) : (
            transaction.bookingId?.serviceName
          )}
        </td>
        <td className="py-3 px-4">
          <span className={isWithdrawal ? 'text-red-600' : 'text-green-600'}>
            {isWithdrawal ? '-' : '+'}₹{transaction.amount}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="text-red-600">
            -₹{transaction.adminCommission}
          </span>
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-sm
              ${transaction.paymentStatus === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'}`}
          >
            {transaction.paymentStatus === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            {isWithdrawal ? 'Withdrawn' : transaction.paymentStatus === 'success' ? 'Completed ✓' : 'Pending ⟳'}
          </span>
        </td>
      </tr>
    );
  };
  

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-bold text-4xl text-center">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center text-tealCustom mb-2">Payment Details & Wallet</h1>
        <p className="text-gray-600 text-center">
          <DollarSign className="inline w-5 h-5 mr-1 text-emerald-600" />
          Manage your earnings, view transactions, and withdraw funds
        </p>
      </div>
      
      <div className="mb-8">
  <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
    Earnings Overview <TrendingUp className="w-6 h-6 text-tealCustom" />
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Total Earnings */}
    <div className="border-2 border-tealCustom rounded-lg p-5">
      <div className="w-24 h-24 p-2 mx-auto border-4 border-tealCustom rounded-full flex flex-col items-center justify-center mb-2">
        <TrendingUp className="w-7 h-7 text-emerald-600 mb-1" />
        <div className="text-xs text-center text-emerald-700 font-medium">Total Earnings</div>
      </div>
      <div className="text-center font-medium text-lg">₹{stats.totalEarnings}</div>
    </div>

    {/* Available Balance */}
    <div className="border-2 border-tealCustom rounded-lg p-5">
      <div className="w-24 h-24 p-2 mx-auto border-4 border-tealCustom rounded-full flex flex-col items-center justify-center mb-2">
        <Wallet className="w-7 h-7 text-tealCustom mb-1" />
        <div className="text-xs text-center text-emerald-700 font-medium">Available Balance</div>
      </div>
      <div className="text-center font-medium text-lg">₹{stats.availableBalance}</div>
    </div>

    {/* Total Withdrawn */}
    <div className="border-2 border-tealCustom rounded-lg p-5">
      <div className="w-24 h-24 p-2 mx-auto border-4 border-tealCustom rounded-full flex flex-col items-center justify-center mb-2">
        <ArrowDown className="w-7 h-7 text-tealCustom mb-1" />
        <div className="text-xs text-center text-tealCustom font-medium">Total Withdrawn</div>
      </div>
      <div className="text-center font-medium text-lg">₹{totalWithdraw}</div>
    </div>

    {/* Total Commission */}
    <div className="border-2 border-tealCustom rounded-lg p-5">
      <div className="w-24 h-24 p-2 mx-auto border-4 border-tealCustom rounded-full flex flex-col items-center justify-center mb-2">
        <DollarSign className="w-7 h-7 text-red-600 mb-1" />
        <div className="text-xs text-center text-red-700 font-medium">Total Commission</div>
      </div>
      <div className="text-center font-medium text-lg text-red-600">₹{stats.totalCommission}</div>
    </div>
  </div>
</div>



      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Transaction History</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
          <thead className="bg-tealCustom text-white">
  <tr>
    <th className="py-3 px-4 text-left">Date</th>
    <th className="py-3 px-4 text-left">Description</th>
    <th className="py-3 px-4 text-left">Amount</th>
    <th className="py-3 px-4 text-left">Commission</th>
    <th className="py-3 px-4 text-left">Status</th>
  </tr>
</thead>

            <tbody>
              {transactions.length > 0
                ? transactions.map(renderTransactionRow)
                : (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-4 mt-20 border-tealCustom rounded-lg p-6 max-w-sm mx-auto">
        <h2 className="text-lg font-bold text-tealCustom mb-4 flex items-center">
          <Wallet className="w-6 h-6 mr-2" />
          My Wallet
        </h2>
        <div className="mb-4">
          <div className="text-center text-gray-600 mb-2">Available Balance</div>
          <div className="w-32 h-32 mx-auto border-4 border-tealCustom rounded-full flex items-center justify-center mb-4">
            <div className="text-xl font-medium">₹{stats.availableBalance}</div>
          </div>
        </div>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
          placeholder="Enter amount"
          className="w-full border-2 border-tealCustom rounded-md p-2 mb-4"
        />
        <button
          onClick={handleWithdraw}
          className="w-full bg-tealCustom text-white py-2 px-4 rounded-md hover:bg-emerald-800 transition-colors"
          disabled={stats.availableBalance <= 0 || withdrawAmount <= 0}
        >
          <ArrowDown className="w-4 h-4 inline mr-2" />
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default PaymentWallet;





















// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../API/axios';
// import { RootState } from '../../../store';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { Transaction, PaymentStats } from '../../../types/transaction';
 

// const PaymentWallet = () => {
//   const [stats, setStats] = useState<PaymentStats>({
//     totalEarnings: 0,
//     availableBalance: 0,
//     pendingPayments: 0,
//   });
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [withdrawAmount, setWithdrawAmount] = useState(0);

//   const workerId = useSelector((state: RootState) => state.worker.workerDetails?.id);

//   const totalWithdraw = stats.totalEarnings - stats.availableBalance


//   useEffect(() => {
//     fetchPaymentDetails();
//   }, [workerId]);

//   const fetchPaymentDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get(`/worker/worker-payments/${workerId}`);
//       const { totalEarnings, availableBalance, pendingPayments, recentTransactions } = response.data;

//       setStats({ totalEarnings, availableBalance, pendingPayments });
//       setTransactions(recentTransactions);
//     } catch (err) {
//       toast.error('Failed to fetch payment details', { position: 'top-right' });
//       setError('Failed to fetch payment details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleWithdraw = async () => {
//     if (withdrawAmount <= 0 || withdrawAmount > stats.availableBalance) {
//       toast.error('Invalid withdrawal amount', { position: 'top-center' });
//       setWithdrawAmount(0);
//       return;
//     }

//     try {
//       await axiosInstance.post(`/worker/withdraw/${workerId}`, { amount: withdrawAmount });
//       toast.success(`Withdrawal successful: ₹${withdrawAmount}`, { position: 'top-right' });
//       fetchPaymentDetails();
//       setWithdrawAmount(0);
//     } catch (err) {
//       toast.error('Failed to withdraw balance', { position: 'top-right' });
//       setError('Failed to withdraw balance');
//     }
//   };

//   const renderTransactionRow = (transaction: Transaction) => {
//     const isWithdrawal = transaction.paymentMethod === 'withdrawal';

//     return (
//       <tr key={transaction._id} className="border-b hover:bg-gray-50">
//         <td className="py-3 px-4">
//           {new Date(transaction.paymentDate).toLocaleDateString()}
//         </td>
//         <td className="py-3 px-4">
//           {isWithdrawal ? 'Withdrawal' : transaction.bookingId?.serviceName}
//         </td>
//         <td className="py-3 px-4">
//           <span className={isWithdrawal ? 'text-red-600' : 'text-green-600'}>
//             {isWithdrawal ? '-' : '+'}₹{transaction.amount}
//           </span>
//         </td>
//         <td className="py-3 px-4">
//           <span
//             className={`inline-flex items-center px-2 py-1 rounded-full text-sm
//               ${transaction.paymentStatus === 'success'
//                 ? 'bg-green-100 text-green-800'
//                 : 'bg-yellow-100 text-yellow-800'}`}
//           >
//             {isWithdrawal
//               ? 'Withdrawn'
//               : transaction.paymentStatus === 'success'
//                 ? 'Completed ✓'
//                 : 'Pending ⟳'}
//           </span>
//         </td>
//       </tr>
//     );
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 font-bold text-4xl text-center">{error}</div>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       {/* Header section remains the same */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-center text-tealCustom mb-2">Payment Details & Wallet</h1>
//         <p className="text-gray-600 text-center">Manage your earnings, view transactions, and withdraw funds</p>
//       </div>

//       {/* Stats cards section remains the same */}
//       <div className="mb-8">
//         <h2 className="text-lg font-medium mb-4">Earnings Overview 📈</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="border-2 border-tealCustom rounded-lg p-6">
//             <div className="w-24 h-24 mx-auto border-4 border-tealCustom rounded-full flex items-center justify-center mb-2">
//               <div className="text-sm text-center text-emerald-700">Total Earnings</div>
//             </div>
//             <div className="text-center font-medium">₹{stats.totalEarnings}</div>
//           </div>

//           <div className="border-2 border-tealCustom rounded-lg p-6">
//             <div className="w-24 h-24 mx-auto border-4 border-tealCustom rounded-full flex items-center justify-center mb-2">
//               <div className="text-sm text-center text-emerald-700">Available Balance</div>
//             </div>
//             <div className="text-center font-medium">₹{stats.availableBalance}</div>
//           </div>

//           <div className="border-2 border-tealCustom rounded-lg p-6">
//             <div className="w-24 h-24 mx-auto border-4 border-tealCustom rounded-full flex items-center justify-center mb-2">
//               <div className="text-sm text-center text-tealCustom">Total Withdraw</div>
//             </div>
//             {/* <div className="text-center font-medium">${stats.pendingPayments}</div> */}
//             <div className="text-center font-medium">₹{totalWithdraw}</div>
//           </div>
//         </div>
//       </div>


//       {/* Updated Transactions Table */}
//       <div className="mb-8">
//         <h2 className="text-lg font-medium mb-4">Transaction History</h2>
//         <div className="overflow-x-auto rounded-lg border border-gray-200">
//           <table className="w-full">
//             <thead className="bg-tealCustom text-white">
//               <tr>
//                 <th className="py-3 px-4 text-left">Date</th>
//                 <th className="py-3 px-4 text-left">Description</th>
//                 <th className="py-3 px-4 text-left">Amount</th>
//                 <th className="py-3 px-4 text-left">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.length > 0
//                 ? transactions.map(renderTransactionRow)
//                 : (
//                   <tr>
//                     <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
//                       No transactions found
//                     </td>
//                   </tr>
//                 )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Withdrawal section remains the same */}
//       <div className="border-4 mt-20 border-tealCustom rounded-lg p-6 max-w-sm mx-auto">
//         <h2 className="text-lg font-bold text-tealCustom mb-4">My Wallet</h2>
//         <div className="mb-4">
//           <div className="text-center text-gray-600 mb-2">Available Balance</div>
//           <div className="w-32 h-32 mx-auto border-4 border-tealCustom rounded-full flex items-center justify-center mb-4">
//             <div className="text-xl font-medium">₹{stats.availableBalance}</div>
//           </div>
//         </div>
//         <input
//           type="number"
//           value={withdrawAmount}
//           onChange={(e) => setWithdrawAmount(Number(e.target.value))}
//           placeholder="Enter amount"
//           className="w-full border-2 border-tealCustom rounded-md p-2 mb-4"
//         />
//         <button
//           onClick={handleWithdraw}
//           className="w-full bg-tealCustom text-white py-2 px-4 rounded-md hover:bg-emerald-800 transition-colors"
//           disabled={stats.availableBalance <= 0 || withdrawAmount <= 0}
//         >
//           Withdraw
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaymentWallet;