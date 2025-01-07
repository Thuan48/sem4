import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PollCard from "./PollCard";
import { getPollsByChat, getPollResults, getUserVote } from "../../Redux/Poll/Action";
import { motion, AnimatePresence } from 'framer-motion';
import { BsBarChart, BsChevronDown, BsChevronUp } from 'react-icons/bs';

const PollsPage = ({ chatId }) => {
  const dispatch = useDispatch();
  const { polls, error, pollResults, userVotes } = useSelector((state) => state.poll);
  const token = localStorage.getItem("token");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (chatId && token) {
      dispatch(getPollsByChat(chatId, token));
    }
  }, [dispatch, chatId, token]);

  useEffect(() => {
    if (polls && polls.length > 0) {
      polls.forEach((poll) => {
        dispatch(getPollResults(poll.id, token));
        dispatch(getUserVote(poll.id, token));
      });
    }
  }, [dispatch, polls, token]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!polls || polls.length === 0) {
    return null;
  }

  return (
    <div className="polls-section bg-gray-800 dark:bg-gray-900 text-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 ease-in-out">
      <motion.div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <h3 className="text-lg font-semibold flex items-center text-white dark:text-gray-200">
          <BsBarChart className="mr-2 text-xl" />
          Polls
          <span className="ml-2 bg-white bg-opacity-20 text-white dark:text-gray-200 text-sm rounded-full px-2 py-1">
            {polls.length}
          </span>
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? <BsChevronUp className="text-white dark:text-gray-200" /> : <BsChevronDown className="text-white dark:text-gray-200" />}
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
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-gray-700 dark:bg-gray-800">
              {polls && polls.length > 0 ? (
                polls.map((poll) => (
                  <motion.div
                    key={poll.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PollCard
                      poll={poll}
                      voteCounts={pollResults[poll.id] || []}
                      userVote={userVotes[poll.id] !== undefined ? userVotes[poll.id] : null}
                    />
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-300 dark:text-gray-400 italic">No polls available</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PollsPage;