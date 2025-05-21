import React, { useState } from "react";
import { Card, CardContent } from "../../../ui/dailog";
import { Eye, EyeOff, User, Smartphone, Mail, Briefcase, MapPin, FileText, CheckCircle } from "lucide-react"; // Import icons

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode; // Add icon prop
}

interface WorkerProfileModalProps {
    workerData: any; // Accept worker data as a prop
    onClose: () => void; // Function to handle modal close
}

const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({ workerData, onClose }) => {
    const [showProfile, setShowProfile] = useState(true); // State to toggle between profile and document

    const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
        <div className="flex items-center gap-4 py-2">
            <span className="text-emerald-600 font-medium w-8 flex justify-center">{icon}</span> {/* Icon */}
            <span className="text-emerald-600 font-medium w-40">{label}</span> {/* Use a fixed width for label */}
            <span className="text-gray-700">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50 overflow-auto">
            <Card className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300">
                <CardContent className="flex flex-wrap md:flex-nowrap gap-8 p-6">
                    {/* Left side: Worker Details */}
                    <div className="flex-1">
                        <h2 className="text-2xl bg-teal-600  text-white rounded-xl font-bold mb-4 text-center">Provider Details</h2>
                        <div className="space-y-6 overflow-y-auto max-h-[500px] pr-4">
                            <InfoRow label="Name :-" value={workerData.fullName} icon={<User className="w-5 h-5" />} />
                            <InfoRow label="Mobile No :-" value={workerData.mobile} icon={<Smartphone className="w-5 h-5" />} />
                            <InfoRow label="Email :-" value={workerData.email} icon={<Mail className="w-5 h-5" />} />
                            <InfoRow label="Service :-" value={workerData.category} icon={<Briefcase className="w-5 h-5" />} />
                            <InfoRow label="ServiceStatus :-" value={workerData.serviceStatus} icon={<CheckCircle className="w-5 h-5" />} />
                            <InfoRow label="Jobs :-" value={workerData.jobs || "0"} icon={<CheckCircle className="w-5 h-5" />} />
                            <InfoRow label="Status:" value={workerData.status} icon={<CheckCircle className="w-5 h-5" />} />
                            <InfoRow label="Address:" value={workerData.streetAddress} icon={<MapPin className="w-5 h-5" />} />
                            <InfoRow
                                label="Work Experience :-"
                                value={workerData.workExperience}
                                icon={<Briefcase className="w-5 h-5" />}
                            />
                            <InfoRow
                                label="Document ID Number"
                                value={workerData.governmentIdNo}
                                icon={<FileText className="w-5 h-5" />}
                            />
                            {/* Block Worker Button */}
                            <div className="flex justify-start mb-3">
                                <button
                                    className={`px-6 py-2 text-white rounded-md transition duration-300 ${workerData.block ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"
                                        }`}
                                >
                                    {workerData.block ? "Blocked" : "Block"}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right side: Profile Picture and Document */}
                    <div className="flex flex-col justify-center items-center space-y-6">
                        <div className="flex items-center gap-4">
                            {/* Profile Picture Button */}
                            <button
                                onClick={() => setShowProfile(true)}
                                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md transition duration-300 ${showProfile ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {showProfile ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                Profile Picture
                            </button>

                            {/* Document Button */}
                            <button
                                onClick={() => setShowProfile(false)}
                                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium rounded-md transition duration-300 ${!showProfile ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {!showProfile ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                Document
                            </button>
                        </div>

                        {/* Display Profile Picture or Document */}
                        <div className="w-90 h-80 bg-gray-300 flex justify-center items-center rounded-lg overflow-hidden">
                            {showProfile ? (
                                <img
                                    src={workerData.profilePicture || "/default-profile.jpg"} // Default profile picture
                                    alt="Profile"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <img
                                    src={workerData.governmentId || "/default-document.jpg"} // Default document image
                                    alt="Document"
                                    className="object-cover w-full h-full"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>



                {/* Modal Footer */}
                <div className="flex justify-end p-4 bg-gray-100">
                    <button
                        className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-300"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default WorkerProfileModal;
