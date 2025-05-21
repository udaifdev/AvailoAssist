import { Request, Response } from 'express';
import mongoose from 'mongoose';
// import userModel from '../../models/userModel/userCollection';
import { ServiceSchema } from '../../../../admin/src/service/entities/service.entity'; // Import the schema

// Check if the model already exists, otherwise create it
const ServiceModel = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const getUserHome = async (req: Request, res: Response) => {
  try {
    // console.log('reached home...........');
    // Fetch only 6 services from the database
    const services = await ServiceModel.find().limit(6).select('-__v'); // Limit to 6 services and exclude the version key
    // console.log('latest services: ', services);

    if (!services || services.length === 0) {
      res.status(404).json({ message: 'No services found' });
      return;
    }

    // Return the list of services
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching home controller: ---> ', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Search services Home controller
export const searchServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return
    }

    console.log('Search query:..........', query); // Debug search query

    const allServices = await ServiceModel.find();
    console.log('All services.......', allServices);

    const searchConditions = {
      $and: [
        { status: 'Active' },
        { $or: [{ categoryName: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }] },
      ],
    };

    const services = await ServiceModel.find(searchConditions).select('_id categoryName categoryDescription amount picture').limit(10);

    console.log('Search results:...........', services);

    res.status(200).json(services);
  } catch (error) {
    console.error('Error in searchServices:', error);
    res.status(500).json({
      message: 'Error searching services',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};






export { getUserHome };
