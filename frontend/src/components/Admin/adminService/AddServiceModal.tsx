import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminAxios } from '../../../API/axios';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormData {
  categoryName: string;
  categoryDescription: string;
  categoryPicture: File | null;
  amount: string;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<FormData>();
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Spinner state

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setValue('categoryPicture', file);
    setFileName(file ? file.name : null);
  };

  // Submit form
  const onSubmitForm = async (formData: FormData) => {
    if (!formData.categoryPicture) {
      toast.error("Please upload a category picture.");
      return;
    }

    setLoading(true); // Show spinner
    const data = new FormData();
    data.append('categoryName', formData.categoryName);
    data.append('categoryDescription', formData.categoryDescription);
    data.append('amount', formData.amount);

    if (formData.categoryPicture) {
      data.append('picture', formData.categoryPicture);
    }

    try {
      const response = await adminAxios.post('/admin/add-service', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('API Response: ', response);
      if (response.status === 201) {
        console.log('Displaying success toast');
        toast.success("Service added successfully!");
        reset(); // Clear the form fields
        setFileName(null); // Clear the file name display
        onSubmit(formData); // Notify parent component
      }
    } catch (error:any) {
      console.error(error);

      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message === 'categoryName already exists') {
          toast.error("The category name already exists. Please choose a different name.");
        } else {
          toast.error("Error adding service. Please try again.");
        }
      } else {
        toast.error("Error adding service. Please try again.");
      }
      
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer />
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-teal-700 text-center mb-6">
          Add New Service
        </h2>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-teal-700 font-medium block">
              Category Name
            </label>
            <input
              type="text"
              {...register('categoryName', { required: "Category name is required" })}
              className="w-full border-2 border-teal-700 rounded-md p-2"
            />
            {errors.categoryName && (
              <span className="text-red-500 text-sm">{errors.categoryName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-teal-700 font-medium block">
              Category Description
            </label>
            <textarea
              {...register('categoryDescription', {
                required: "Category description is required",
                minLength: { value: 30, message: "Description must be at least 30 characters long." }
              })}
              className="w-full border-2 border-teal-700 rounded-md p-2 min-h-[120px]"
            />
            {errors.categoryDescription && (
              <span className="text-red-500 text-sm">{errors.categoryDescription.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-teal-700 font-medium block">
              Category Picture
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border-2 border-teal-700 rounded-md p-2 pl-10"
                accept="image/*"
              />
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-700" size={20} />
            </div>
            {fileName && <span className="text-teal-700 text-sm">{fileName}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-teal-700 font-medium block">
              Amount
            </label>
            <input
              type="text"
              {...register('amount', {
                required: "Amount is required",
                pattern: {
                  value: /^[0-9]*$/,
                  message: "Amount must be a valid number without special characters or spaces"
                }
              })}
              className="w-full border-2 border-teal-700 rounded-md p-2"
            />
            {errors.amount && (
              <span className="text-red-500 text-sm">{errors.amount.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded-md hover:bg-teal-800 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full text-white mr-2"></div>
            ) : null}
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
