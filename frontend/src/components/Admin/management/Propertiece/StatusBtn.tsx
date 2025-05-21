import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { adminAxios } from '../../../../API/axios';

interface StatusBtnProps {
  worker: {
    _id: string;
    serviceStatus: string;
  };
  onDecisionChange: (id: string, decision: string) => void;
}

const StatusBtn: React.FC<StatusBtnProps> = ({ worker, onDecisionChange }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(worker.serviceStatus || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDecision = async (decision: string) => {
    try {
      setIsUpdating(true);
      const response = await adminAxios.patch(`/admin/updateServiceStatus/${worker._id}`, { 
        status: decision 
      });
      
      if (response.data) {
        setCurrentStatus(decision);
        onDecisionChange(worker._id, decision);
        setShowOptions(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Status button styles based on current status
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    Accepted: "bg-tealCustom text-white",
    Rejected: "bg-red-500 text-white"
  };

  // Render different button states
  const renderButton = () => {
    // If status is pending, show dropdown
    if (currentStatus === 'pending') {
      return (
        <div className="relative">
          <button
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${statusStyles.pending}`}
            onClick={() => setShowOptions(!showOptions)}
          >
            <span>Pending</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showOptions && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <button
                disabled={isUpdating}
                className="w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 transition-colors rounded-t-md"
                onClick={() => handleDecision('Accepted')}
              >
                Accept
              </button>
              <button
                disabled={isUpdating}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors rounded-b-md"
                onClick={() => handleDecision('Rejected')}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      );
    }

    // If status is Accepted, show static green button
    if (currentStatus === 'Accepted') {
      return (
        <button
          disabled
          className={`px-4 py-2 rounded-md ${statusStyles.Accepted}`}
        >
          Accepted
        </button>
      );
    }

    // If status is Rejected, show static red button
    if (currentStatus === 'Rejected') {
      return (
        <button
          disabled
          className={`px-4 py-2 rounded-md ${statusStyles.Rejected}`}
        >
          Rejected
        </button>
      );
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {renderButton()}
    </div>
  );
};

export default StatusBtn;