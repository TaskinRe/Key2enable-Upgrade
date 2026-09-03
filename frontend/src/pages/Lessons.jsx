// Lessons.jsx - Parents
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import StudentSidebar from '../components/StudentSidebar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Lessons() {
  const { user } = useUser();
  const [cachedPlans, setCachedPlans] = useState({ English: {}, Arabic: {} });
  const [language, setLanguage] = useState('English');
  const [expandedMonths, setExpandedMonths] = useState([]);

  const recentMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  const groupByWeek = (plans) => {
    const grouped = {};
    if (!Array.isArray(plans)) return grouped;
    for (const plan of plans) {
      const weekLabel = plan.week || 'General';
      if (!grouped[weekLabel]) grouped[weekLabel] = [];
      grouped[weekLabel].push(plan);
    }
    return grouped;
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchUncachedMonths = async () => {
      const updatedCache = { ...cachedPlans };
      const promises = [];

      for (const month of recentMonths) {
        if (!updatedCache[language][month]) {
          promises.push(
            axios
              .get(`${BASE_URL}/student-dashboard/lessons`, {
                params: {
                  clerk_user_id: user.id,
                  month,
                  language
                }
              })
              .then(res => {
                updatedCache[language][month] = res.data || [];
              })
              .catch(err => {
                console.error(`❌ Failed to fetch for ${month} (${language}):`, err);
                updatedCache[language][month] = [];
              })
          );
        }
      }

      await Promise.all(promises);
      setCachedPlans(updatedCache);
    };

    fetchUncachedMonths();
  }, [user, language]);

  const toggleMonth = (month) => {
    setExpandedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Lesson Plans</h1>

        <div className="mb-6 w-48">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recentMonths.map((month) => (
          <div key={month} className="mb-4 ">
            <Button
              
              className="w-full flex h-12 justify-between items-center text-lg text-black font-semibold bg-blue-50 hover:bg-gray-50"
              onClick={() => toggleMonth(month)}
            >
              <span>{month}</span>
              <ChevronDown className={`transition-transform ${expandedMonths.includes(month) ? 'rotate-180' : ''}`} />
            </Button>

            {expandedMonths.includes(month) && (
              <div className="mt-3 grid gap-4">
                {cachedPlans[language]?.[month]?.length === 0 ? (
                  <p className="text-sm text-gray-500 ml-2">No lesson plans available.</p>
                ) : (
                  Object.entries(groupByWeek(cachedPlans[language][month])).map(([week, lessons], i) => (
                    <div key={i} className="bg-white p-4 rounded shadow">
                      <h3 className="font-semibold text-md mb-2">Week {week}</h3>
                      {lessons.map((lesson, idx) => (
                        <div key={idx} className="mb-2">
                          <p className="font-medium">{lesson.category}</p>
                          <p className="text-sm text-gray-700">{lesson.content}</p>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
