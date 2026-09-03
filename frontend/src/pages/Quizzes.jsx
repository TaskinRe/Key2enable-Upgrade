import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Sidebar from "@/components/Sidebar";
import {
  PlusCircle,
  Trash2,
  Users,
  Pencil,
  FolderPlus,
} from "lucide-react";
import QuizGroupModal from "@/components/QuizGroupModal";
import QuizFolderModal from "@/components/QuizFolderModal";
import { FaFolder } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Quizzes() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderModalOpen, setFolderModalOpen] = useState(false);

  const fetchQuizzesAndGroups = async () => {
    try {
      const [quizRes, groupRes, folderRes] = await Promise.all([
        axios.get(`${BASE_URL}/quizzes`),
        axios.get(`${BASE_URL}/groups`),
        axios.get(`${BASE_URL}/quiz-folders?clerk_user_id=${user?.id}`),
      ]);
      setQuizzes(quizRes.data);
      setGroups(groupRes.data);
      setFolders(folderRes.data);
    } catch {
      setError("Failed to fetch quizzes, groups, or folders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuizzesAndGroups();
    }
  }, [user]);

  const handleDelete = async (quiz_id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`${BASE_URL}/quizzes/${quiz_id}`);
      setQuizzes((prev) => prev.filter((q) => q.quiz_id !== quiz_id));
    } catch (err) {
      console.error(err);
      alert("❌ Could not delete quiz.");
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.quiz_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setFolderModalOpen(true)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              <FolderPlus size={18} /> New Folder
            </button>
            <button
              onClick={() => navigate("/teacher/quizzes/new")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={18} /> New Quiz
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <h2 className="text-2xl font-bold mb-10">Folders</h2>
          <div className="grid grid-cols-6 gap-x-20 gap-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() =>
                  navigate(`/teacher/quizzes/folder/${folder.id}`, {
                    state: { folder },
                  })
                }
                className="flex flex-col items-center space-y-2 cursor-pointer"
              >
                <FaFolder size={110} className="text-blue-500" />
                <span className="text-gray-700 font-medium">
                  {folder.folder_name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">All Quizzes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((q) => (
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
                  onClick={() => {
                    setSelectedQuizId(q.quiz_id);
                    setModalOpen(true);
                  }}
                  className="text-green-600 hover:text-green-800"
                  title="Assign groups"
                >
                  <Users size={16} />
                </button>

                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.quiz_id}/take`)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Take Quiz
                </button>
              </div>

              <button
                onClick={() => handleDelete(q.quiz_id)}
                className="absolute bottom-3 right-3 text-gray-400 hover:text-red-600"
                title="Delete quiz"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* <div className="pt-10">
          <h2 className="text-2xl font-bold mb-10">Folders</h2>
          <div className="grid grid-cols-6 gap-x-20 gap-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() =>
                  navigate(`/teacher/quizzes/folder/${folder.id}`, {
                    state: { folder },
                  })
                }
                className="flex flex-col items-center space-y-2 cursor-pointer"
              >
                <FaFolder size={110} className="text-blue-500" />
                <span className="text-gray-700 font-medium">
                  {folder.folder_name}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {quizzes.length === 0 && (
          <p className="text-gray-500 mt-4">
            No quizzes yet. Click “New Quiz” to start!
          </p>
        )}
      </main>

      {modalOpen && (
        <QuizGroupModal
          quizId={selectedQuizId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          allGroups={groups}
        />
      )}

      {folderModalOpen && (
        <QuizFolderModal
          isOpen={folderModalOpen}
          onClose={() => setFolderModalOpen(false)}
          onCreated={fetchQuizzesAndGroups}
        />
      )}
    </div>
  );
}
