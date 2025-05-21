import React, { useState } from 'react';
import { toast } from "react-toastify";
import { adminAxios } from '../../../API/axios';

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: {
        _id: string;
        categoryName: string;
        amount: number;
        status: string;
        picture: string;
    };
    onUpdate: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({ isOpen, onClose, service, onUpdate }) => {
    const [formData, setFormData] = useState({
        categoryName: service.categoryName,
        amount: service.amount,
        status: service.status
    });
    const [picture, setPicture] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPicture(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('categoryName', formData.categoryName);
            formDataToSend.append('amount', formData.amount.toString());
            formDataToSend.append('status', formData.status);
            if (picture) {
                formDataToSend.append('picture', picture);
            }

            const response = await adminAxios.put(`/admin/updateService/${service._id}`, formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

            console.log('response data........... ', response.data)

            if (response.status === 200) {
                toast.success('Service updated successfully');
                onUpdate();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-3xl font-semibold text-teal-700 mt-2 mb-8 text-center">Update Service</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                            <input
                                type="text"
                                name="categoryName"
                                value={formData.categoryName}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Update Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Service'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditServiceModal;