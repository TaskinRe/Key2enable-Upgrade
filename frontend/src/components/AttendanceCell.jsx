// This component renders a single cell in the attendance table.
function AttendanceCell({ studentId, day, month, status, updateAttendance, isUpdating }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'P': return 'text-green-600';
      case 'A': return 'text-red-600';
      case 'H': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    const [monthName, year] = month.split(" ");
    const date = new Date(`${monthName} ${day}, ${year}`).toISOString().split('T')[0];
    
    await updateAttendance({
      student_id: studentId,
      date,
      status: newStatus
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isUpdating}
      className={`bg-transparent focus:outline-none ${getStatusColor(status)}`}
    >
      <option value="-">-</option>
      <option value="P">P</option>
      <option value="A">A</option>
      <option value="H">H</option>
    </select>
  );
}

export default AttendanceCell;