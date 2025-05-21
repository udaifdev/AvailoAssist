"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define the schema
const WorkerSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    category: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    workRadius: { type: String, required: true },
    workExperience: { type: String, required: true },
    profilePicture: { type: String, default: null },
    governmentId: { type: String, default: null },
    governmentIdNo: { type: String, required: true },
    availability: {
        days: { type: String, default: "Monday to Friday, 9:00 AM - 5:00 PM" },
        unavailableDates: { type: String, default: "" },
    },
    notifications: {
        newJobs: { type: Boolean, default: true },
        newPayments: { type: Boolean, default: true },
    },
});
// Create and export the model
const WorkerModel = mongoose_1.default.model("Worker", WorkerSchema);
exports.default = WorkerModel;
