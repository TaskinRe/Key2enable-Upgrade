// This component displays a confirmation modal for deleting a lesson plan
import React from "react";

function DeleteConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">Delete Lesson Plan</h2>
        <p className="mb-6">Are you sure you want to delete this lesson plan?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
