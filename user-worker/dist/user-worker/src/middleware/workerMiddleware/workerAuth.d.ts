import WorkerModel from '../../models/workerModel/workerCollection';
declare global {
    namespace Express {
        interface Request {
            worker?: typeof WorkerModel;
        }
    }
}
