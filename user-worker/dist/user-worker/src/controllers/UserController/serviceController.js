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
exports.getAll_services = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const service_entity_1 = require("../../../../admin/src/service/entities/service.entity");
const ServiceModel = mongoose_1.default.model('Service', service_entity_1.ServiceSchema);
const getAll_services = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('reache get all services...........');
        const services = yield ServiceModel.find().select('-__v');
        console.log('all service..... ', services);
        if (!services || services.length === 0) {
            res.status(404).json({ message: 'No services found' });
            return;
        }
        res.status(200).json(services);
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAll_services = getAll_services;
