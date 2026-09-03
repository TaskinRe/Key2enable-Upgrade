// This component represents a card for a category with options to edit and delete.
// File: CategoryCard.jsx
import React from "react";
import { Trash2, Pencil } from "lucide-react";

function CategoryCard({
  title,
  month,
  week,
  groupNames = [],
  onClick,
  onDelete,
  onEdit
}) {
  return (
    <div
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl hover:ring-1 hover:ring-blue-300 transition-all p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-gray-400 hover:text-blue-500"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      {month && <p className="text-sm text-gray-600"><strong>Month:</strong> {month}</p>}
      {week && <p className="text-sm text-gray-600"><strong>Week:</strong> {week}</p>}
      {groupNames.length > 0 && (
        <div className="mt-1">
          <p className="text-sm text-gray-600 font-semibold">Groups:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {groupNames.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CategoryCard;
