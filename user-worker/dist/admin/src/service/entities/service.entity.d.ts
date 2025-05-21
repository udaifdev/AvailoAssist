import { Document } from 'mongoose';
export declare class Service extends Document {
    categoryName: string;
    categoryDescription: string;
    amount: number;
    picture: string;
    status: string;
}
export declare const ServiceSchema: import("mongoose").Schema<Service, import("mongoose").Model<Service, any, any, any, Document<unknown, any, Service> & Service & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, Document<unknown, {}, import("mongoose").FlatRecord<Service>> & import("mongoose").FlatRecord<Service> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
