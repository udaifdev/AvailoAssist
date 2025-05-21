import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Trash2, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { TimeSlot, AvailabilityProps, Availability } from '../../../types/availability';



const AvailabilitySection: React.FC<AvailabilityProps> = ({ availability, setAvailability, token, axiosInstance, editMode }) => {

  const [isEditingSlots, setIsEditingSlots] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);



  //  ================================ Fixed slot ==============================================

  const [isEditingFixedSlots, setIsEditingFixedSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [fixedStartTime, setFixedStartTime] = useState('');
  const [fixedEndTime, setFixedEndTime] = useState('');

  const handleSaveFixedSlot = async () => {
    if (!fixedStartTime || !fixedEndTime) {
      toast.error("Please select both start and end times");
      return;
    }

    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      const timeSlots = createTimeSlots(fixedStartTime, fixedEndTime);

      if (timeSlots.length === 0) {
        toast.error("Invalid time slot duration");
        return;
      }

      const response = await axiosInstance.post(`/worker/fixed-slot/${workerId}`, {
        dayOfWeek: selectedDay,
        slots: timeSlots.map(slot => ({
          slot: `${slot.start} to ${slot.end}`,
          enabled: true
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();
      setIsEditingFixedSlots(false);
      setFixedStartTime('');
      setFixedEndTime('');
      toast.success(response.data.message || "Fixed slots added successfully!");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.conflictingSlots) {
        toast.error("Conflicting time slots detected. Please adjust your times.");
      } else {
        toast.error("Failed to add fixed slots");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFixedSlot = async (dayOfWeek: string, slot: string) => {
    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      await axiosInstance.delete(`/worker/fixed-slot/${workerId}`, {
        data: { dayOfWeek, slot },
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();
      toast.success("Fixed slot deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete fixed slot");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add this section before the return statement in your existing component
  const renderFixedSlots = () => (
    <div className="mb-6 mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-teal-700">Fixed Weekly Slots</h3>
        {editMode && !isEditingFixedSlots && (
          <button onClick={() => setIsEditingFixedSlots(true)}
            className="flex items-center gap-1 bg-teal-600 text-white px-2 py-1.5 rounded-md hover:bg-teal-700 text-xs"
          >
            <Settings size={16} className='w-4 h-4' />
            Set Fixed Slots
          </button>
        )}
      </div>

      {isEditingFixedSlots && editMode && (
        <div className="space-y-4">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={fixedStartTime}
                onChange={(e) => setFixedStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={fixedEndTime}
                onChange={(e) => setFixedEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveFixedSlot}
              disabled={isUpdating}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm"
            >
              Save Fixed Slot
            </button>
            <button
              onClick={() => setIsEditingFixedSlots(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {availability.fixedSlots?.map((daySlot) => (
        <div key={daySlot.dayOfWeek} className="mt-4">
          <h4 className="font-medium text-gray-700 capitalize mb-2">{daySlot.dayOfWeek}</h4>
          <div className="space-y-2">
            {daySlot.slots.map((slot, index) => (
              <div key={index} className="flex justify-between items-center bg-blue-100 px-3 py-1.5 rounded-md">
                <span className="font-medium text-gray-700">{slot.slot}</span>
                {editMode && (
                  <button
                    onClick={() => handleDeleteFixedSlot(daySlot.dayOfWeek, slot.slot)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  // ================================================================================================================


  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      const response = await axiosInstance.get(`/worker/availability/${workerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('response availablility....... ', response.data)
      setAvailability(response.data.availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch availability.');
    }
  };

  // Helper function to convert backend slot format to display format
  const formatSlotTime = (slotString: string) => {
    if (!slotString) return { start: '', end: '' };

    const [start, end] = slotString.split(' to ');

    // Ensure start and end times exist and are valid
    if (!start || !end || !/^\d{1,2}:\d{2} [AP]M$/.test(start) || !/^\d{1,2}:\d{2} [AP]M$/.test(end)) {
      console.error('Invalid slot format:', slotString);
      return { start: 'Invalid', end: 'Invalid' };
    }

    return { start, end };
  };


  const handleAddDate = async () => {
    if (!newDate) {
      toast.error("Please select a date");
      return;
    }
    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      const formattedDate = new Date(newDate).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });

      // const updatedDates = [...availability.dates, { date: formattedDate, slots: [] }];

      await axiosInstance.post(`/worker/availability/date/${workerId}`, {
        date: formattedDate,
        slots: []
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();
      setIsAddingDate(false);
      setNewDate('');
      toast.success("Date added successfully!");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add date.");
      }
    } finally {
      setIsUpdating(false);
    }
  };


  const handleDeleteDate = async (dateToDelete: string) => {
    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      await axiosInstance.delete(`/worker/availability/${workerId}?dateToDelete=${encodeURIComponent(dateToDelete)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();
      toast.success("Date deleted successfully!");
    } catch (error) {
      console.error('Error deleting date:', error);
      toast.error("Failed to delete date.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSlots = (date: string) => {
    setEditingDate(date);
    setIsEditingSlots(true);
    setStartTime('');
    setEndTime('');
  };

  const MIN_DURATION_MS = 90 * 60 * 1000; // 1.5 hours in milliseconds
  const MAX_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  const createTimeSlots = (startTime: string, endTime: string): { start: string; end: string }[] => {
    // Convert times to Date objects for easier manipulation
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);

    // If end time is before start time, assume it's the next day
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const totalDuration = end.getTime() - start.getTime();
    const slots: { start: string; end: string }[] = [];
    let currentStart = new Date(start);

    while (currentStart < end) {
      let slotEnd = new Date(currentStart);
      slotEnd.setHours(slotEnd.getHours() + 3);

      // If the calculated end time exceeds the desired end time
      if (slotEnd > end) {
        const remainingDuration = end.getTime() - currentStart.getTime();

        // Skip this slot if remaining duration is less than 1.5 hours
        if (remainingDuration < MIN_DURATION_MS) {
          break;
        }

        slotEnd = new Date(end);
      }

      // Format times to 12-hour format
      const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${period}`;
      };

      slots.push({
        start: formatTime(currentStart),
        end: formatTime(slotEnd)
      });

      currentStart = new Date(slotEnd);
    }

    return slots;
  };

  const handleSaveSlots = async () => {
    if (!startTime || !endTime) {
      toast.error("Please select both start and end times");
      return;
    }

    // Calculate duration between start and end time
    const start = new Date(`2000/01/01 ${startTime}`);
    const end = new Date(`2000/01/01 ${endTime}`);
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const duration = end.getTime() - start.getTime();

    // Validate minimum duration
    if (duration < MIN_DURATION_MS) {
      toast.error("Time slot must be at least 1.5 hours long");
      return;
    }

    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      // Get all time slots based on start and end time
      const timeSlots = createTimeSlots(startTime, endTime);

      if (timeSlots.length === 0) {
        toast.error("Invalid time slot duration. Please ensure slots are between 1.5 and 3 hours.");
        return;
      }

      // Create all slots sequentially
      for (const timeSlot of timeSlots) {
        await axiosInstance.post(`/worker/availability/slot/${workerId}`, {
          date: editingDate,
          slot: {
            start: timeSlot.start,
            end: timeSlot.end
          }
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchAvailability();
      setIsEditingSlots(false);
      setEditingDate(null);
      setStartTime('');
      setEndTime('');
      toast.success(`${timeSlots.length} time slot(s) added successfully!`);
    } catch (error: any) {
      toast.error("Failed to add time slots");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSlot = async (date: string, slotToDelete: TimeSlot) => {
    try {
      setIsUpdating(true);
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const workerId = decodedToken.userId;

      await axiosInstance.delete(`/worker/availability/slot/${workerId}`, {
        data: { date, slot: slotToDelete },
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAvailability();
      toast.success("Time slot deleted successfully!");
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error("Failed to delete time slot.");
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <div className="space-y-4">
      {renderFixedSlots()}
      <div className="flex justify-end items-center">
        {!isAddingDate && editMode && (
          <button
            onClick={() => setIsAddingDate(true)}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 text-sm disabled:opacity-50"
          >
            <Plus size={16} />
            Add Date
          </button>
        )}
      </div>

      {isAddingDate && editMode && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-600 mb-2 font-medium">Add New Available Date</h3>

          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Today's date
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 7 days from today
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />

          <div className="flex gap-2">
            <button
              onClick={handleAddDate}
              disabled={isUpdating}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 text-xs disabled:opacity-50"
            >
              Add Date
            </button>
            <button
              onClick={() => setIsAddingDate(false)}
              disabled={isUpdating}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-xs disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {availability.dates.length === 0 && !isAddingDate ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No availability dates set <br /><span className='text-red-500'>update your profile</span></p>
          {editMode && (
            <button
              onClick={() => setIsAddingDate(true)}
              disabled={isUpdating}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} />
              Add Your First Date
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {availability.dates.map((entry) => (
            <div key={entry.date} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-gray-700">{entry.date}</p>
                {editMode && (
                  <button
                    onClick={() => handleDeleteDate(entry.date)}
                    disabled={isUpdating}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-2 mb-3">
                {entry.slots.length > 0 ? (
                  entry.slots.map((slot) => {
                    const { start, end } = formatSlotTime(slot.slot);
                    return (
                      <div key={slot._id} className="flex justify-between items-center bg-green-100 px-3 py-1.5 rounded-md">
                        <span className="font-medium text-gray-700">
                          {start} - {end}
                        </span>
                        {editMode && !slot.booked && (
                          <button
                            onClick={() => handleDeleteSlot(entry.date, slot)}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-md">
                    No time slots added
                  </p>
                )}
              </div>


              {editMode && (!isEditingSlots || editingDate !== entry.date) && (
                <button
                  onClick={() => handleEditSlots(entry.date)}
                  disabled={isUpdating}
                  className="flex items-center gap-1 bg-teal-600 text-white px-2 py-1.5 rounded-md hover:bg-teal-700 text-xs disabled:opacity-50"
                >
                  <Clock size={16} className='w-4 h-4' />
                  Add Slot
                </button>
              )}

              {editMode && isEditingSlots && editingDate === entry.date && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSlots}
                      disabled={isUpdating}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm disabled:opacity-50"
                    >
                      Save Time Slot
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingSlots(false);
                        setEditingDate(null);
                        setStartTime('');
                        setEndTime('');
                      }}
                      disabled={isUpdating}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>


  );
};

export default AvailabilitySection;