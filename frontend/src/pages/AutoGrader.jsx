// import { useState, useEffect } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function AutoGrader() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [month, setMonth] = useState("June 2025");
//   const [language, setLanguage] = useState("English");
//   const [groupId, setGroupId] = useState("");
//   const [groupOptions, setGroupOptions] = useState([]);
//   const { user } = useUser();

//   useEffect(() => {
//     if (!user?.id) return;

//     axios
//       .get(`${BASE_URL}/groups/for-teacher`, {
//         params: { clerk_user_id: user.id },
//       })
//       .then((res) => {
//         setGroupOptions(res.data);
//         if (res.data.length > 0) setGroupId(res.data[0].id);
//       })
//       .catch((err) => {
//         console.error("Error fetching groups:", err);
//         setStatus("❌ Failed to fetch group list.");
//       });
//   }, [user]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file || !groupId) return;

//     const formData = new FormData();
//     formData.append("worksheet", file);
//     formData.append("month", month);
//     formData.append("language", language);
//     formData.append("group_id", groupId);

//     setStatus("Grading...");

//     try {
//       const res = await axios.post(`${BASE_URL}/auto-grade`, formData);
//       const { graded, student_name } = res.data;

//       if (!student_name) {
//         setStatus("❌ Failed to extract student name");
//         return;
//       }

//       const assessmentPromises = graded.map((entry) =>
//         axios.post(`${BASE_URL}/assessments`, {
//           student_name,
//           category: entry.letter,
//           raw_score: entry.correct ? 1 : 0,
//           max_score: 1,
//           language,
//           month,
//           group_id: groupId,
//         })
//       );

//       await Promise.all(assessmentPromises);
//       setStatus(`✅ Successfully stored scores for ${student_name}`);
//     } catch (err) {
//       console.error("❌ Upload or grading failed:", err);
//       setStatus("❌ Grading failed");
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-semibold mb-4">Auto Grader</h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="file"
//             accept="image/png, image/jpeg"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="border p-2 rounded w-full max-w-sm"
//           />

//           <select
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border p-2 rounded"
//           >
//             {["April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>

//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="English">English</option>
//             <option value="Arabic">Arabic</option>
//           </select>

//           <select
//             value={groupId}
//             onChange={(e) => setGroupId(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Select Group</option>
//             {groupOptions.map((g) => (
//               <option key={g.id} value={g.id}>
//                 {g.name}
//               </option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Submit
//           </button>
//         </form>

//         {status && <p className="mt-4 text-lg">{status}</p>}
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function AutoGrader() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [statusType, setStatusType] = useState("info"); // success | error | info
//   const [month, setMonth] = useState("June 2025");
//   const [language, setLanguage] = useState("English");
//   const [groupId, setGroupId] = useState("");
//   const [groupOptions, setGroupOptions] = useState([]);
//   const [studentName, setStudentName] = useState("");
//   const [score, setScore] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { user } = useUser();
//   const [comingSoon, setComingSoon] = useState(true);


//   useEffect(() => {
//     if (!user?.id) return;

//     axios
//       .get(`${BASE_URL}/groups/for-teacher`, {
//         params: { clerk_user_id: user.id },
//       })
//       .then((res) => {
//         setGroupOptions(res.data);
//         if (res.data.length > 0) setGroupId(res.data[0].id);
//       })
//       .catch((err) => {
//         console.error("Error fetching groups:", err);
//         setStatusType("error");
//         setStatus("❌ Failed to fetch group list.");
//       });
//   }, [user]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file || !groupId) {
//       setStatusType("error");
//       setStatus("❌ Please select a file and group.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("worksheet", file);
//     formData.append("month", month);
//     formData.append("language", language);
//     formData.append("group_id", groupId);

//     setLoading(true);
//     setStatus("Grading...");
//     setStatusType("info");
//     setStudentName("");
//     setScore(null);

//     try {
//       const res = await axios.post(`${BASE_URL}/auto-grade`, formData);
//       console.log("✅ Auto-grade response:", res.data);

//       const { student_name, raw_score, max_score, success } = res.data;

//       if (!success || !student_name || raw_score === undefined || max_score === undefined) {
//         setStatusType("error");
//         setStatus("❌ Grading failed: no valid scores returned.");
//         return;
//       }

//       setStudentName(student_name);
//       setScore({ raw_score, max_score });

//       await axios.post(`${BASE_URL}/assessments`, {
//         student_name,
//         category: "Worksheet",
//         raw_score,
//         max_score,
//         language,
//         month,
//         group_id: groupId,
//       });

