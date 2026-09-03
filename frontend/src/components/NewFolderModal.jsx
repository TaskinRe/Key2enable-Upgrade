import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NewFolderModal({ isOpen, onClose, onCreated }) {
  const [folderName, setFolderName] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${BASE_URL}/quizzes`)
        .then((res) => setQuizzes(res.data))
        .catch((err) => console.error("Failed to fetch quizzes", err));
    }
  }, [isOpen]);

  const toggleQuizSelection = (quizId) => {
    setSelectedQuizIds((prev) =>
      prev.includes(quizId)
        ? prev.filter((id) => id !== quizId)
        : [...prev, quizId]
    );
  };

  const handleCreate = async () => {
    if (!folderName.trim()) return alert("Please enter a folder name.");
    try {
      await axios.post(`${BASE_URL}/quiz-folders`, {
        folder_name: folderName,
        quiz_ids: selectedQuizIds,
      });
      onCreated(); // Refresh parent list
      onClose();   // Close modal
      setFolderName("");
      setSelectedQuizIds([]);
    } catch (err) {
      console.error("Error creating folder", err);
      alert("Failed to create folder.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">📁 Create New Folder</h2>

        <input
          type="text"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
          {quizzes.length === 0 ? (
            <p className="text-gray-500 text-sm">No quizzes available.</p>
          ) : (
            quizzes.map((quiz) => (
              <label
                key={quiz.quiz_id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedQuizIds.includes(quiz.quiz_id)}
                  onChange={() => toggleQuizSelection(quiz.quiz_id)}
                />
                {quiz.quiz_name}
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
