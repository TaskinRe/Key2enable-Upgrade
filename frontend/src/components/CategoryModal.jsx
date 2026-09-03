// File: CategoryModal.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getWeeksInMonth(monthYear) {
  const [monthName, yearStr] = monthYear.split(" ");
  const year = parseInt(yearStr);
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const weeks = [];
  let current = new Date(year, monthIndex, 1);
  const month = current.getMonth();

  while (current.getMonth() === month) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd.getMonth() !== month) {
      weekEnd.setMonth(month);
      weekEnd.setDate(new Date(year, month + 1, 0).getDate());
    }
    weeks.push({
      label: `${monthName} ${weekStart.getDate()} - ${monthName} ${weekEnd.getDate()}`,
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10),
    });
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function CategoryModal({
  initialHeader = "",
  initialContent = "",
  language,
  initialMetadata = {},
  onClose,
  onSave,
  groupOptions = [],
}) {
  const [header, setHeader] = useState(initialHeader);
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(initialHeader === "");
  const [month, setMonth] = useState(initialMetadata.month || "");
  const [selectedWeeks, setSelectedWeeks] = useState(initialMetadata.week ? [initialMetadata.week] : []);
  const [weekList, setWeekList] = useState([]);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(initialMetadata.group_ids || []);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const dropRef = useRef(null);

  useEffect(() => {
    if (month) setWeekList(getWeeksInMonth(month));
  }, [month]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!initialMetadata?.month || !initialMetadata?.week || !initialHeader) return;
      try {
        const res = await axios.get(`${BASE_URL}/lesson-plans`, {
          params: {
            month: initialMetadata.month,
            week: initialMetadata.week,
            language,
            group_id: initialMetadata.group_ids?.[0],
          },
        });
        const match = res.data.find((p) => p.category === initialHeader);
        if (!match?.id) return;
        const filesRes = await axios.get(`${BASE_URL}/lesson-plans/${match.id}/files`);
        setAttachedFiles(filesRes.data);
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    if (!isEditing) fetchFiles();
  }, [initialMetadata, initialHeader, isEditing]);

  const toggleWeek = (week) => {
    setSelectedWeeks((prev) => prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]);
  };

  const toggleGroup = (id) => {
    setSelectedGroups((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    const entries = [];
    for (let weekLabel of selectedWeeks) {
      const weekObj = weekList.find((w) => w.label === weekLabel);
      for (let groupId of selectedGroups) {
        entries.push({
          header,
          content,
          language,
          month,
          week: weekLabel,
          week_start: weekObj?.start,
          week_end: weekObj?.end,
          groupId,
        });
      }
    }

    await onSave(entries);

    for (let entry of entries) {
      const res = await axios.get(`${BASE_URL}/lesson-plans`, {
        params: {
          month: entry.month,
          week: entry.week,
          language: entry.language,
          group_id: entry.groupId,
        },
      });

      const matched = res.data.find((p) => p.category === entry.header);
      if (!matched || selectedFiles.length === 0) continue;

      const formData = new FormData();
      formData.append("lesson_plan_id", matched.id);
      selectedFiles.forEach((file) => formData.append("files", file));
      await axios.post(`${BASE_URL}/lesson-plans/upload-multiple`, formData);

      const filesRes = await axios.get(`${BASE_URL}/lesson-plans/${matched.id}/files`);
      setAttachedFiles(filesRes.data);
    }

    setIsEditing(false);
    setSelectedFiles([]);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileInput = (e) => setSelectedFiles(Array.from(e.target.files));
  const preventDefault = (e) => e.preventDefault();

  const handleDeleteFile = async (fileId) => {
    await axios.delete(`${BASE_URL}/lesson-plans/files/${fileId}`);
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-200" />
      <div className="fixed inset-0 flex justify-center items-center z-50 transition-transform duration-200">
        <div className="bg-white p-6 rounded-lg w-2/3 max-w-xl shadow-xl relative animate-fadeIn">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lesson Plan</h2>

          <div className="mb-4 text-sm">
            {month && <p><strong>Month:</strong> {month}</p>}
            {selectedWeeks.length > 0 && <p><strong>Weeks:</strong> {selectedWeeks.join(", ")}</p>}
            {selectedGroups.length > 0 && (
              <p><strong>Groups:</strong><br />
                {selectedGroups.map((id) => {
                  const g = groupOptions.find((x) => x.id === id);
                  return g ? g.name : id;
                }).join(" • ")}
              </p>
            )}
          </div>

          {isEditing && (
            <>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="mb-2 w-full p-2 border rounded">
                <option value="">Select Month</option>
                {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025", "August 2025", "September 2025","October 2025", "November 2025", "December 2025"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {month && (
                <div className="relative mb-2">
                  <button onClick={() => setWeekDropdownOpen(!weekDropdownOpen)} className="w-full p-2 bg-white border rounded text-left">
                    {selectedWeeks.length > 0 ? `${selectedWeeks.length} weeks selected` : "Select Weeks"}
                  </button>
                  {weekDropdownOpen && (
                    <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                      {weekList.map((w) => (
                        <label key={w.label} className="flex items-center p-2 hover:bg-gray-100">
                          <input type="checkbox" checked={selectedWeeks.includes(w.label)} onChange={() => toggleWeek(w.label)} className="mr-2" />
                          {w.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedWeeks.length > 0 && (
                <div className="relative mb-2">
                  <button onClick={() => setGroupDropdownOpen(!groupDropdownOpen)} className="w-full p-2 bg-white border rounded text-left">
                    {selectedGroups.length > 0 ? `${selectedGroups.length} groups selected` : "Select Groups"}
                  </button>
                  {groupDropdownOpen && (
                    <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-40 overflow-y-auto">
                      {Array.isArray(groupOptions) && groupOptions.map((g) => (
                        <label key={g.id} className="flex items-center p-2 hover:bg-gray-100">
                          <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} className="mr-2" />
                          {g.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            disabled={!isEditing}
            className="w-full p-3 mb-4 bg-gray-100 rounded text-black font-semibold"
            placeholder="Enter Category Name"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isEditing}
            rows={5}
            className="w-full p-3 mb-4 bg-gray-100 rounded text-black"
            placeholder="Enter Lesson Plan Content"
          />

          {!isEditing && attachedFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold">Attached Files:</p>
              <ul className="list-disc ml-5 mt-1 text-blue-600 text-sm">
                {attachedFiles.map((file, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">{file.file_name}</a>
                    <button onClick={() => handleDeleteFile(file.id)} className="ml-2 text-red-500 hover:text-red-700">❌</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Cancel</button>
            <button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoryModal;