//       setStatusType("success");
//       setStatus(`✅ Successfully stored scores for ${student_name}`);
//     } catch (err) {
//       console.error("❌ Upload or grading failed:", err);
//       setStatusType("error");
//       setStatus("❌ Grading failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-semibold mb-4">Auto Grader</h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="file"
//             accept="image/png, image/jpeg"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="border p-2 rounded w-full max-w-sm"
//           />

//           <select
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border p-2 rounded"
//           >
//             {["April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>

//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="English">English</option>
//             <option value="Arabic">Arabic</option>
//           </select>

//           <select
//             value={groupId}
//             onChange={(e) => setGroupId(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Select Group</option>
//             {groupOptions.map((g) => (
//               <option key={g.id} value={g.id}>
//                 {g.name}
//               </option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             disabled={loading}
//           >
//             {loading ? "Grading..." : "Submit"}
//           </button>
//         </form>

//         {status && (
//           <p
//             className={`mt-4 text-lg font-medium ${
//               statusType === "error"
//                 ? "text-red-600"
//                 : statusType === "success"
//                 ? "text-green-600"
//                 : "text-gray-600"
//             }`}
//           >
//             {status}
//           </p>
//         )}

//         {studentName && score && (
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold mb-2">
//               📄 Score for {studentName}
//             </h2>
//             <p className="bg-gray-100 p-4 rounded shadow text-lg">
//               Raw Score: <strong>{score.raw_score}</strong> / {score.max_score}
//             </p>
//           </div>
//         )}
//       </div>
//       {comingSoon && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/60">
//     <div className="text-center">
//       <img
//         src="../assets/k2e-logo.png"
//         alt="Key2Enable Logo"
//         className="w-24 mx-auto mb-4"
//       />
//       <h2 className="text-3xl font-bold text-gray-800">Coming Soon...</h2>
//       <p className="text-md text-gray-600 mt-2">This feature is under development</p>
//     </div>
//   </div>
// )}

//     </div>
//   );
// }


// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// import worker from 'pdfjs-dist/legacy/build/pdf.worker.entry?url';

// pdfjsLib.GlobalWorkerOptions.workerSrc = worker;


// import { useState, useEffect } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function AutoGrader() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [statusType, setStatusType] = useState("info"); // success | error | info
//   const [month, setMonth] = useState("June 2025");
//   const [language, setLanguage] = useState("English");
//   const [groupId, setGroupId] = useState("");
//   const [groupOptions, setGroupOptions] = useState([]);
//   const [studentName, setStudentName] = useState("");
//   const [score, setScore] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { user } = useUser();

//   useEffect(() => {
//     if (!user?.id) return;

//     axios
//       .get(`${BASE_URL}/groups/for-teacher`, {
//         params: { clerk_user_id: user.id },
//       })
//       .then((res) => {
//         setGroupOptions(res.data);
//         if (res.data.length > 0) setGroupId(res.data[0].id);
//       })
//       .catch((err) => {
//         console.error("Error fetching groups:", err);
//         setStatusType("error");
//         setStatus("❌ Failed to fetch group list.");
//       });
//   }, [user]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file || !groupId) {
//       setStatus("❌ Please select a file and group.");
//       return;
//     }

//     setStatus("Processing...");
//     setLoading(true);

//     const isPDF = file.type === "application/pdf";
//     const formData = new FormData();
//     formData.append("month", month);
//     formData.append("language", language);
//     formData.append("group_id", groupId);

//     if (isPDF) {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//       const page = await pdf.getPage(1);

//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext("2d");
//       const viewport = page.getViewport({ scale: 2 });
//       canvas.width = viewport.width;
//       canvas.height = viewport.height;

//       await page.render({ canvasContext: context, viewport }).promise;

//       const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
//       formData.append("worksheet", blob, "converted.png");
//     } else {
//       formData.append("worksheet", file);
//     }

//     try {
//       const res = await axios.post(`${BASE_URL}/auto-grade`, formData);
//       console.log("✅ Auto-grade response:", res.data);

//       const { student_name, raw_score, max_score, success } = res.data;

//       if (!success || !student_name || raw_score === undefined || max_score === undefined) {
//         setStatusType("error");
//         setStatus("❌ Grading failed: no valid scores returned.");
//         return;
//       }

//       setStudentName(student_name);
//       setScore({ raw_score, max_score });

