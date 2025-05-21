export interface Review {
    _id: string;
    userId: {
        _id: string;
        name: string;
        image?: string;
    };
    workerId: string;
    rating: number;
    review: string;
    createdAt: string;
}

export interface Tasker {
    id: string;
    fullName: string;
    category: string;
    workExperience: string;
    profilePicture: string | null;
    ratePerHour: number;
    totalTasks: number;
    availableDates: string[];
    city: string;
    streetAddress: string;
    reviews?: Review[];
    averageRating?: number;
}