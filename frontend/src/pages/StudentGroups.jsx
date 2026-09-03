
// src/pages/StudentGroups.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import AddStudentModal from '../components/AddStudentModal';
import AddGroupModal from '../components/AddGroupModal';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function StudentGroups() {
  const { user, isLoaded } = useUser();
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);


  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    fetchGroups();
    fetchStudents();
  }, [isLoaded, user]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/for-teacher`, {
        params: { clerk_user_id: user.id },
      });
      setGroups(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch groups:", err);
    }
  };

  // const fetchStudents = async () => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/students/for-teacher`, {
  //       params: { clerk_user_id: user.id },
  //     });
  //     console.log('📦 students:', res.data);
  //     setStudents(Array.isArray(res.data) ? res.data : []);
  //   } catch (err) {
  //     console.error("❌ Failed to fetch students:", err);
  //     setStudents([]);
  //   }
  // };

  const fetchStudents = async () => {
  setStudentsLoading(true);
  try {
    const res = await axios.get(`${BASE_URL}/students/for-teacher`, {
      params: { clerk_user_id: user.id },
    });
    console.log('📦 students:', res.data);
    setStudents(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("❌ Failed to fetch students:", err);
    setStudents([]);
  } finally {
    setStudentsLoading(false);
  }
};

  const startEdit = (id) => {
    const s = students.find((s) => s.id === id);
    setFormData({
  name: s.name || '',
  country: s.country || '',
  clerk_user_id: s.clerk_user_id || '',
  group_id: s.group_id || '',
  email: s.email || '', 
});

    setEditingId(id);
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${BASE_URL}/students/${id}`, formData);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      console.error('❌ Failed to update student:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold"> Manage Students</h1>
          <div className="flex gap-2">
            <Button className="bg-[#0072e5]" onClick={() => setShowGroupModal(true)}>+ Add Group</Button>
            <Button className="bg-[#0072e5]" onClick={() => setShowStudentModal(true)}>+ Add Student</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
           <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-md">
            <thead className="bg-blue-100">
              <tr className="text-left">
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Country</th>
                <th className="border p-2">Group</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading ? (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  <div className="flex justify-center items-center h-screen"><LoadingScreen /></div>;
                </td>
              </tr>
            ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 text-center">
                    <td className="border p-2">
                      {editingId === s.id ? (
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === s.id ? (
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        s.email || 'N/A'
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === s.id ? (
                        <input
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        s.country
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === s.id ? (
                        <select
                          name="group_id"
                          value={formData.group_id}
                          onChange={handleChange}
                          className="border p-1 rounded w-full"
                        >
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        s.groups?.name || 'N/A'
                      )}
                    </td>
                    <td className="border p-2">
                      {editingId === s.id ? (
                        <Button onClick={() => saveEdit(s.id)} size="sm">
                          Save
                        </Button>
                      ) : (
                        <Button onClick={() => startEdit(s.id)} size="sm" variant="outline">
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {showStudentModal && (
  <AddStudentModal
    onClose={() => {
      setShowStudentModal(false);
      fetchStudents();
    }}
    groups={groups}
    email={user?.primaryEmailAddress?.emailAddress}  // ✅ NEW
  />
)}

        {showGroupModal && (
          <AddGroupModal
            onClose={() => {
              setShowGroupModal(false);
              fetchGroups();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default StudentGroups;