//       await axios.post(`${BASE_URL}/assessments`, {
//         student_name,
//         category: "Worksheet",
//         raw_score,
//         max_score,
//         language,
//         month,
//         group_id: groupId,
//       });

//       setStatusType("success");
//       setStatus(`✅ Successfully stored scores for ${student_name}`);
//     } catch (err) {
//       console.error("❌ Upload or grading failed:", err);
//       setStatusType("error");
//       setStatus("❌ Grading failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-semibold mb-4">Auto Grader</h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="file"
//             accept="image/png, image/jpeg, application/pdf"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="border p-2 rounded w-full max-w-sm"
//           />

//           <select
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border p-2 rounded"
//           >
//             {["April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>

//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="English">English</option>
//             <option value="Arabic">Arabic</option>
//           </select>

//           <select
//             value={groupId}
//             onChange={(e) => setGroupId(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Select Group</option>
//             {groupOptions.map((g) => (
//               <option key={g.id} value={g.id}>
//                 {g.name}
//               </option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             disabled={loading}
//           >
//             {loading ? "Grading..." : "Submit"}
//           </button>
//         </form>

//         {status && (
//           <p
//             className={`mt-4 text-lg font-medium ${
//               statusType === "error"
//                 ? "text-red-600"
//                 : statusType === "success"
//                 ? "text-green-600"
//                 : "text-gray-600"
//             }`}
//           >
//             {status}
//           </p>
//         )}

//         {studentName && score && (
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold mb-2">
//               📄 Score for {studentName}
//             </h2>
//             <p className="bg-gray-100 p-4 rounded shadow text-lg">
//               Raw Score: <strong>{score.raw_score}</strong> / {score.max_score}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// AutoGrader.jsx with pdf-lib (no pdfjs-dist)

// import { PDFDocument } from 'pdf-lib';
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function AutoGrader() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [statusType, setStatusType] = useState("info");
//   const [month, setMonth] = useState("June 2025");
//   const [language, setLanguage] = useState("English");
//   const [groupId, setGroupId] = useState("");
//   const [groupOptions, setGroupOptions] = useState([]);
//   const [studentName, setStudentName] = useState("");
//   const [score, setScore] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { user } = useUser();

//   useEffect(() => {
//     if (!user?.id) return;

//     axios
//       .get(`${BASE_URL}/groups/for-teacher`, {
//         params: { clerk_user_id: user.id },
//       })
//       .then((res) => {
//         setGroupOptions(res.data);
//         if (res.data.length > 0) setGroupId(res.data[0].id);
//       })
//       .catch((err) => {
//         console.error("Error fetching groups:", err);
//         setStatusType("error");
//         setStatus("❌ Failed to fetch group list.");
//       });
//   }, [user]);

