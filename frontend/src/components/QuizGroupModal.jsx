import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function QuizGroupModal({ quizId, onClose }) {
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupRes = await axios.get(`${BASE_URL}/groups`);
        setGroupOptions(groupRes.data || []);

        const quizGroupRes = await axios.get(`${BASE_URL}/quiz-groups/${quizId}`);
        setSelectedGroups(quizGroupRes.data || []);
      } catch (err) {
        console.error("Error loading groups", err);
      }
    };
    loadGroups();
  }, [quizId]);

  const toggleGroup = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      await axios.post(`${BASE_URL}/quiz-groups`, {
        quiz_id: quizId,
        group_ids: selectedGroups,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save group assignments", err);
    }
  };

  return (
    <>
      {/* overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />
      {/* modal */}
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Assign Quiz to Groups</h2>

          {/* group dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full p-2 bg-white border rounded text-left"
            >
              {selectedGroups.length > 0
                ? `${selectedGroups.length} group(s) selected`
                : "Select Groups"}
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                {groupOptions.map((g) => (
                  <label key={g.id} className="flex items-center p-2 hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      className="mr-2"
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
