import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ReviewModalProps } from '../../../types/bookingHistory';
import { Star, X } from 'lucide-react';

const ReviewModal: React.FC<ReviewModalProps> = ({ bookingId, onClose, onSubmit }) => {
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = () => {
        if (review.length < 10 || review.length > 200) {
            toast.error('Review must be between 10 and 200 characters.');
            return;
        }
        if (rating < 1) {
            toast.error('Please select a rating between 1 and 5 stars.');
            return;
        }
        onSubmit(review, rating, bookingId);
    };

    const renderStars = () => {
        return (
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                    >
                        <Star
                            size={24}
                            className={`${
                                (hoveredRating ? star <= hoveredRating : star <= rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            } transition-colors duration-200`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl text-tealCustom font-semibold">Write a Review</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                        </label>
                        {renderStars()}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with this service (10-200 characters)"
                            className="w-full p-3 border bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none h-32"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {review.length}/200 characters
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <Star size={16} />
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;