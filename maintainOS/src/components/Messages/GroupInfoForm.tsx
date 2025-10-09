import { useState, useEffect } from 'react';

// --- Type Definitions for Component Props ---
interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (conversationName: string) => void;
}

// --- SVG Icon for the Close Button ---
const CloseIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-6 h-6"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


// --- Main React Component ---
export function CreateConversationModal({ isOpen, onClose, onCreate }: CreateConversationModalProps) {
    const [conversationName, setConversationName] = useState('');

    // Reset the input field when the modal is opened
    useEffect(() => {
        if (isOpen) {
            setConversationName('');
        }
    }, [isOpen]);

    // Don't render the modal if it's not open
    if (!isOpen) {
        return null;
    }

    const handleCreate = () => {
        if (conversationName.trim()) {
            onCreate(conversationName);
            onClose(); // Close modal after creation
        }
    };
    
    // Get the first character for the avatar, or a default
    const getInitial = () => {
        return conversationName.trim().charAt(0).toUpperCase() || 'C';
    };

    return (
        // Modal Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            
            {/* Modal Container */}
            <div 
                className="w-full bg-white rounded-lg shadow-lg overflow-hidden" 
                style={{ maxWidth: '672px', margin: 'auto' }}
            >
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700">Create Conversation</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-700 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-0 p-1 flex items-center justify-center"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="px-6 py-8">
                        
                        {/* Conversation Avatar Preview */}
                        <div className="flex justify-center mb-8">
                            <div 
                                className="flex items-center justify-center text-white font-light" 
                                style={{ 
                                    backgroundColor: '#EC4899', 
                                    fontSize: '48px', 
                                    width: '128px', 
                                    height: '128px', 
                                    borderRadius: '50%' 
                                }}
                            >
                                {getInitial()}
                            </div>
                        </div>

                        {/* Conversation Info Section */}
                        <div className="mb-8">
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Conversation Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Marketing Campaign for Q4" 
                                    value={conversationName}
                                    onChange={(e) => setConversationName(e.target.value)}
                                    className="w-full rounded border border-gray-200 px-3 text-sm text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500" 
                                    style={{ padding: '10px 12px' }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
                    <button 
                        onClick={onClose}
                        className="cursor-pointer border-0 bg-transparent px-6 text-sm font-medium text-gray-700 hover:text-gray-700 transition-colors" 
                        style={{ padding: '10px 24px' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        className="cursor-pointer rounded border-0 bg-orange-600 px-6 text-sm font-medium text-black hover:bg-orange-700 transition-colors" 
                        style={{ padding: '10px 24px' }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
