// Assessments.jsx
// Description: Assessments management page for teachers

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

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
      end: weekEnd.toISOString().slice(0, 10)
    });

    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function Assessments() {
  const [entries, setEntries] = useState([]);
  const [month, setMonth] = useState(() => {
  return localStorage.getItem("lastSelectedMonth") || "September 2025";
});
  const [language, setLanguage] = useState(() => {
  return localStorage.getItem("lastSelectedLanguage") || "Arabic";
});
  const [editStates, setEditStates] = useState({});
  const [students, setStudents] = useState([]);
  const [view, setView] = useState(() => {
  return localStorage.getItem("lastSelectedView") || "monthly";
});
  const [week, setWeek] = useState("");
  const [weekList, setWeekList] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const { user } = useUser();


  useEffect(() => {
    if (view === "weekly") {
      const weeks = getWeeksInMonth(month);
      setWeekList(weeks);
      setWeek(weeks[0]?.label || "");
    }
  }, [month, view]);

  const fetchData = async () => {
  // Prevent API calls if groupId is not ready
  if (!groupId || groupId.length !== 36) return;

  const params = { month, language, group_id: groupId };
  if (view === "weekly") params.week = week;

  const lessonPlanPromise = axios.get(`${BASE_URL}/lesson-plans`, {
    params: {
      ...params,
      ...(view === "weekly" && { week })
    }
  });

  const [studentsRes, assessmentsRes, lessonPlanRes] = await Promise.all([
    axios.get(`${BASE_URL}/students`, { params }),
    axios.get(`${BASE_URL}/assessments`, { params }),
    lessonPlanPromise
  ]);

  setStudents(studentsRes.data);
  setEntries(assessmentsRes.data);
  setLessonPlans(lessonPlanRes.data);
};

const fetchGroups = async () => {
  if (!user?.id) return;

  try {
    const res = await axios.get(`${BASE_URL}/groups/for-teacher`, {
      params: { clerk_user_id: user.id },
    });

    setGroupOptions(res.data);

    const storedGroupId = localStorage.getItem("lastSelectedGroupId");
    const validGroup = res.data.find((g) => g.id === storedGroupId);

    if (validGroup) {
      setGroupId(validGroup.id);
    } else {
      setGroupId(res.data[0]?.id || "");
    }
  } catch (err) {
    console.error("Error fetching teacher's groups", err);
  }
};

useEffect(() => {
  fetchGroups();
}, [user]);


  useEffect(() => {
    fetchData();
  }, [month, language, view, week, groupId]);


  const handleChange = (studentName, category, field, value) => {
  setEntries(prev => {
    const newEntries = [...prev];

    const index = newEntries.findIndex(e => 
      e.students?.name === studentName &&
      e.category === category &&
      (view !== "weekly" || e.week === week) // Only match correct week in weekly view
    );

    if (index >= 0) {
      newEntries[index] = {
        ...newEntries[index],
        [field]: value,
        isNew: false // in case editing an existing entry
      };
    } else {
      newEntries.push({
        students: { name: studentName },
        category,
        raw_score: field === 'raw_score' ? value : 0,
        max_score: field === 'max_score' ? value : 0,
        language,
        month,
        week,
        week_start: weekList.find(w => w.label === week)?.start,
        week_end: weekList.find(w => w.label === week)?.end,
        group_id: groupId,
        isNew: true
      });
    }

    return newEntries;
  });
};

  const handleToggleEdit = (studentName) => {
    setEditStates(prev => ({ ...prev, [studentName]: !prev[studentName] }));
  };

  const handleSave = async (studentName, studentEntries) => {
    const selectedWeek = weekList.find(w => w.label === week);
    try {
      for (const category in studentEntries) {
        const entry = studentEntries[category];

        if (!entry.isNew && entry.id) {
          await axios.put(`${BASE_URL}/assessments/${entry.id}`, {
            raw_score: Number(entry.raw_score || 0),
            max_score: Number(entry.max_score || 0)
          });
        } else {
          await axios.post(`${BASE_URL}/assessments`, {
            student_name: studentName,
            category,
            raw_score: Number(entry.raw_score || 0),
            max_score: Number(entry.max_score || 0),
            language,
            month,
            ...(view === "weekly" && {
              week: selectedWeek?.label,
              week_start: selectedWeek?.start,
              week_end: selectedWeek?.end
            }),
            group_id: groupId
          });
        }
      }
      await fetchData();
      setEditStates(prev => ({ ...prev, [studentName]: false }));
    } catch (err) {
      console.error("Save failed", err);
      alert("Update failed!");
    }
  };

    const grouped = useMemo(() => {
    const temp = {};
    entries.forEach(e => {
      const name = e.students?.name || "Unknown";
      const cat = e.category;
      if (!temp[name]) temp[name] = {};

      if (view === "weekly") {
        temp[name][cat] = { ...e };
      } else {
        if (!temp[name][cat]) {
          temp[name][cat] = { raw_score: 0, max_score: 0, count: 0 };
        }
        temp[name][cat].raw_score += Number(e.raw_score || 0);
        temp[name][cat].max_score += Number(e.max_score || 0);
        temp[name][cat].count += 1;
      }
    });
    return temp;
  }, [entries, view]);


    const lessonPlanMap = {};
    lessonPlans.forEach(lp => {
    if (!lessonPlanMap[lp.category]) {
      lessonPlanMap[lp.category] = [];
    }
    lessonPlanMap[lp.category].push(lp.content);
  });


  Object.keys(lessonPlanMap).forEach(category => {
    lessonPlanMap[category] = lessonPlanMap[category].join(", ");
  });


    const categories = [
    ...new Set([
      ...lessonPlans.map(lp => lp.category),
      ...entries.map(e => e.category)
    ])
  ];
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-semibold mb-4">Assessments</h1>

        <div className="flex flex-wrap gap-4 mb-4">
          <Select
            value={view}
            onValueChange={(val) => {
              setView(val);
              localStorage.setItem("lastSelectedView", val);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={month}
            onValueChange={(val) => {
              setMonth(val);
              localStorage.setItem("lastSelectedMonth", val);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025","August 2025", "September 2025","October 2025", "November 2025", "December 2025" ].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {view === "weekly" && (
            <Select value={week} onValueChange={setWeek}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                {weekList.map(w => (
                  <SelectItem key={w.label} value={w.label}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={language}
            onValueChange={(val) => {
              setLanguage(val);
              localStorage.setItem("lastSelectedLanguage", val);
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={groupId}
            onValueChange={(val) => {
              setGroupId(val);
              localStorage.setItem("lastSelectedGroupId", val);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              {groupOptions.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
         <table className="min-w-full table-auto text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-2 py-1" rowSpan={2}>Student</th>
              {categories.map(category => (
                <th key={category} className="border px-2 py-1" colSpan={3}>
                  {category}
                  {lessonPlanMap[category] && (
                    <span className="ml-1 text-xs text-gray-600 font-normal">
                      ({lessonPlanMap[category]})
                    </span>
                  )}
                </th>
              ))}
              <th className="border px-2 py-1" rowSpan={2}>Overall %</th>
              {view === "weekly" && <th className="border px-2 py-1" rowSpan={2}>Action</th>}
            </tr>
            <tr>
              {categories.map((_, idx) => (
                <React.Fragment key={`subheader-${idx}`}>
                  <th className="border px-2 py-1">Raw</th>
                  <th className="border px-2 py-1">Max</th>
                  <th className="border px-2 py-1">%</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const name = student.name;
              const studentEntries = grouped[name] || {};
              const isEditing = editStates[name];

              const categoryPercentages = categories.map(category => {
                const e = studentEntries[category];
                if (!e || !e.max_score || !e.raw_score) return null;
                return (e.raw_score / e.max_score) * 100;
              }).filter(p => p !== null);

              let totalRaw = 0;
              let totalMax = 0;

              categories.forEach(category => {
                const e = studentEntries[category];
                if (e && e.max_score && e.raw_score) {
                  totalRaw += e.raw_score;
                  totalMax += e.max_score;
                }
              });

              const overallPercentage = totalMax > 0
                ? Math.round((totalRaw / totalMax) * 100)
                : " ";

              return (
                <tr key={name} className="text-center h-14">
                  <td className="border px-2 py-1 font-medium">{name}</td>
                  {categories.map(category => {
                    const entry = studentEntries[category] || { raw_score: 0, max_score: 0 };
                    const percent = entry.raw_score && entry.max_score
                      ? Math.round((entry.raw_score / entry.max_score) * 100)
                      : " ";

                    return (
                      <React.Fragment key={`${name}-${category}`}>
                        <td className="border px-2 py-1">
                          {view === "weekly" && isEditing ? (
                            <input
                              type="number"
                              className="w-16 border p-1 text-center rounded"
                              value={entry.raw_score || ""}
                              onChange={(e) => handleChange(name, category, "raw_score", e.target.value)}
                              placeholder="0"
                            />
                          ) : (
                            entry.raw_score || " "
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {view === "weekly" && isEditing ? (
                            <input
                              type="number"
                              className="w-16 border p-1 text-center rounded"
                              value={entry.max_score || ""}
                              onChange={(e) => handleChange(name, category, "max_score", e.target.value)}
                              placeholder="0"
                            />
                          ) : (
                            entry.max_score || " "
                          )}
                        </td>
                        <td className="border px-2 py-1">{percent}</td>
                      </React.Fragment>
                    );
                  })}
                  <td className="border px-2 py-1 font-medium">
                    {overallPercentage === " " ? " " : `${overallPercentage}%`}
                  </td>
                  {view === "weekly" && (
                    <td className="border px-2 py-1">
                      <Button
                        onClick={() => isEditing ? handleSave(name, studentEntries) : handleToggleEdit(name)}
                        className="bg-white shadow text-black hover:bg-gray-100"
                        variant="outline"
                      >
                        {isEditing ? "Save" : "Edit"}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Assessments;
