    import React from 'react';

    export const ReactionPicker: React.FC<{ onSelect: (emoji: string) => void }> = ({ onSelect }) => {
        const emojis = ['👍', '❤️', '😊', '😂', '😮', '😢', '😡'];
        
        return (
            <div className="flex items-center bg-white rounded-full shadow-lg border p-1">
                {emojis.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => onSelect(emoji)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <span className="text-lg">{emoji}</span>
                    </button>
                ))}
            </div>
        );
    };