import { Request, Response } from 'express';
import WorkerModel from '../../models/workerModel/workerCollection';
import mongoose from 'mongoose';



// Add fixed slots for a specific day
export const addFixedSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const workerId = req.params.workerId;
        const { dayOfWeek, slots } = req.body;

        // Validate input   
        if (!dayOfWeek || !slots || !Array.isArray(slots)) {
            res.status(400).json({ success: false, message: "Invalid input. Day of week and slots array are required." });
            return
        }

        // Validate day of week
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(dayOfWeek.toLowerCase())) {
            res.status(400).json({ success: false, message: "Invalid day of week." });
            return
        }

        const worker = await WorkerModel.findById(workerId);
        if (!worker) {
            res.status(404).json({ success: false, message: "Worker not found" });
            return
        }

        // Initialize fixedSlots if it doesn't exist
        if (!worker.availability.fixedSlots) {
            worker.availability.fixedSlots = [];
        }

        // Find existing day slots
        const existingDay = worker.availability.fixedSlots.find(
            day => day.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
        );

        // Check for time conflicts
        const hasConflict = (newSlot: { start: string; end: string }) => {
            const newStart = new Date(`1970-01-01T${newSlot.start}:00`);
            const newEnd = new Date(`1970-01-01T${newSlot.end}:00`);

            if (existingDay) {
                for (const existingSlot of existingDay.slots) {
                    const existingStart = new Date(`1970-01-01T${existingSlot.slot.split(' to ')[0]}:00`);
                    const existingEnd = new Date(`1970-01-01T${existingSlot.slot.split(' to ')[1]}:00`);

                    if (
                        (newStart >= existingStart && newStart < existingEnd) || // New start time overlaps existing slot
                        (newEnd > existingStart && newEnd <= existingEnd) || // New end time overlaps existing slot
                        (newStart <= existingStart && newEnd >= existingEnd) // New slot fully overlaps existing slot
                    ) {
                        return true;
                    }
                }
            }

            return false;
        };

        const conflictingSlots = slots.filter(slot => hasConflict({
            start: slot.slot.split(' to ')[0],
            end: slot.slot.split(' to ')[1]
        }));

        if (conflictingSlots.length > 0) {
            res.status(400).json({
                success: false,
                message: "Conflicting time slots detected.",
                conflictingSlots: conflictingSlots
            });
            return;
        }

        // Add new slots to the worker's availability
        if (existingDay) {
            existingDay.slots.push(...slots);
        } else {
            worker.availability.fixedSlots.push({
                dayOfWeek: dayOfWeek.toLowerCase(),
                slots: slots
            });
        }

        await worker.save();

        res.status(200).json({ success: true, message: "Fixed slots added successfully", availability: worker.availability });

    } catch (error) {
        console.error('Error in addFixedSlots:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete a fixed slot
export const deleteFixedSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const workerId = req.params.workerId;
        const { dayOfWeek, slot } = req.body;

        if (!dayOfWeek || !slot) {
            res.status(400).json({
                success: false,
                message: "Day of week and slot are required"
            });
            return
        }

        const worker = await WorkerModel.findById(workerId);
        if (!worker) {
            res.status(404).json({
                success: false,
                message: "Worker not found"
            });
            return
        }

        // Find the day
        const dayIndex = worker.availability.fixedSlots?.findIndex(
            day => day.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
        );

        if (dayIndex === -1 || dayIndex === undefined) {
            res.status(404).json({
                success: false,
                message: "Day not found in fixed slots"
            });
            return
        }

        // Remove the specified slot
        worker.availability.fixedSlots[dayIndex].slots =
            worker.availability.fixedSlots[dayIndex].slots.filter(
                s => s.slot !== slot
            );

        // If no slots remain for that day, remove the entire day
        if (worker.availability.fixedSlots[dayIndex].slots.length === 0) {
            worker.availability.fixedSlots.splice(dayIndex, 1);
        }

        await worker.save();

        res.status(200).json({
            success: true,
            message: "Fixed slot deleted successfully",
            availability: worker.availability
        });

    } catch (error) {
        console.error('Error in deleteFixedSlot:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get all fixed slots for a worker
export const getFixedSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const workerId = req.params.workerId;

        const worker = await WorkerModel.findById(workerId);
        if (!worker) {
            res.status(404).json({
                success: false,
                message: "Worker not found"
            });
            return
        }

        res.status(200).json({
            success: true,
            fixedSlots: worker.availability.fixedSlots || []
        });

    } catch (error) {
        console.error('Error in getFixedSlots:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};