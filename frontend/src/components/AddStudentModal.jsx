// AddStudentModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

function AddStudentModal({ onClose, groups, email }) {
  const [form, setForm] = useState({
    name: '',
    country: '',
    group_id: groups[0]?.id,
    email: email || ''
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/students`, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow">
        <h2 className="text-xl font-semibold mb-4">➕ Add Student</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            value={form.email}
            readOnly
            className="border p-2 rounded bg-gray-100 text-gray-600"
          />
          <select
            name="group_id"
            value={form.group_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded border">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;
