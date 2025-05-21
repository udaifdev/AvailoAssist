"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker_update_Profile = exports.getWorkerProfile = void 0;
const workerCollection_1 = __importDefault(require("../../models/workerModel/workerCollection"));
const generateToken_1 = __importDefault(require("../../utilits/generateToken"));
const getWorkerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workerId = req.params.workerId; // Get worker ID from request params
    // console.log('worker Id ---> ', workerId)
    try {
        // Find the worker by ID
        const worker = yield workerCollection_1.default.findById(workerId);
        // console.log('worker collections ---> ', worker)
        if (!worker) {
            res.status(404).json({ message: 'Worker not found' });
            return;
        }
        // Return the worker data
        res.json(worker); // Send the full worker data including availability and notifications
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getWorkerProfile = getWorkerProfile;
// worker Update function
const worker_update_Profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workerId = req.params.workerId; // Authenticated worker's ID
        if (!workerId) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
        }
        const worker = yield workerCollection_1.default.findById(workerId);
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
        const updatedWorker = yield worker.save();
        // Generate token (ensure that _id is a string)
        const token = (0, generateToken_1.default)(res, updatedWorker._id.toString(), 'RoleWorker');
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
            token, // Provide the updated token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.worker_update_Profile = worker_update_Profile;