//   const extractTextFromPDF = async (file) => {
//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       const pages = pdfDoc.getPages();
//       const text = await Promise.all(
//         pages.map(async (page) => await page.getTextContent?.())
//       );
//       return text.join("\n");
//     } catch (err) {
//       console.error("Error extracting text from PDF:", err);
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file || !groupId) {
//       setStatus("❌ Please select a file and group.");
//       return;
//     }

//     setStatus("Processing...");
//     setLoading(true);

//     const isPDF = file.type === "application/pdf";
//     const formData = new FormData();
//     formData.append("month", month);
//     formData.append("language", language);
//     formData.append("group_id", groupId);

//     if (isPDF) {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       const pngBytes = await pdfDoc.saveAsBase64({ dataUri: true });
//       const blob = await (await fetch(pngBytes)).blob();
//       formData.append("worksheet", blob, "converted.png");
//     } else {
//       formData.append("worksheet", file);
//     }

//     try {
//       const res = await axios.post(`${BASE_URL}/auto-grade`, formData);
//       console.log("✅ Auto-grade response:", res.data);

//       const { student_name, raw_score, max_score, success } = res.data;

//       if (!success || !student_name || raw_score === undefined || max_score === undefined) {
//         setStatusType("error");
//         setStatus("❌ Grading failed: no valid scores returned.");
//         return;
//       }

//       setStudentName(student_name);
//       setScore({ raw_score, max_score });

//       await axios.post(`${BASE_URL}/assessments`, {
//         student_name,
//         category: "Worksheet",
//         raw_score,
//         max_score,
//         language,
//         month,
//         group_id: groupId,
//       });

//       setStatusType("success");
//       setStatus(`✅ Successfully stored scores for ${student_name}`);
//     } catch (err) {
//       console.error("❌ Upload or grading failed:", err);
//       setStatusType("error");
//       setStatus("❌ Grading failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-semibold mb-4">Auto Grader</h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="file"
//             accept="image/png, image/jpeg, application/pdf"
//             onChange={(e) => setFile(e.target.files[0])}
//             className="border p-2 rounded w-full max-w-sm"
//           />

//           <select
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border p-2 rounded"
//           >
//             {["April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>

//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="English">English</option>
//             <option value="Arabic">Arabic</option>
//           </select>

//           <select
//             value={groupId}
//             onChange={(e) => setGroupId(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option value="">Select Group</option>
//             {groupOptions.map((g) => (
//               <option key={g.id} value={g.id}>
//                 {g.name}
//               </option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             disabled={loading}
//           >
//             {loading ? "Grading..." : "Submit"}
//           </button>
//         </form>

//         {status && (
//           <p
//             className={`mt-4 text-lg font-medium ${
//               statusType === "error"
//                 ? "text-red-600"
//                 : statusType === "success"
//                 ? "text-green-600"
//                 : "text-gray-600"
//             }`}
//           >
//             {status}
//           </p>
//         )}

//         {studentName && score && (
//           <div className="mt-6">
//             <h2 className="text-xl font-semibold mb-2">
//               📄 Score for {studentName}
//             </h2>
//             <p className="bg-gray-100 p-4 rounded shadow text-lg">
//               Raw Score: <strong>{score.raw_score}</strong> / {score.max_score}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useUser } from "@clerk/clerk-react";
import logo from "../assets/k2e-logo.png"; // make sure the path is correct

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AutoGrader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [month, setMonth] = useState("June 2025");
  const [language, setLanguage] = useState("English");
  const [groupId, setGroupId] = useState("");
  const [groupOptions, setGroupOptions] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [comingSoon, setComingSoon] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`${BASE_URL}/groups/for-teacher`, {
        params: { clerk_user_id: user.id },
      })
      .then((res) => {
        setGroupOptions(res.data);
        if (res.data.length > 0) setGroupId(res.data[0].id);
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
        setStatusType("error");
        setStatus("❌ Failed to fetch group list.");
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !groupId) {
      setStatusType("error");
      setStatus("❌ Please select a file and group.");
      return;
    }

    const formData = new FormData();
    formData.append("worksheet", file);
    formData.append("month", month);
    formData.append("language", language);
    formData.append("group_id", groupId);

    setLoading(true);
    setStatus("Grading...");
    setStatusType("info");
    setStudentName("");
    setScore(null);

    try {
      const res = await axios.post(`${BASE_URL}/auto-grade`, formData);
      console.log("✅ Auto-grade response:", res.data);

      const { student_name, raw_score, max_score, success } = res.data;

      if (!success || !student_name || raw_score === undefined || max_score === undefined) {
        setStatusType("error");
        setStatus("❌ Grading failed: no valid scores returned.");
        return;
      }

      setStudentName(student_name);
      setScore({ raw_score, max_score });

      await axios.post(`${BASE_URL}/assessments`, {
        student_name,
        category: "Worksheet",
        raw_score,
        max_score,
        language,
        month,
        group_id: groupId,
      });

      setStatusType("success");
      setStatus(`✅ Successfully stored scores for ${student_name}`);
    } catch (err) {
      console.error("❌ Upload or grading failed:", err);
      setStatusType("error");
      setStatus("❌ Grading failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Wrap main content with relative positioning */}
      <div className="flex-1 p-6 relative">
        <h1 className="text-2xl font-semibold mb-4">Auto Grader</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded w-full max-w-sm"
          />

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          >
            {["April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
          </select>

          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Group</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Grading..." : "Submit"}
          </button>
        </form>

        {status && (
          <p
            className={`mt-4 text-lg font-medium ${
              statusType === "error"
                ? "text-red-600"
                : statusType === "success"
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            {status}
          </p>
        )}

        {studentName && score && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">
              📄 Score for {studentName}
            </h2>
            <p className="bg-gray-100 p-4 rounded shadow text-lg">
              Raw Score: <strong>{score.raw_score}</strong> / {score.max_score}
            </p>
          </div>
        )}

        {/* COMING SOON OVERLAY */}
        {comingSoon && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/60 rounded">
            <div className="text-center">
              <img
                src={logo}
                alt="Key2Enable Logo"
                className="w-24 mx-auto mb-4"
              />
              <h2 className="text-3xl text-gray-800">Coming Soon...</h2>
              <p className="text-md text-gray-600 mt-2">
                This feature is under development
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
