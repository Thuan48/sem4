import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsChevronDown, BsChevronUp, BsPinAngle } from 'react-icons/bs';
import MessageCard from './MessageCard';

interface PinnedMessagesProps {
  messages: any[];
  currentUserId: number;
  onDelete: (id: number) => void;
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, currentUserId, onDelete }) => {
  if (messages.length === 0) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="pinned-messages bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 ease-in-out">
      <motion.div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <h3 className="text-lg font-semibold flex items-center text-gray-800 dark:text-gray-200">
          <BsPinAngle className="mr-2 text-xl" />
          Pinned Messages
          <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full px-2 py-1">
            {messages.length}
          </span>
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? <BsChevronUp className="text-gray-600 dark:text-gray-400" /> : <BsChevronDown className="text-gray-600 dark:text-gray-400" />}
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MessageCard
                      isReqUserMessage={msg.userId === currentUserId}
                      message={msg}
                      onDelete={() => onDelete(msg.id)}
                      userId={msg.userId}
                      currentUserId={currentUserId}
                    />
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 italic">No pinned messages yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PinnedMessages;