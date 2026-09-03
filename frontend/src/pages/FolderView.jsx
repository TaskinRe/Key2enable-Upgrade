import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { Trash2, PlusCircle, Pencil, Users } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function FolderView() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const { user } = useUser();

  const [quizzes, setQuizzes] = useState([]);
  const [folder, setFolder] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFolderAndQuizzes = async () => {
    try {
      const [quizRes, folderRes, groupRes] = await Promise.all([
        axios.get(`${BASE_URL}/quizzes`),
        axios.get(`${BASE_URL}/quiz-folders?clerk_user_id=${user?.id}`),
        axios.get(`${BASE_URL}/groups`)
      ]);

      const selectedFolder = folderRes.data.find(f => f.id.toString() === folderId);
      console.log("FOLDER ID:", folderId);
console.log("All quizzes:", quizRes.data.map(q => ({ id: q.quiz_id, folder: q.folder_id })));

      const filteredQuizzes = quizRes.data.filter(q => q.folder_id?.toString() === folderId);

      setFolder(selectedFolder);
      setQuizzes(filteredQuizzes);
      setGroups(groupRes.data);
    } catch (err) {
      console.error("Error fetching folder/quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFolderAndQuizzes();
    }
  }, [user]);

  const handleDeleteFolder = async () => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;
    try {
      await axios.delete(`${BASE_URL}/quiz-folders/${folderId}`);
      navigate("/teacher/quizzes");
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("❌ Failed to delete folder");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {folder?.folder_name || "Folder"}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteFolder}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete Folder
            </button>
            <button
              onClick={() => navigate("/teacher/quizzes/new")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={18} /> Create Quiz
            </button>
            <button
              onClick={() => navigate("/teacher/quizzes")}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            >
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-600">No quizzes inside this folder yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.quiz_id}
                className="relative bg-white p-4 rounded shadow flex flex-col gap-2"
              >
                <h2 className="text-lg font-semibold">{q.quiz_name}</h2>
                <p className="text-sm text-gray-500">A custom quiz</p>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => navigate(`/teacher/quizzes/${q.quiz_id}/edit`)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit quiz"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => navigate(`/teacher/quizzes/${q.quiz_id}/take`)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Take Quiz
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (!window.confirm("Delete this quiz?")) return;
                    axios.delete(`${BASE_URL}/quizzes/${q.quiz_id}`).then(() => {
                      setQuizzes(prev => prev.filter(qz => qz.quiz_id !== q.quiz_id));
                    });
                  }}
                  className="absolute bottom-3 right-3 text-gray-400 hover:text-red-600"
                  title="Delete quiz"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
