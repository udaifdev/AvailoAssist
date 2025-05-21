import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import WorkerModel from '../../models/workerModel/workerCollection';
import generateToken from '../../utilits/generateToken';




export const getWorkerProfile = async (req: Request, res: Response): Promise<void> => {
  const workerId = req.params.workerId;
  try {
    // Find the worker by ID
    const worker = await WorkerModel.findById(workerId);

    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return
    }

    // Return the worker data
    res.json(worker); // Send the full worker data including availability and notifications
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// worker Update function
export const worker_update_Profile = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = req.params.workerId; // Authenticated worker's ID

    if (!workerId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const worker = await WorkerModel.findById(workerId);

    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    // Update worker details
    worker.fullName = req.body.fullName || worker.fullName;
    worker.email = req.body.email || worker.email;
    worker.mobile = req.body.mobile || worker.mobile;
    worker.category = req.body.category || worker.category;
    worker.workRadius = req.body.workRadius || worker.workRadius;
    worker.workExperience = req.body.workExperience || worker.workExperience;

    // Handle optional fields (profilePicture, governmentId, etc.)
    worker.profilePicture = req.body.profilePicture || worker.profilePicture;
    worker.governmentId = req.body.governmentId || worker.governmentId;
    worker.governmentIdNo = req.body.governmentIdNo || worker.governmentIdNo;

    // Update notifications settings if they exist in the request body
    if (req.body.notifications) {
      worker.notifications.newJobs = req.body.notifications.newJobs !== undefined
        ? req.body.notifications.newJobs
        : worker.notifications.newJobs;
      worker.notifications.newPayments = req.body.notifications.newPayments !== undefined
        ? req.body.notifications.newPayments
        : worker.notifications.newPayments;
    }

    // Save the updated worker data
    const updatedWorker = await worker.save();

    // Generate token (ensure that _id is a string)
    const workerToken = generateToken(res, worker.id.toString(), 'RoleWorker', 'jwt_worker');

    // Send back the updated worker data along with the token
    res.status(200).json({
      _id: updatedWorker._id.toString(),
      fullName: updatedWorker.fullName,
      email: updatedWorker.email,
      mobile: updatedWorker.mobile,
      profilePicture: updatedWorker.profilePicture,
      workRadius: updatedWorker.workRadius,
      category: updatedWorker.category,
      workExperience: updatedWorker.workExperience,
      notifications: updatedWorker.notifications,
      workerToken, // Provide the updated token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// =========================================================== Slot Booking =================================




interface AvailabilityUpdateRequest extends Request {
  body: {
    dates: Array<{
      date: string;
      slots: string[];
    }>;
    unavailableDates: string[];
  };
}




// Get worker availability
export const getWorkerAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = req.params.workerId;
    const worker = await WorkerModel.findById(workerId);
  
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }

    res.status(200).json({
      availability: worker.availability
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error while fetching availability' });
  }
};



// Add single date availability
export const addDateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const { date, slots } = req.body;

    const worker = await WorkerModel.findById(workerId);

    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }

    // Validate date format
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(date)) {
      res.status(400).json({ message: 'Invalid date format. Use MM/DD/YY format.' });
      return;
    }

    // Check if the date exists in the unavailable dates
    const isUnavailableDate = worker.availability.unavailableDates.includes(date);

    if (isUnavailableDate) {
      res.status(400).json({
        message: `This date is marked as unavailable. Please delete it from unavailable dates first before adding it to availability.`
      });
      return;
    }

    // Check if the date already exists in the available dates
    const dateIndex = worker.availability.dates.findIndex(d => d.date === date);

    if (dateIndex !== -1) {
      // Update existing date slots
      worker.availability.dates[dateIndex].slots = [
        ...new Set([...worker.availability.dates[dateIndex].slots, ...slots])
      ]; // Ensures no duplicate slots
    } else {
      // Add new date with slots
      worker.availability.dates.push({ date, slots });
    }

    // Sort the dates in ascending order
    worker.availability.dates.sort((a, b) => {
      const parseYearString = (year: string): number => {
        const yearNum = parseInt(year, 10);
        return yearNum >= 0 && yearNum <= 99 ? 2000 + yearNum : yearNum;
      };

      const [aMonth, aDay, aYear] = a.date.split('/');
      const [bMonth, bDay, bYear] = b.date.split('/');

      const aDate = new Date(
        parseYearString(aYear),
        parseInt(aMonth, 10) - 1,
        parseInt(aDay, 10)
      );

      const bDate = new Date(
        parseYearString(bYear),
        parseInt(bMonth, 10) - 1,
        parseInt(bDay, 10)
      );

      return aDate.getTime() - bDate.getTime();
    });

    await worker.save();

    res.status(200).json({
      message: 'Date availability added successfully',
      availability: worker.availability
    });
  } catch (error) {
    console.error('Error adding date availability:', error);
    res.status(500).json({ message: 'Server error while adding date availability' });
  }
};



// Add time slot to existing date
// Helper function to convert time to 24-hour format
// const convertTo24Hour = (time: string) => {
//   const [hour, minute] = time.split(':');
//   const ampm = time.slice(-2);
//   let hour24 = parseInt(hour, 10);

