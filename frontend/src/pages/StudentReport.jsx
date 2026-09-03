//StudentReport.jsx
// Description: This component fetches and displays monthly reports for a student, allowing them to expand each month to view the report content.

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import StudentSidebar from "../components/StudentSidebar";
// import { useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/ui/button";
// import { ChevronDown } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// function StudentReport() {
//   const { user } = useUser();
//   const [studentId, setStudentId] = useState(null);
//   const [reportsByMonth, setReportsByMonth] = useState({});
//   const [expandedMonths, setExpandedMonths] = useState([]);

//   const recentMonths = Array.from({ length: 6 }, (_, i) => {
//     const date = new Date();
//     date.setMonth(date.getMonth() - i);
//     return date.toLocaleString("default", { month: "long", year: "numeric" });
//   });

//   useEffect(() => {
//     const fetchReports = async () => {
//       if (!user?.id) return;

//       try {
//         const studentRes = await axios.get(`${BASE_URL}/students`);
//         const match = studentRes.data.find((s) => s.clerk_user_id === user.id);
//         if (!match) return;
//         setStudentId(match.id);

//         const allReports = {};
//         for (const month of recentMonths) {
//           try {
//             const reportRes = await axios.get(`${BASE_URL}/reports`, {
//               params: { student_id: match.id, month },
//             });
//             allReports[month] = reportRes.data?.content || "";
//           } catch (err) {
//             console.error(`Failed to fetch report for ${month}`, err);
//             allReports[month] = "";
//           }
//         }
//         setReportsByMonth(allReports);
//       } catch (error) {
//         console.error("Error fetching student ID:", error);
//       }
//     };

//     fetchReports();
//   }, [user]);

//   const toggleMonth = (month) => {
//     setExpandedMonths((prev) =>
//       prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
//     );
//   };

//   return (
//     <div className="flex">
//       <StudentSidebar />
//       <div className="p-6 flex-1">
//         <h1 className="text-2xl font-bold mb-6">Monthly Reports</h1>

//         {recentMonths.map((month) => (
//           <div key={month} className="mb-4">
//             <Button
//               className="w-full flex h-12 justify-between items-center text-lg text-black font-semibold bg-blue-50 hover:bg-gray-50"
//               onClick={() => toggleMonth(month)}
//             >
//               <span>{month}</span>
//               <ChevronDown
//                 className={`transition-transform ${
//                   expandedMonths.includes(month) ? "rotate-180" : ""
//                 }`}
//               />
//             </Button>

//             {expandedMonths.includes(month) && (
//               <div className="mt-2 bg-white p-4 rounded shadow border whitespace-pre-line">
//                 {reportsByMonth[month] ? (
//                   reportsByMonth[month]
//                 ) : (
//                   <em>No report available for this month.</em>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default StudentReport;


import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentSidebar from "../components/StudentSidebar";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { decodeHtml } from "@/utils/decodeHTML";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function StudentReport() {
  const { user } = useUser();
  const [studentId, setStudentId] = useState(null);
  const [reportsByMonth, setReportsByMonth] = useState({});
  const [expandedMonths, setExpandedMonths] = useState([]);

  const recentMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  });

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) return;

      try {
        const studentRes = await axios.get(`${BASE_URL}/students`);
        const match = studentRes.data.find((s) => s.clerk_user_id === user.id);
        if (!match) return;
        setStudentId(match.id);

        const allReports = {};
        for (const month of recentMonths) {
          try {
            const reportRes = await axios.get(`${BASE_URL}/reports`, {
              params: { student_id: match.id, month },
            });

            allReports[month] = {
              en: reportRes.data?.content || "",
              ar: reportRes.data?.content_arabic || "",
            };
          } catch (err) {
            console.error(`Failed to fetch report for ${month}`, err);
            allReports[month] = { en: "", ar: "" };
          }
        }
        setReportsByMonth(allReports);
      } catch (error) {
        console.error("Error fetching student ID:", error);
      }
    };

    fetchReports();
  }, [user]);

  const toggleMonth = (month) => {
    setExpandedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Monthly Reports</h1>

        {recentMonths.map((month) => (
          <div key={month} className="mb-4">
            <Button
              className="w-full flex h-12 justify-between items-center text-lg text-black font-semibold bg-blue-50 hover:bg-gray-50"
              onClick={() => toggleMonth(month)}
            >
              <span>{month}</span>
              <ChevronDown
                className={`transition-transform ${
                  expandedMonths.includes(month) ? "rotate-180" : ""
                }`}
              />
            </Button>

            {expandedMonths.includes(month) && (
              <div className="mt-2 bg-white p-4 rounded shadow border whitespace-pre-line">
                {reportsByMonth[month]?.en ? (
                  <>
                    {reportsByMonth[month].en}

                    {reportsByMonth[month].ar && (
                      <>
                        <hr className="my-4" />
                        <h3 className="font-semibold mb-2">Arabic Version:</h3>
                        {decodeHtml(reportsByMonth[month].ar)}
                      </>
                    )}
                  </>
                ) : (
                  <em>No report available for this month.</em>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentReport;
