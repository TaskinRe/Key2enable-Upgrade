// src/components/quiz/QuizBuilderCore.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Trash2, Plus, Save } from "lucide-react";
import axios from "axios";
import imageIcon from "@/assets/image-icon.png"; 

import shape1 from "@/assets/shape1.png";
import shape2 from "@/assets/shape2.png";
import shape3 from "@/assets/shape3.png";
import shape4 from "@/assets/shape4.png";
import shape5 from "@/assets/shape5.png";
import shape6 from "@/assets/shape6.png";
import shape7 from "@/assets/shape7.png";
import shape8 from "@/assets/shape8.png";
import shape9 from "@/assets/shape9.png";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const icons = [shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9];
const iconColors = [
  "bg-[#1E78C8]", // triangle (blue)
  "bg-[#5E2B90]", // star (purple)
  "bg-[#D061A8]", // teardrop (pink)
  "bg-[#38A24E]", // plus (green)
  "bg-[#3E3D3F]", // fork-like (dark grey)
  "bg-[#C8422B]", // x-shape (red)
  "bg-[#F0DF3A]", // moon (yellow)
  "bg-[#E28C2C]", // lightning bolt (orange)
  "bg-[#8C6849]", // diamond (brown)
];



export default function QuizBuilderCore({ mode = "new", quizId = null }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Enter Quiz title…");
  const [questions, setQuestions] = useState([
    { id: 1, text: "", answers: [{ answer_text: "" }, { answer_text: "" }], correct: [], image: null },
  ]);
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(mode === "edit");

  const q = questions.find((x) => x.id === active);
  const mutate = (fn) =>
    setQuestions((prev) => prev.map((o) => (o.id === active ? fn(o) : o)));

  useEffect(() => {
    if (mode !== "edit" || !quizId) return;
    (async () => {
      try {
        const { data: quiz } = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
        setTitle(quiz.title || "");
        const loaded = quiz.slides.map((s, idx) => ({
          id: idx + 1,
          text: s.text,
          image: s.image || null,
          answers: s.answers.map((a) =>
            typeof a === "string" ? { answer_text: a } : a
          ),
          correct: s.correct,
        }));
        setQuestions(loaded.length ? loaded : [{ id: 1, text: "", answers: [{ answer_text: "" }, { answer_text: "" }], correct: [], image: null }]);
      } catch (err) {
        alert("❌ Could not load quiz.");
        navigate("/teacher/quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, quizId]);

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { id: prev.length + 1, text: "", answers: [{ answer_text: "" }, { answer_text: "" }], correct: [], image: null },
    ]);

  const uploadImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => mutate((o) => ({ ...o, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const slides = questions.map((q) => ({
        text: q.text,
        answers: q.answers,
        correct: q.correct,
        image: q.image,
      }));

      if (!title.trim() || slides.length === 0) {
        alert("❌ Please provide a title and at least one question.");
        return;
      }

      if (mode === "edit" && quizId) {
        await axios.put(`${BASE_URL}/quizzes/${quizId}`, {
          quiz_name: title,
          slides,
        });
      } else {
        await axios.post(`${BASE_URL}/quizzes`, {
          title,
          description: "A custom quiz",
          slides,
        });
      }

      navigate("/teacher/quizzes");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save quiz.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f9fbff]">
      <header className="flex items-center gap-4 px-4 py-2 border-b bg-white">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-gray-100 rounded px-3 py-1 text-sm font-semibold"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          <Save size={14} /> Save Quiz
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r p-3 space-y-2 overflow-y-auto">
          {questions.map((itm) => (
            <div key={itm.id} className="flex gap-2">
              <button
                onClick={() => setActive(itm.id)}
                className={`flex-1 text-left text-sm px-3 py-2 border rounded ${
                  itm.id === active ? "border-blue-600 bg-blue-50" : "hover:bg-gray-100"
                }`}
              >
                {itm.id}. Question
              </button>
              {questions.length > 1 && (
                <button
                  onClick={() =>
                    setQuestions((prev) => prev.filter((x) => x.id !== itm.id))
                  }
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addQuestion}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded"
          >
            + Add question
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <input
            value={q.text}
            onChange={(e) => mutate((o) => ({ ...o, text: e.target.value }))}
            placeholder="Start typing your question"
            className="w-full text-center text-xl font-semibold border rounded py-3 mb-6"
          />

          <div className="w-[420px] h-[220px] border-2 border-dashed flex flex-col items-center justify-center rounded bg-white mb-8">
            {q.image ? (
              <img src={q.image} alt="uploaded" className="max-h-full" />
            ) : (
              <>
                <UploadCloud size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Find and insert media</p>
                <label className="text-blue-600 underline text-sm cursor-pointer">
                  Upload file
                  <input type="file" accept="image/*" onChange={uploadImg} className="hidden" />
                </label>
                <p className="text-xs text-gray-400 mt-1">or drag here to upload</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-6">
            {q.answers.map((ans, i) => (
              <div key={i} className="flex w-full border rounded overflow-hidden bg-white items-center">
                {/* Colored shape icon */}
                <div
                    className={`w-14 h-full flex items-center justify-center bg-white border-r ${
                      iconColors[i % iconColors.length]

                    }`}
                  >
                    <img src={icons[i % icons.length]} alt="icon" className="w-6 h-6" />
                  </div>


                {/* Text input */}
                <input
                  value={typeof ans === "string" ? ans : ans.answer_text}
                  onChange={(e) =>
                    mutate((o) => {
                      const updatedAnswers = [...o.answers];
                      updatedAnswers[i] = {
                        ...updatedAnswers[i],
                        answer_text: e.target.value,
                      };
                      return { ...o, answers: updatedAnswers };
                    })
                  }
                  placeholder={`Answer ${i + 1}`}
                  className="flex-1 px-3 py-2 text-sm"
                />

                {/* Image upload icon */}
                <label className="px-2 cursor-pointer text-gray-500 hover:text-blue-600">
                  <img src={imageIcon} alt="upload" className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        mutate((o) => {
                          const updatedAnswers = [...o.answers];
                          updatedAnswers[i] = {
                            ...updatedAnswers[i],
                            image: reader.result,
                          };
                          return { ...o, answers: updatedAnswers };
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Answer image thumbnail */}
                {ans.image && (
                  <img
                    src={ans.image}
                    alt="answer"
                    className="w-10 h-10 object-cover rounded mr-2"
                  />
                )}

                {/* Correct checkbox */}
                <label className="border-l flex items-center px-3 bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.correct.includes(i)}
                    onChange={() =>
                      mutate((o) => {
                        const updated = o.correct.includes(i)
                          ? o.correct.filter((idx) => idx !== i)
                          : [...o.correct, i];
                        return { ...o, correct: updated };
                      })
                    }
                  />
                </label>

                {/* Delete button */}
                <button
                  onClick={() =>
                    mutate((o) => {
                      const newAnswers = o.answers.filter((_, idx) => idx !== i);
                      const newCorrect = o.correct
                        .filter((idx) => idx !== i)
                        .map((idx) => (idx > i ? idx - 1 : idx));
                      return { ...o, answers: newAnswers, correct: newCorrect };
                    })
                  }
                  className="border-l px-3 text-gray-400 hover:text-red-600 bg-gray-50"
                  title="Delete answer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

          </div>

          <button
            onClick={() =>
              mutate((o) => ({
                ...o,
                answers: [...o.answers, { answer_text: "" }],
              }))
            }
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded flex items-center gap-1"
          >
            <Plus size={14} /> Add more answers
          </button>
        </main>
      </div>
    </div>
  );
}
