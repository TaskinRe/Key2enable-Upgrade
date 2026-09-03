// Description: A React component that displays a card with student information including name, ID, mood, attendance, assessment, and avatar.
import React from 'react';

const EvelynCard = ({ name, id, mood, attendance, assessment, avatar }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-sm">
      <div className="flex items-center mb-4">
        <img
          src={avatar}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          {/* <p className="text-sm text-gray-500">ID: {id}</p> */}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Attendance</span>
          <div className="flex-1 mx-2 h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${attendance}%` }}
            />
          </div>
          <span>{attendance}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Assessment</span>
          <div className="flex-1 mx-2 h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-orange-400 rounded"
              style={{ width: `${assessment}%` }}
            />
          </div>
          <span>{assessment}%</span>
        </div>

        {/* mood emoji map updated for the 5-mood kiosk scale:
            happy 😊 · excited 🤩 · calm 😌 · tired 😴 · sad 😢
        <div className="mt-3 flex items-center gap-2 text-lg">
          <span>{{ happy: '😊', excited: '🤩', calm: '😌', tired: '😴', sad: '😢' }[mood] || '😊'}</span>
          <span className="text-sm capitalize">{mood}</span>
        </div> */}
      </div>

      {/* <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded w-full">
        View
      </button> */}
    </div>
  );
};

export default EvelynCard;
