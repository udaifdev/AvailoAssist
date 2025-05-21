import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../../API/axios';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setWorkerDetails } from '../../../slice/bookingSlice';
import { TaskDateModalProps, SlotItem, DateItem, Worker } from '../../../types/taskModal'



const TaskDateModal: React.FC<TaskDateModalProps> = ({ isOpen, onClose, workerId }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentMonthDates, setCurrentMonthDates] = useState<Date[]>([]);

  const dispatch = useDispatch();

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Calculate the end date (7 days from now)
  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() + 7);

  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    axiosInstance.get(`/user/selectedTasker/${workerId}`)
      .then((response) => {
        const { _id, fullName, profilePicture, category, availability } = response.data;
         // Filter out past dates and limit to 7 days
         const filteredDates = availability.dates.filter((date: DateItem) => {
          const dateObj = new Date(date.date);
          dateObj.setHours(0, 0, 0, 0);
          return dateObj >= currentDate && dateObj <= endDate;
        });
        setWorker({ workerId: _id, fullName, profilePicture, category, availability: { ...availability, dates: filteredDates } });
      }).catch((error) => {
        console.error('Error fetching worker data...........:', error);
      }).finally(() => {
        setLoading(false);
      });
  }, [workerId]);

  // Generate dates for the next 7 days
  useEffect(() => {
    const dates: Date[] = [];
    let currentDateCopy = new Date(currentDate);

    while (currentDateCopy <= endDate) {
      dates.push(new Date(currentDateCopy));
      currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    setCurrentMonthDates(dates);
  }, []);

  // Get initial empty cells for the calendar grid
  const getInitialEmptyCells = () => {
    if (currentMonthDates.length === 0) return 0;
    return currentMonthDates[0].getDay();
  };

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

   // Filter out past time slots for current date
   const filterPastTimeSlots = (slots: SlotItem[], date: Date): SlotItem[] => {
    if (date.toDateString() !== currentDate.toDateString()) {
      return slots;
    }

    const now = new Date();
    return slots.filter(slot => {
      const [startTime] = slot.slot.split(' to ')[0].split(' ');
      const [hours, minutes] = startTime.split(':');
      const slotTime = new Date(date);
      slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return slotTime > now;
    });
  };

  const getFixedSlotsForDay = (date: Date): SlotItem[] => {
    if (!worker?.availability.fixedSlots) return [];
    const dayName = getDayName(date);
    const fixedSlotData = worker.availability.fixedSlots.find(
      slot => slot.dayOfWeek.toLowerCase() === dayName
    );
    const slots = fixedSlotData?.slots
      .filter(slot => slot.enabled)
      .map(slot => ({
        slot: slot.slot,
        booked: false,
        _id: `fixed-${slot.slot}`
      })) || [];
    
    return filterPastTimeSlots(slots, date);
  };
  
  // Get time slots for a selected date (combining specific date slots and fixed slots)
  const getTimeSlotsForDate = (date: Date): SlotItem[] => {
    if (!worker?.availability) return [];

    // Get specific date slots
    const dateData = worker.availability.dates.find(d =>
      new Date(d.date).toDateString() === date.toDateString()
    );
    const specificDateSlots = dateData?.slots || [];

    // Get fixed slots for the day
    const fixedSlots = getFixedSlotsForDay(date);

    // Combine all slots
    const allSlots = [...specificDateSlots, ...fixedSlots];

    // Filter past slots for current date
    const filteredSlots = filterPastTimeSlots(allSlots, date);

    // Remove duplicates and sort
    const uniqueSlots = Array.from(
      new Map(filteredSlots.map(slot => [slot.slot, slot])).values()
    ).sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.slot.split(' to ')[0]}`);
      const timeB = new Date(`1970/01/01 ${b.slot.split(' to ')[0]}`);
      return timeA.getTime() - timeB.getTime();
    });

    return uniqueSlots;
  };

  const isDateAvailable = (date: Date) => {
    if (!worker?.availability) return false;

    // Check if date is within the 7-day range
    if (date < currentDate || date > endDate) return false;

    // Check specific date availability
    const hasSpecificSlots = worker.availability.dates.some(availableDate =>
      new Date(availableDate.date).toDateString() === date.toDateString()
    );

    // Check fixed slots availability
    const hasFixedSlots = getFixedSlotsForDay(date).length > 0;

    return hasSpecificSlots || hasFixedSlots;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isOpen || !worker) return null;


  const calculateSlotDuration = (slot: string): string => {
    const [start, end] = slot.split(' to ').map((time) => new Date(`1970-01-01T${time.replace(/(AM|PM)/, '')}`));
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
  };

  const handleContinue = () => {
    if (worker && selectedDate && selectedTime) {
      const duration = calculateSlotDuration(selectedTime);
      const selectedDateObj = worker.availability.dates.find(
        (date) => new Date(date.date).toISOString() === selectedDate
      );

      let slotId: string;
      if (selectedDateObj) {
        const specificSlot = selectedDateObj.slots.find(slot => slot.slot === selectedTime);
        if (specificSlot) {
          slotId = specificSlot._id;
        } else {
          slotId = `fixed-${selectedTime}`;
        }
      } else {
        slotId = `fixed-${selectedTime}`;
      }

      if (!slotId) {
        // Handle fixed slot case
        const dayName = getDayName(new Date(selectedDate));
        const fixedSlotDay = worker.availability.fixedSlots.find(
          slot => slot.dayOfWeek.toLowerCase() === dayName
        );
        if (fixedSlotDay) {
          slotId = `fixed-${selectedTime}`;
        }
      }

      dispatch(
        setWorkerDetails({
          workerId: worker.workerId,
          name: worker.fullName,
          profilePicture: worker.profilePicture,
          category: worker.category,
          date: new Date(selectedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          timeSlot: selectedTime,
          slotId,
          duration,
        })
      );
    }
  };



  // Check if a date is available (either has specific slots or fixed slots)
  // const isDateAvailable = (date: Date) => {
  //   if (!worker?.availability) return false;

  //   // Check specific date availability
  //   const hasSpecificSlots = worker.availability.dates.some(availableDate =>
  //     new Date(availableDate.date).toDateString() === date.toDateString()
  //   );

  //   // Check fixed slots availability
  //   const hasFixedSlots = getFixedSlotsForDay(date).length > 0;

  //   return hasSpecificSlots || hasFixedSlots
  // };


  // Get time slots for a selected date (combining specific date slots and fixed slots)
  // const getTimeSlotsForDate = (date: Date): SlotItem[] => {
  //   if (!worker?.availability) return [];

  //   // Get specific date slots
  //   const dateData = worker.availability.dates.find(d =>
  //     new Date(d.date).toDateString() === date.toDateString()
  //   );
  //   const specificDateSlots = dateData?.slots || [];

  //   // Get fixed slots for the day
  //   const fixedSlots = getFixedSlotsForDay(date);

  //   // Combine all slots
  //   const allSlots = [...specificDateSlots, ...fixedSlots];

  //   // Remove duplicates by slot time and sort
  //   const uniqueSlots = Array.from(
  //     new Map(allSlots.map(slot => [slot.slot, slot])).values()
  //   ).sort((a, b) => {
  //     const timeA = new Date(`1970/01/01 ${a.slot.split(' to ')[0]}`);
  //     const timeB = new Date(`1970/01/01 ${b.slot.split(' to ')[0]}`);
  //     return timeA.getTime() - timeB.getTime();
  //   });

  //   return uniqueSlots;
  // };


  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date.toISOString());
      setSelectedTime(null);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6">
        <div className="relative">
          <button onClick={onClose} className="absolute right-0 top-0">
            <X className="w-6 h-6 text-gray-500" />
          </button>

          <h2 className="text-2xl font-semibold mb-6">Choose your task date and start time:</h2>

          <div className="flex gap-8">
            <div className="flex-1">
              {/* Profile Section */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-22 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {worker.profilePicture ? (
                    <img src={worker.profilePicture} alt={worker.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                      {worker.fullName[0]}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold">{worker.fullName}'s Availability</h3>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells */}
                {Array.from({ length: getInitialEmptyCells() }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-2" />
                ))}

                {/* Date cells */}
                {currentMonthDates.map((date, idx) => {
                  const isAvailable = isDateAvailable(date);
                  const isSelected = selectedDate === date.toISOString();

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(date)}
                      disabled={!isAvailable}
                      className={`
                     rounded-lg text-center transition-colors
                    ${isSelected
                          ? 'bg-tealCustom text-white font-bold'
                          : isAvailable
                            ? 'text-gray-800 hover:bg-emerald-50 font-bold'
                            : 'text-gray-400 cursor-not-allowed'
                        }
                  `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>


              {/* Time Slots */}
              {selectedDate && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-3">Available Time Slots:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getTimeSlotsForDate(new Date(selectedDate)).map((slotObj, index) => (
                      <button
                        key={index}
                        onClick={() => !slotObj.booked && setSelectedTime(slotObj.slot)}
                        disabled={slotObj.booked}
                        className={`p-3 rounded-lg text-sm transition-colors ${slotObj.booked
                          ? 'bg-red-100 text-gray-400 cursor-not-allowed' : selectedTime === slotObj.slot
                            ? 'bg-tealCustom text-white' : 'bg-gray-100 hover:bg-emerald-50 text-gray-700'
                          } `} >
                        {slotObj.slot}
                        {slotObj.booked && <span className="block text-teal-600  text-xs mt-1">(Booked)</span>}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    You can chat to adjust task details or change start time after confirming.
                  </p>
                </div>
              )}
            </div>


            {/* Right Side Panel */}
            <div className="w-64">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Request for:</h4>
                {selectedDate && selectedTime ? (
                  <p className="text-tealCustom font-bold">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}, {selectedTime}
                  </p>
                ) : (
                  <p className="text-gray-500">Select a date and time</p>
                )}
              </div>
              <Link to={'/bookingConfirm'}>
                <button
                  onClick={handleContinue}
                  className={`w-full py-3 px-4 rounded-lg mb-4 ${selectedDate && selectedTime
                    ? 'bg-tealCustom text-white hover:bg-emerald-700'
                    : 'bg-tealCustom text-gray-200 cursor-not-allowed'
                    }`}
                  disabled={!selectedDate || !selectedTime}
                >
                  Select & Continue
                </button>
              </Link>

              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Next, confirm your details to get connected with your Tasker.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDateModal;