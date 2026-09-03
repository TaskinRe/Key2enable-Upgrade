import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { FaFolder } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function QuizFolderModal({ isOpen, onClose, onCreated }) {
  const { user } = useUser();

  const [folderName, setFolderName] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${BASE_URL}/quizzes`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setQuizzes(res.data);
          } else {
            console.warn("Expected an array of quizzes, got:", res.data);
            setQuizzes([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch quizzes", err);
          setQuizzes([]);
        })
        .finally(() => {
          setLoadingQuizzes(false);
        });
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
    setCreating(true);
    try {
      // Create the folder
      const res = await axios.post(`${BASE_URL}/quiz-folders`, {
        folder_name: folderName,
        clerk_user_id: user?.id,
        quiz_ids: [], // Not needed anymore since we update directly after
      });

      const folder = res.data;
      if (!folder?.id) throw new Error("Folder ID not returned");

      // Update each quiz with folder_id
      await Promise.all(
        selectedQuizIds.map(async (quizId) => {
          const { data: quiz } = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
          await axios.put(`${BASE_URL}/quizzes/${quizId}`, {
            ...quiz,
            folder_id: folder.id,
          });
        })
      );


      onCreated?.();
      onClose();
      setFolderName("");
      setSelectedQuizIds([]);
    } catch (err) {
      console.error("Error creating folder or assigning quizzes", err);
      alert("❌ Failed to create folder or assign quizzes.");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <FaFolder className="text-blue-600 text-xl" />
          <h2 className="text-lg font-bold">Create New Folder</h2>
        </div>

        <input
          type="text"
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="max-h-40 overflow-y-auto space-y-2">
          {loadingQuizzes ? (
            <p className="text-sm text-gray-500">Loading quizzes...</p>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <label key={quiz.quiz_id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuizIds.includes(quiz.quiz_id)}
                  onChange={() => toggleQuizSelection(quiz.quiz_id)}
                />
                <span>{quiz.quiz_name}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No quizzes available</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName || creating}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
