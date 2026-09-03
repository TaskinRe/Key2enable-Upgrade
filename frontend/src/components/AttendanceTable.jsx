// File: AttendanceTable.jsx
// Description: A React component to display and manage attendance records for students in a table format.
import { useState, useMemo } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getDaysInMonth(monthString) {
  const [monthName, yearStr] = monthString.split(" ");
  const year = parseInt(yearStr);
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(Date.UTC(year, monthIndex, i + 1));
    return {
      label: `${i + 1} ${monthName}`,
      iso: date.toISOString().split("T")[0]
    };
  });
}

function AttendanceTable({ entries, setEntries, students, month }) {
  const [updating, setUpdating] = useState(false);
  const days = getDaysInMonth(month);

  const studentMap = useMemo(() => {
    const map = {};

    students.forEach(student => {
      map[student.id] = {
        name: student.name,
        records: {},
        country: student.country,
        group_id: student.group_id,
      };
    });

    entries.forEach(entry => {
      let status = entry.status;
      if (status === 'L') return;
      if (status === 'WO') status = 'H';

      if (map[entry.student_id]) {
        map[entry.student_id].records[entry.date] = { status, id: entry.id };
      }
    });

    return map;
  }, [students, entries]);


const handleStatusChange = async (entryId, newStatus, date, studentId, student) => {
    setUpdating(true);
    const finalStatus = newStatus;

    try {
      if (entryId) {
        await axios.put(`${BASE_URL}/attendance/${entryId}`, {
          status: finalStatus,
        });

        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === entryId ? { ...entry, status: finalStatus } : entry
          )
        );
      } else {
        const response = await axios.post(`${BASE_URL}/attendance`, {
          student_id: studentId,
          date,
          status: finalStatus,
          month,
          country: student.country,
          group_id: student.group_id,
        });

        const inserted = response?.data?.data;
        if (!inserted || inserted.length === 0) {
          alert("Insert succeeded but no entry returned.");
          return;
        }

        const newEntry = inserted[0];
        setEntries((prev) => [...prev, newEntry]);
      }
    } catch (err) {
      console.error("Failed to update", err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };
  return (
    <div className="w-full overflow-x-auto relative  border border-gray-200 rounded-xl">
    <table className="table-auto min-w-[${days.length * 80 + 300}px] text-sm border-gray-200 rounded-lg ">
      <thead className="bg-blue-100">
        <tr className="text-center text-sm font-medium">
          <th className="border px-4 py-2 w-48 sticky left-0 z-50 bg-blue-100 text-left border-b">Student</th>
          <th className="border px-4 py-2 w-16">P</th>
          <th className="border px-4 py-2 w-16">A</th>
          <th className="border px-4 py-2 w-16">H</th>
          <th className="border px-4 py-2 w-24">Total</th>
          {days.map((d, i) => (
            <th key={i} className="border p-2 text-xs whitespace-nowrap">{d.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
  {Object.entries(studentMap).length === 0 ? (
    <tr>
      <td
        className="border px-4 py-2 w-48 sticky left-0 bg-white z-40 text-left"
        colSpan={5 + days.length}
      >
        No students found.
      </td>
    </tr>
  ) : (
    Object.entries(studentMap).map(([id, student]) => {
      const statusCounts = { P: 0, A: 0, H: 0 };

      days.forEach((d) => {
        const s = student.records[d.iso]?.status;
        if (s && ["P", "A", "H"].includes(s)) {
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        }
      });

      const totalCounted = statusCounts.P + statusCounts.A;
      const attendancePercent =
        totalCounted > 0 ? Math.round((statusCounts.P / totalCounted) * 100) : 0;

      return (
        <tr key={id} className="hover:bg-gray-50 text-center relative">
          <td className="border px-4 py-2 w-48 sticky left-0 bg-white z-40 text-left">
            {student.name}
          </td>
          <td className="border p-2">{statusCounts.P}</td>
          <td className="border p-2">{statusCounts.A}</td>
          <td className="border p-2">{statusCounts.H}</td>
          <td className="border p-2">{attendancePercent}%</td>
          {days.map((d, i) => {
            const cell = student.records[d.iso];
            const status = cell?.status || "";
            const entryId = cell?.id;

            const bg =
              status === "P"
                ? "bg-green-100"
                : status === "A"
                ? "bg-red-100"
                : status === "H"
                ? "bg-gray-100"
                : "";

            return (
              <td key={i} className={`border p-1 ${bg}`}>
                <select
                  value={status}
                  onChange={(e) =>
                    handleStatusChange(entryId, e.target.value, d.iso, id, student)
                  }
                  disabled={updating}
                  className="bg-transparent focus:outline-none w-full text-center"
                >
                  <option value=""> </option>
                  <option value="P">P</option>
                  <option value="A">A</option>
                  <option value="H">H</option>
                </select>
              </td>
            );
          })}
        </tr>
      );
    })
  )}
</tbody>

      </table>
    </div>
  );
}

export default AttendanceTable;