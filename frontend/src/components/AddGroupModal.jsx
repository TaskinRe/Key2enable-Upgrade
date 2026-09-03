// AddGroupModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";

function AddGroupModal({ onClose }) {
  const [name, setName] = useState('');
  const { user } = useUser();


  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/groups`, {
      name,
      clerk_user_id: user.id,  // send logged-in teacher's Clerk ID
    });
    onClose();
  } catch (error) {
    console.error('Error creating group:', error);
  }
};

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow">
        <h2 className="text-xl font-semibold mb-4">➕ Add Group</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group Name" className="border p-2 rounded" required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-green-500 text-white">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGroupModal;