//   if (ampm === 'PM' && hour24 !== 12) {
//     hour24 += 12;
//   } else if (ampm === 'AM' && hour24 === 12) {
//     hour24 = 0;
//   }

//   return `${hour24}:${minute}`;
// };


export const addTimeSlot = async (req: Request, res: Response): Promise<void> => {
  try {
    const workerId = req.params.workerId;
    const { date, slot } = req.body;

    const worker = await WorkerModel.findById(workerId);

    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }

    const dateEntry = worker.availability.dates.find(d => d.date === date);

    if (!dateEntry) {
      res.status(404).json({ message: 'Date not found in availability' });
      return;
    }

    // Validate time slot format (HH:MM AM/PM)
    const timeFormat = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/;
    if (!slot.start || !slot.end || !timeFormat.test(slot.start) || !timeFormat.test(slot.end)) {
      res.status(400).json({
        message: 'Invalid time format. Use format like "9:00 AM" or "2:30 PM"',
      });
      return;
    }

    // Parse times for comparison
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;

      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes = minutes;
      }

      return totalMinutes;
    };

    const newStartMinutes = parseTime(slot.start);
    const newEndMinutes = parseTime(slot.end);

    // Check if end time is after start time
    if (newEndMinutes <= newStartMinutes) {
      res.status(400).json({ message: 'End time must be after start time' });
      return;
    }

    // Check for time slot overlaps
    for (const existingSlot of dateEntry.slots) {
      const [existingStart, existingEnd] = existingSlot.slot.split(' to ');
      const existingStartMinutes = parseTime(existingStart);
      const existingEndMinutes = parseTime(existingEnd);

      if (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      ) {
        res.status(400).json({ message: 'Time slot overlaps with an existing slot' });
        return;
      }
    }

    // Format the slot string
    const formattedSlot = `${slot.start} to ${slot.end}`;

    // Add the new slot
    dateEntry.slots.push({ slot: formattedSlot, booked: false });

    // Save the worker document
    await worker.save();

    res.status(200).json({
      message: 'Time slot added successfully',
      availability: worker.availability,
    });
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).json({ message: 'Server error while adding time slot' });
  }
};

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time: string): string => {
  const [hourMinute, period] = time.split(' ');
  let [hour, minute] = hourMinute.split(':').map(Number);

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};


// Controller to handle delete date request
export const deleteDate = async (req: Request, res: Response): Promise<void> => {
  const { workerId } = req.params;
  const dateToDelete = req.query.dateToDelete as string; // Use query parameter

  console.log('worker id and date to delete.... ', workerId, dateToDelete)
  try {
    const updatedAvailability = await deleteAvailabilityDate(workerId, dateToDelete);

    res.status(200).json({
      success: true,
      message: "Date deleted successfully",
      availability: updatedAvailability
    });
  } catch (error) {
    console.error('Error deleting date:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete date"
    });
  }
};


// Logic to delete the availability date from the database
export const deleteAvailabilityDate = async (workerId: string, dateToDelete: string): Promise<any> => {
  try {
    // Fetch the worker's current availability
    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      throw new Error('Worker not found');
    }

    // Remove the date from the worker's availability
    const updatedDates = worker.availability.dates.filter((d: any) => d.date !== dateToDelete);

    // Update the worker's availability
    worker.availability.dates = updatedDates;

    // Save updated worker data
    await worker.save();

    return worker.availability;
  } catch (error: any) {
    throw new Error('Failed to update availability: ' + error.message);
  }
};


export const deleteTimeSlot = async (req: Request, res: Response): Promise<void> => {
  const { workerId } = req.params;
  const { date, slot } = req.body;

  console.log('Deleting time slot...', { workerId, date, slot });

  try {
    const updatedAvailability = await deleteAvailabilitySlot(workerId, date, slot);

    res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
      availability: updatedAvailability,
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete time slot",
    });
  }
};


export const deleteAvailabilitySlot = async (workerId: string, date: string, slotObj: any): Promise<any> => {
  try {
    // Fetch the worker's current availability
    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      throw new Error('Worker not found');
    }

    // Find the date entry and remove the slot
    const dateEntry = worker.availability.dates.find((d: any) => d.date === date);
    if (!dateEntry) {
      throw new Error('Date not found');
    }

    // Remove the slot from the available slots list
    dateEntry.slots = dateEntry.slots.filter((s: any) => s.slot !== slotObj.slot);

    // Save updated worker data
    await worker.save();

    return worker.availability;
  } catch (error: any) {
    throw new Error('Failed to update availability: ' + error.message);
  }
};


 


// Worker Change Password Controller
export const worker_change_password = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const workerId = req.params.id;
    console.log('worder chage password......... ', currentPassword, newPassword, workerId)

    // 1. Validate the input
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Both current and new passwords are required' });
      return
    }

    // 2. Fetch the worker from the database
    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return
    }

    // 3. Compare current password with the stored hash
    const isMatch = await bcrypt.compare(currentPassword, worker.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return
    }

    // 4. Hash the new password
    const salt = await bcrypt.genSalt(10);  // Generate salt with rounds
    const hashedPassword = await bcrypt.hash(newPassword, salt);  // Hash new password

    // 5. Update the worker's password in the database
    worker.password = hashedPassword;
    await worker.save();

    // 6. Return success response
    res.status(200).json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};