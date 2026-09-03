// StudentQRCodes.jsx
// Description: Teacher page to print each student's mood-kiosk QR
// card, one group at a time.
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Sidebar from '../components/Sidebar';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function StudentQRCodes() {
  const { user, isLoaded } = useUser();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    axios
      .get(`${BASE_URL}/groups/for-teacher`, { params: { clerk_user_id: user.id } })
      .then((res) => setGroups(res.data))
      .catch((err) => console.error('Failed to load groups:', err));
  }, [isLoaded, user]);

  useEffect(() => {
    if (!selectedGroup || !user?.id) return;
    setLoading(true);
    axios
      .get(`${BASE_URL}/mood-entries/roster-qr`, {
        params: { group_id: selectedGroup, clerk_user_id: user.id },
      })
      .then((res) => setStudents(res.data))
      .catch((err) => console.error('Failed to load QR roster:', err))
      .finally(() => setLoading(false));
  }, [selectedGroup, user]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h1 className="text-2xl font-bold">Mood Kiosk QR Cards</h1>
          <div className="flex items-center gap-3">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {students.length > 0 && (
              <Button onClick={() => window.print()}>Print cards</Button>
            )}
          </div>
        </div>

        {!selectedGroup && (
          <p className="text-gray-400 text-sm">Pick a group to see student cards.</p>
        )}
        {loading && <p className="text-gray-400 text-sm">Loading…</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-center border rounded-2xl p-4 shadow-sm bg-white"
            >
              <QRCodeSVG value={s.qr_token} size={140} />
              <p className="mt-3 font-semibold text-[#1F2937]">{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentQRCodes;
