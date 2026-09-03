import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import useRegisterTeacher from '@/utils/useRegisterTeacher';
import LoadingScreen from '@/components/LoadingScreen';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TeachersPage() {
  useRegisterTeacher();

  const { user, isLoaded } = useUser();
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    fetchTeachers();
    fetchGroups();
  }, [isLoaded, user]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/teachers/with-groups`);
      const teachersData = Array.isArray(res.data) ? res.data : [];
      const formatted = teachersData.map((t) => ({
        ...t,
        group_ids: t.groups?.map((name) => name) || [],
        is_new: t.is_new || false, 
      }));
      setTeachers(formatted);
    } catch (err) {
      console.error('❌ Failed to fetch teachers:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch groups:", err);
    }
  };

  const startEdit = (id) => {
    const t = teachers.find((t) => t.id === id);
    setFormData({
      name: t.name || '',
      email: t.email || '',
      country: t.country || '',
      group_ids: groups
        .filter((g) => t.groups.includes(g.name))
        .map((g) => g.id), // map group names to IDs
    });
    setEditingId(id);
  };

  const saveEdit = async (id) => {
    try {
      // Update teacher info
      await axios.put(`${BASE_URL}/teachers/${id}`, {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        is_new: false,
      });

      // Update group-teacher mapping
      await axios.put(`${BASE_URL}/teachers/${id}/groups`, {
        group_ids: formData.group_ids,
      });

      setEditingId(null);
      fetchTeachers();
    } catch (err) {
      console.error("❌ Failed to update teacher or groups:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, group_ids: selected }));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6">Manage Teachers</h1>

        <div className="overflow-x-auto">
          <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-md">
              <thead className="bg-blue-100">
                <tr className="text-left">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Country</th>
                  <th className="border p-2">Groups</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center">
                      <div className="flex justify-center items-center h-screen">
                        <LoadingScreen />
                      </div>
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 text-center">
                      <td className="border p-2">
                        {editingId === t.id ? (
                          <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-1">
      {t.name}
      {t.is_new && (
        <span className="ml-2 px-2 py-0.5 text-xs text-white bg-green-500 rounded-full">
          New!
        </span>
      )}
    </div>
                        )}
                        
                      </td>
                      <td className="border p-2">
                        {editingId === t.id ? (
                          <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          t.email
                        )}
                      </td>
                      <td className="border p-2">
                        {editingId === t.id ? (
                          <input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          t.country
                        )}
                      </td>
                      <td className="border p-2">
                        {editingId === t.id ? (
                          <div className="max-h-40 overflow-y-auto text-left border rounded p-2">
                          {groups.map((g) => (
                            <label key={g.id} className="flex items-center gap-2 mb-1">
                              <input
                                type="checkbox"
                                value={g.id}
                                checked={formData.group_ids.includes(g.id)}
                                onChange={(e) => {
                                  const newGroupIds = e.target.checked
                                    ? [...formData.group_ids, g.id]
                                    : formData.group_ids.filter((id) => id !== g.id);
                                  setFormData((prev) => ({ ...prev, group_ids: newGroupIds }));
                                }}
                                className="accent-blue-600"
                              />
                              {g.name}
                            </label>
                          ))}
                        </div>

                        ) : (
                          t.groups?.join(', ') || 'N/A'
                        )}
                      </td>
                      <td className="border p-2">
                        {editingId === t.id ? (
                          <Button onClick={() => saveEdit(t.id)} size="sm">
                            Save
                          </Button>
                        ) : (
                          <Button onClick={() => startEdit(t.id)} size="sm" variant="outline">
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
      </div>
    </div>
  );
}

export default TeachersPage;
