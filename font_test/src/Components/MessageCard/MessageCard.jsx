import React from 'react';

const MessageCard = ({ isReqUserMessage, content, userName, timestamp }) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const splitContent = (text) => {
    if (!text) return ''; 
    return text.match(/.{1,45}/g)?.join(' ') || ''; 
  };

  return (
    <div className={`inline-block py-1 px-2 rounded-lg ${isReqUserMessage ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-[#d9fdd3] dark:bg-teal-700 shadow-sm"}`}>
      <div className={`flex flex-col ${isReqUserMessage ? "items-start" : "items-end"}`}>
        <strong className={`text-xs ${isReqUserMessage ? "text-gray-800 dark:text-gray-200" : "text-green-800 dark:text-teal-200"}`}>{userName}</strong>
        <p className={`mt-0.5 text-sm ${isReqUserMessage ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"} whitespace-pre-wrap break-words`}>
          {splitContent(content)}
        </p>
        <span className={`mt-0.5 text-xs ${isReqUserMessage ? "text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-teal-200"}`}>{formattedTime}</span>
      </div>
    </div>
  );
};

export default MessageCard;