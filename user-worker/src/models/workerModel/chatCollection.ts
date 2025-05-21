import mongoose from 'mongoose';

// Define the Reaction schema
const ReactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Update the Message schema to include reactions
const MessageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function (this: any) {
      return this.get('type') === 'text';
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['text', 'media'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: function (this: any) {
      return this.get('type') === 'media';
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  reactions: [ReactionSchema] // Add the reactions array field
}, { timestamps: true });

// Create interfaces for TypeScript support
export interface IReaction {
  emoji: string;
  senderId: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IMessage extends mongoose.Document {
  bookingId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  isRead: boolean;
  type: 'text' | 'media';
  mediaUrl?: string;
  timestamp: Date;
  reactions: IReaction[];
}

export default mongoose.model<IMessage>('Message', MessageSchema);