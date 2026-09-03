// src/pages/QuizResults.jsx
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';

import shape1 from "../assets/shape1.png";
import shape2 from "../assets/shape2.png";
import shape3 from "../assets/shape3.png";
import shape4 from "../assets/shape4.png";
import shape5 from "../assets/shape5.png";
import shape6 from "../assets/shape6.png";
import shape7 from "../assets/shape7.png";
import shape8 from "../assets/shape8.png";
import shape9 from "../assets/shape9.png";


export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    score = 0,
    total = 0,
    answers = [], // [{ question, image?, selectedIndexes, correctIndexes, allAnswers }]
  } = location.state || {};

  const ICONS = [shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9];
  const colors = ["red", "blue", "yellow", "green"];

  const handleDownload = () => {
    const el = document.getElementById("pdf-content");
    const opt = {
      margin: 0.3,
      filename: `quiz-results-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(el).save();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f9fafb] px-4 py-10">
      <div id="pdf-content" className="w-full max-w-4xl space-y-10">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-2">🎉 Quiz Completed!</h1>
          <p className="text-lg">
            You got <span className="font-semibold">{score}</span> out of{" "}
            <span className="font-semibold">{total}</span> correct.
          </p>
        </div>

        {answers.map((q, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">
              Q{idx + 1}: {q.question}
            </h2>

            {q.image && (
              <img
                src={q.image}
                alt={`Q${idx + 1}`}
                className="mx-auto mb-4 rounded max-h-64"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.allAnswers.map((ans, i) => {
                const isCorrect = q.correctIndexes.includes(i);
                const isSelected = q.selectedIndexes.includes(i);
                const image = ans.image || ans.image_url || null;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border
                      ${isCorrect ? "border-green-500" : "border-gray-300"}
                      ${isSelected ? "bg-purple-100" : "bg-white"}`}
                  >
                    <img
                      src={ICONS[i % ICONS.length]}
                      alt="icon"
                      className="w-6 h-6"
                    />

                    {image && (
                      <img
                        src={image}
                        alt={`Answer ${i + 1}`}
                        className="w-8 h-8 object-cover rounded bg-white p-1"
                      />
                    )}

                    {typeof ans.answer_text === "string" && ans.answer_text.trim() !== "" && (
                      <span>{ans.answer_text}</span>
                    )}

                    {isCorrect && (
                      <span className="text-green-600 ml-auto">(Correct)</span>
                    )}

                    {isSelected && !isCorrect && (
                      <span className="text-red-500 ml-auto">(Your Answer)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Download PDF
        </button>
        <button
          onClick={() => navigate("/teacher/quizzes")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Go Back to Quiz Page
        </button>
      </div>
    </div>
  );
}
