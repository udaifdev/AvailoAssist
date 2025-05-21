import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Message from '../../models/workerModel/chatCollection'; // Create this model
import Booking from '../../models/workerModel/bookingCollection'; // Existing booking model
// import { CustomRequest } from '../../types/express';

interface ReactionData {
    messageId: string;
    emoji: string;
    senderId: string;
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if this is a reaction or a regular message
        const isReaction = req.body.messageId && req.body.emoji;

        if (isReaction) {
            // Handle reaction
            const { messageId, emoji } = req.body as ReactionData;
            console.log('emoji............', emoji)

            const senderId = new mongoose.Types.ObjectId(req.body.senderId); // Convert to ObjectId

            // Find the existing message
            const message = await Message.findById(messageId);
            if (!message) {
                res.status(404).json({ error: 'Message not found' });
                return;
            }

            // Check if user has already reacted with this emoji
            const existingReactionIndex = message.reactions?.findIndex(
                reaction => reaction.senderId === senderId && reaction.emoji === emoji
            );

            if (existingReactionIndex !== undefined && existingReactionIndex >= 0) {
                // Remove the reaction if it already exists
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Add the new reaction
                if (!message.reactions) {
                    message.reactions = [];
                }
                message.reactions.push({
                    emoji,
                    senderId,
                    timestamp: new Date()
                });
            }

            // Save the updated message
            await message.save();

            // Return the updated message
            res.status(200).json({
                message: message.toObject(),
                reactions: message.reactions
            });

        } else {
            // Handle regular message
            const { bookingId, content, senderId } = req.body;

            const booking = await Booking.findById(bookingId);
            if (!booking) {
                res.status(404).json({ error: 'Booking not found' });
                return;
            }

            if (!senderId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const message = new Message({
                bookingId,
                sender: senderId,
                content,
                type: req.file ? 'media' : 'text',
                mediaUrl: req.file ? req.file.path : undefined,
                timestamp: new Date(),
                reactions: []
            });

            await message.save();
            const messageObj = message.toObject();
            res.status(201).json({ message: messageObj });
        }
    } catch (error) {
        console.error('Message handling error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};


// Message getting
export const getBookingMessages = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const messages = await Message.find({ bookingId }).sort({ timestamp: 1 });
        console.log('get msg.......', messages)

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};