// StudentMoodReport.jsx
// Description: Teacher view of one student's mood, day by day, for a
// chosen week — the individual counterpart to the class-wide Mood
// Board pie chart.
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import Sidebar from '../components/Sidebar';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MOOD_META = {
  happy: { emoji: '😊', label: 'Happy' },
  excited: { emoji: '🤩', label: 'Excited' },
  calm: { emoji: '😌', label: 'Calm' },
  tired: { emoji: '😴', label: 'Tired' },
  sad: { emoji: '😢', label: 'Sad' },
};

function currentWeekSunday() {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return sunday.toISOString().split('T')[0];
}

function StudentMoodReport() {
  const { user, isLoaded } = useUser();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [weekStart, setWeekStart] = useState(currentWeekSunday());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    axios
      .get(`${BASE_URL}/groups/for-teacher`, { params: { clerk_user_id: user.id } })
      .then((res) => setGroups(res.data))
      .catch((err) => console.error('Failed to load groups:', err));
  }, [isLoaded, user]);

  useEffect(() => {
    if (!selectedGroup) return;
    axios
      .get(`${BASE_URL}/students`, { params: { group_id: selectedGroup } })
      .then((res) => setStudents(res.data))
      .catch((err) => console.error('Failed to load students:', err));
    setSelectedStudent('');
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedStudent || !user?.id) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${BASE_URL}/mood-entries/individual`, {
        params: { student_id: selectedStudent, week_start: weekStart, clerk_user_id: user.id },
      })
      .then((res) => setEntries(res.data.entries || []))
      .catch((err) => {
        console.error('Failed to load mood report:', err);
        setError(err.response?.data?.error || 'Failed to load mood report');
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent, weekStart, user]);

  const byDate = Object.fromEntries(entries.map((e) => [e.entry_date, e.mood]));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Individual Weekly Mood Report</h1>

        <div className="flex flex-wrap gap-3 mb-8">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!students.length}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        {!selectedStudent && (
          <p className="text-gray-400 text-sm">Pick a group and a student to see their week.</p>
        )}
        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {selectedStudent && !loading && !error && (
          <div className="grid grid-cols-7 gap-3 max-w-3xl">
            {weekDates.map((date, i) => {
              const mood = byDate[date];
              const meta = mood ? MOOD_META[mood] : null;
              return (
                <div
                  key={date}
                  className="flex flex-col items-center bg-white rounded-xl shadow-sm p-4 border"
                >
                  <span className="text-xs text-gray-400 mb-2">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-4xl mb-1">{meta ? meta.emoji : '—'}</span>
                  <span className="text-xs text-gray-500">{meta ? meta.label : 'No check-in'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentMoodReport;
