import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ServiceSchema } from '../../../../admin/src/service/entities/service.entity'; // Import the schema

// Check if the model already exists, otherwise create it
const ServiceModel = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

export const getAll_services = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all services from the database
    const services = await ServiceModel.find().select('-__v'); // Exclude the version key
    // console.log('all service..... ', services);
    
    if (!services || services.length === 0) {
      res.status(404).json({ message: 'No services found' });
      return;
    }

    // Return the list of services
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
