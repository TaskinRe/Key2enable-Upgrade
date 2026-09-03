import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/StudentSidebar";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentQuizzes() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${BASE_URL}/student-quizzes/${user.id}`)
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error("Failed to fetch quizzes:", err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div key={q.quiz_id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{q.quiz_name}</h2>
              <p className="text-sm text-gray-500">A custom quiz</p>
              <button
                onClick={() => navigate(`/student/quizzes/take/${q.quiz_id}`)}
                className="text-blue-600 mt-2 hover:underline text-sm"
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
