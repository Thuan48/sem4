import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPoll } from "../../Redux/Poll/Action";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";

const CreatePollCard = ({ chatId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { error } = useSelector((state) => state.poll);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [instructions, setInstructions] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredOptions = options.filter((option) => option.trim() !== "");
    if (question.trim() === "" || filteredOptions.length < 2) {
      alert("Please enter a question and at least two options.");
      return;
    }

    if (deadline && new Date(deadline) < new Date()) {
      alert("Deadline must be a future date and time.");
      return;
    }

    const pollData = {
      question,
      options: filteredOptions,
      allowMultipleChoices: false,
      instructions,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      chatId,
    };

    dispatch(createPoll(pollData, chatId, token))
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Failed to create poll:", err);
      });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Create a New Poll</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Question:</label>
          <TextField
            type="text"
            fullWidth
            variant="outlined"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="dark:bg-gray-700 dark:text-white"
            InputLabelProps={{ className: "dark:text-gray-200" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Options:</label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <TextField
                type="text"
                fullWidth
                variant="outlined"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white"
                InputLabelProps={{ className: "dark:text-gray-200" }}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={addOption}
            variant="outlined"
            color="primary"
            className="mt-2"
          >
            Add Option
          </Button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Instructions:</label>
          <TextField
            type="text"
            fullWidth
            variant="outlined"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
            InputLabelProps={{ className: "dark:text-gray-200" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">Deadline:</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-teal-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className="text-center">
          <Button type="submit" variant="contained" color="primary" className="text-white">
            Create Poll
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePollCard;