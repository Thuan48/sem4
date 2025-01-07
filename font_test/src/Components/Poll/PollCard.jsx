import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, IconButton } from "@mui/material";
import { deletePoll, getPollResults, getUserVote, votePoll } from "../../Redux/Poll/Action";
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash } from "react-icons/fa";

const PollCard = ({ poll, voteCounts = [], userVote }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [selectedOption, setSelectedOption] = useState(userVote !== null ? userVote : null);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentUser = useSelector((state) => state.auth.reqUser);

  useEffect(() => {
    setSelectedOption(userVote !== null && userVote !== undefined ? userVote : null);
  }, [userVote]);

  const handleOptionChange = (index) => {
    setSelectedOption(index);
  };

  const handleVote = async () => {
    if (selectedOption === null) return;
    await dispatch(votePoll(poll.id, selectedOption, token));
    dispatch(getPollResults(poll.id, token));
    dispatch(getUserVote(poll.id, token));
  };

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this poll?");
    if (confirmDelete) {
      try {
        await dispatch(deletePoll(poll.id, token));
        alert("Poll deleted successfully.");
      } catch (error) {
        console.error("Failed to delete poll:", error);
        alert("Failed to delete poll. Please try again.");
      }
    }
  }, [dispatch, poll.id, token]);

  const cleanedVoteCounts = Array.isArray(voteCounts) ? voteCounts : [];
  const totalVotes = cleanedVoteCounts.reduce((acc, count) => acc + count, 0);

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleString();
  };
  
  const isPollCreator = currentUser && poll.createdBy && currentUser.id === poll.createdBy.id;

  return (
    <motion.div
      className="bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(229, 231, 235, 0.5)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{poll.question}</h3>
          {poll.deadline && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Deadline: {formatDeadline(poll.deadline)}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total votes: {totalVotes}
          </p>
        </div>
        {isPollCreator && (
          <IconButton
            onClick={(e) => handleDelete(e)} 
            className="text-red-500 hover:text-red-700"
            aria-label="Delete Poll"
          >
            <FaTrash />
          </IconButton>
        )}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <div className="space-y-2">
              {cleanedVoteCounts.length > 0 && (poll.options || []).map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded ${userVote === index
                    ? "bg-teal-600 dark:bg-teal-700 text-white"
                    : "hover:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                >
                  <span className="font-medium">{option}</span>
                  <span className="ml-auto text-sm">
                    Votes: {cleanedVoteCounts[index] || 0} (
                    {totalVotes > 0 ? ((cleanedVoteCounts[index] / totalVotes) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
            {(userVote === null || userVote === undefined) ? (
              <>
                <div className="mt-4 space-y-2">
                  {(poll.options || []).map((option, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionChange(index);
                      }}
                      className={`w-full p-2 rounded ${selectedOption === index
                        ? "bg-teal-600 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote();
                  }}
                  disabled={selectedOption === null}
                  className="mt-2"
                >
                  Vote
                </Button>
              </>
            ) : (
              <p className="mt-2 text-teal-600 dark:text-teal-400 font-semibold">You voted: {poll.options[userVote]}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PollCard;