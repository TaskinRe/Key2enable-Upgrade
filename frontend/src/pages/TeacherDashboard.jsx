// // TeacherDashboard.jsx
// // Description: Teacher dashboard page showing attendance, assessments, and mood charts

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useUser } from '@clerk/clerk-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingScreen from '@/components/LoadingScreen';
import moodImage from '../assets/moodd.png';
import expressiaImage from '../assets/expressia.png';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#a855f7', '#ef4444'];
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TeacherDashboard() {
  const { user } = useUser();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [monthlyAssessment, setMonthlyAssessment] = useState([]);
  const [moodSummary, setMoodSummary] = useState({});
  const [moodType, setMoodType] = useState('month');
  const [attendanceType, setAttendanceType] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentAssessmentProgress, setStudentAssessmentProgress] = useState([]);


  function getCurrentMonthString() {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    return `${monthName} ${now.getFullYear()}`;
  }

  const getCurrentWeekMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    return monday.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const insertTeacherIfNeeded = async () => {
      if (!user?.id) return;
      try {
        const checkRes = await axios.get(`${BASE_URL}/teachers/by-clerk-id`, {
          params: { clerk_user_id: user.id },
        });
        if (!checkRes.data) {
          await axios.post(`${BASE_URL}/teachers`, {
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress || '',
            clerk_user_id: user.id,
          });
        }
      } catch (err) {
        console.error('🔴 Failed to sync teacher:', err);
      }
    };
    insertTeacherIfNeeded();
  }, [user]);

  useEffect(() => {
  if (!user?.id) return;

  axios
    .get(`${BASE_URL}/groups/for-teacher?clerk_user_id=${user.id}`)
    .then((res) => {
      setGroups(res.data);

      const stored = localStorage.getItem('selectedGroupId');
      const isValid = res.data.some((g) => g.id === stored);

      const fallbackGroupId = res.data[0]?.id || '';

      // if stored group is valid, use it; else default to first available group
      const groupToUse = isValid ? stored : fallbackGroupId;

      setSelectedGroup(groupToUse);
      localStorage.setItem('selectedGroupId', groupToUse);
    })
    .catch(() => setError('Failed to load groups'));
}, [user]);


  useEffect(() => {
    if (!selectedGroup) return;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [assessmentRes, moodRes] = await Promise.all([
          axios.get(
            `${BASE_URL}/stats/assessments/monthly-categories?group_id=${selectedGroup}&month=${selectedMonth}`
          ),
          axios.get(
            `${BASE_URL}/stats/mood-summary?type=${moodType}&month=${selectedMonth}&group_id=${selectedGroup}`
          ),
        ]);

        setMonthlyAssessment(assessmentRes.data);
        setMoodSummary(moodRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [selectedGroup, moodType, selectedMonth, groups]);

  useEffect(() => {
    if (!selectedGroup) return;

    const fetchAttendance = async () => {
      try {
        let res;
        if (attendanceType === 'week') {
          res = await axios.get(`${BASE_URL}/stats/attendance/weekly`, {
            params: {
              group_id: selectedGroup,
              week_start: getCurrentWeekMonday(),
            },
          });
          const attendance = Array.isArray(res.data)
            ? res.data
            : Object.entries(res.data).map(([day, present]) => ({ day, present }));
          setWeeklyAttendance(attendance);
        } else if (attendanceType === 'month') {
          res = await axios.get(`${BASE_URL}/stats/attendance/monthly`, {
            params: {
              group_id: selectedGroup,
              month: selectedMonth.split(' ')[0],
            },
          });
          const { present, absent, holiday } = res.data;
          const result = [
            { day: 'Present', present },
            { day: 'Absent', present: absent },
            { day: 'Holiday', present: holiday },
          ];
          setWeeklyAttendance(result);
        } else if (attendanceType === 'day') {
          res = await axios.get(`${BASE_URL}/stats/attendance/daily`, {
            params: { group_id: selectedGroup, date: getTodayDate() },
          });
          const { present, absent, holiday } = res.data;
          const result = [
            { day: 'Present', present },
            { day: 'Absent', present: absent },
            { day: 'Holiday', present: holiday },
          ];
          setWeeklyAttendance(result);
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }
    };
    fetchAttendance();
  }, [selectedGroup, attendanceType, selectedMonth]);

  useEffect(() => {
    if (!selectedGroup) return;
    const fetchStudentAttendance = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/stats/attendance/student-percentages`,
          {
            params: { group_id: selectedGroup, month: selectedMonth },
          }
        );
        setStudentAttendance(res.data);
      } catch (err) {
        console.error('Error fetching student attendance %:', err);
      }
    };
    fetchStudentAttendance();
  }, [selectedGroup, selectedMonth]);

  useEffect(() => {
  if (!selectedGroup || !selectedMonth) return;
  const fetchStudentAssessments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/stats/assessments/student-progress`, {
        params: { group_id: selectedGroup, month: selectedMonth },
      });
      setStudentAssessmentProgress(res.data);
    } catch (err) {
      console.error('Error fetching student assessments:', err);
    }
  };
  fetchStudentAssessments();
}, [selectedGroup, selectedMonth]);

useEffect(() => {
  if (!user?.id) {
    localStorage.removeItem('selectedGroupId');
  }
}, [user]);

  const moodTranslation = {
    happy: 'Happy',
    excited: 'Excited',
    calm: 'Calm',
    tired: 'Tired',
    sad: 'Sad',
  };

  const moodPieData = useMemo(
    () =>
      Object.entries(moodSummary).map(([label, count]) => ({
        name: moodTranslation[label] || label,
        value: count,
      })),
    [moodSummary]
  );

  const attendanceChart = useMemo(
    () =>
      weeklyAttendance.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyAttendance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickCount={4} allowDecimals={false} />
            <BarTooltip />
            <Bar dataKey="present" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      ),
    [weeklyAttendance]
  );

  const moodChart = useMemo(
    () =>
      moodPieData.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={moodPieData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              label
            >
              {moodPieData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ),
    [moodPieData]
  );

  const studentAttendanceChart = useMemo(
    () =>
      studentAttendance.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={studentAttendance}
            margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-30}
              textAnchor="end"
              tick={{ fontSize: 10 }}
            />
            <YAxis domain={[0, 100]} tickCount={6} />
            <BarTooltip />
            <Bar dataKey="percent" fill="#60a5fa" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      ),
    [studentAttendance]
  );

  const studentAssessmentChart = useMemo(() =>
  studentAssessmentProgress.length === 0 ? (
    <p className="text-sm text-gray-400">No data</p>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={studentAssessmentProgress}
        margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          interval={0}
          angle={-30}
          textAnchor="end"
          tick={{ fontSize: 10 }}
        />
        <YAxis domain={[0, 100]} tickCount={6} />
        <BarTooltip />
        <Bar dataKey="English" fill="#60a5fa" />
        <Bar dataKey="Arabic" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  ), [studentAssessmentProgress]);


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'June', 'July', 'August', 'September', 'October', 'November', 'December'
                ].map((month) => (
                  <SelectItem
                    key={month}
                    value={`${month} ${new Date().getFullYear()}`}
                  >
                    {month} {new Date().getFullYear()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedGroup || ''}
              onValueChange={(val) => {
                setSelectedGroup(val);
                localStorage.setItem('selectedGroupId', val);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow col-span-1">
            <div className="flex items-center justify-between mb-2">
              <a
                href="/mood-kiosk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:underline"
              >
                Mood Board ↗
              </a>
              <Select value={moodType} onValueChange={setMoodType}>
                <SelectTrigger className="w-28 text-sm border-gray-300">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {moodChart}
          </div>

          <div className="bg-white p-4 rounded shadow col-span-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Attendance Overview</h2>
              <Select value={attendanceType} onValueChange={setAttendanceType}>
                <SelectTrigger className="w-[120px] text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {attendanceChart}
          </div>

          {/* <div className="bg-white p-4 rounded shadow col-span-1 md:grid-rows-2 gap-6">
            <div className="flex items-center justify-between mb-2 row-span-1 bg-gray-50 p-2 rounded">
              <a
                href="https://mood-check-pi.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:underline"
              >
                Mood Board ↗
              </a>
              
            </div>
          </div> */}
          <div className="bg-white p-4 rounded shadow col-span-1">
          <h2 className="text-lg font-semibold mb-4">Tools</h2>
          <div className="grid grid-cols-1 gap-4">
            <a
              href="/mood-kiosk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-yellow-400 rounded-lg flex justify-center items-center h-36 shadow transition"
            >
              <h2 className='text-4xl  text-white'>😀 Mood Board</h2>
            </a>
            <a
              href="/teacher/qr-codes"
              className="bg-blue-500 hover:bg-blue-400 rounded-lg flex justify-center items-center h-36 shadow transition"
            >
              <h2 className='text-4xl text-white'>🪪 Print QR Cards</h2>
            </a>
            <a
              href="/teacher/mood-reports"
              className="bg-purple-500 hover:bg-purple-400 rounded-lg flex justify-center items-center h-36 shadow transition"
            >
              <h2 className='text-4xl text-white'>📅 Weekly Mood Reports</h2>
            </a>
            <a
              href="https://web.expressia.life/login/default"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-100 border rounded-lg flex justify-center items-center h-36 shadow transition"
            >
              <img
                src={expressiaImage}
                alt="Expressia"
                className="w-full h-full object-cover rounded-md shadow hover:bg-400"
              />
            </a>
          </div>
          </div>

          <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-3 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Student Attendance % this month</h2>
            <div style={{ minWidth: `${studentAttendance.length * 80}px`, height: '250px' }}>
              {studentAttendanceChart}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-3 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">Student Assessment % this month</h2>
          <div style={{ minWidth: `${studentAssessmentProgress.length * 80}px`, height: '250px' }}>
            {studentAssessmentChart}
          </div>
        </div>

          <div className="bg-white p-4 rounded shadow" style={{ width: '320px', height: '360px' }}>
            <h2 className="text-lg font-semibold mb-2">English Assessments</h2>
            {monthlyAssessment.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={monthlyAssessment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <BarTooltip />
                  <Bar dataKey="English" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow" style={{ width: '340px', height: '360px' }}>
            <h2 className="text-lg font-semibold mb-2">Arabic Assessments</h2>
            {monthlyAssessment.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={monthlyAssessment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <BarTooltip />
                  <Bar dataKey="Arabic" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          

        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
