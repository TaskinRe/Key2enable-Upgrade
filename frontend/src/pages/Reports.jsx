// Reports.jsx - teachers can generate, view, edit and manage student reports

import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { translateText } from "@/utils/translateText";
import { decodeHtml } from "@/utils/decodeHTML";
import { downloadReportPDF } from "@/utils/downloadReportPDF";
import { downloadStudentStylePNG } from "@/utils/downloadReportPNG";
import logo from '../assets/k2e-logo.png';
import header from '../assets/header-strip.png';
import footer from '../assets/footer-strip.png';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Reports() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [month, setMonth] = useState("May 2025");
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState(false);
  const [reportEn, setReportEn] = useState("");
  const [reportAr, setReportAr] = useState("");
  const [editing, setEditing] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const { user } = useUser();
  const teacherName = user?.fullName || "Teacher";

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await axios.get(`${BASE_URL}/groups/for-teacher`, {
        params: { clerk_user_id: user.id },
      });
      setGroups(res.data);
      const stored = localStorage.getItem("reportsGroupId");
      const validGroup = res.data.find((g) => g.id === stored);
      const initialGroupId = validGroup ? validGroup.id : res.data[0]?.id || "";
      setSelectedGroupId(initialGroupId);
    };
    if (user?.id) fetchGroups();
  }, [user]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroupId) return;
      const res = await axios.get(`${BASE_URL}/students`, {
        params: { group_id: selectedGroupId },
      });
      setStudents(res.data);
      const storedStudentId = localStorage.getItem("reportsStudentId");
      const validStudent = res.data.find((s) => s.id === storedStudentId);
      const initialStudentId = validStudent ? validStudent.id : res.data[0]?.id || "";
      setSelectedStudentId(initialStudentId);
    };
    fetchStudents();
  }, [selectedGroupId]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchDetails = async () => {
      const res = await axios.get(`${BASE_URL}/reports`, {
        params: { student_id: selectedStudentId, month },
      });
      setComment(res.data?.teacher_comment || "");
      setReportEn(res.data?.content || "");
      setReportAr(res.data?.content_arabic || "");
    };
    fetchDetails();
  }, [selectedStudentId, month]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
        student_id: selectedStudentId,
        month,
        clerk_user_id: user.id,
      });
      setReportEn(res.data.report);
    } catch {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateToArabic = async () => {
    try {
      setTranslating(true);
      const translated = await translateText(reportEn, "ar");
      setReportAr(translated);

      await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
        student_id: selectedStudentId,
        month,
        content_arabic: translated,
      });
    } catch {
      alert("Failed to translate to Arabic");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    try {
      const endpoint = activeLang === "en" ? "edit-content" : "edit-arabic";
      const contentField = activeLang === "en" ? { content: reportEn } : { content_arabic: reportAr };
      await axios.post(`${BASE_URL}/ai-reports/${endpoint}`, {
        student_id: selectedStudentId,
        month,
        ...contentField,
        generated_by: teacherName,
      });
      setEditing(false);
    } catch {
      alert("Failed to save changes");
    }
  };

  const handleSaveComment = async () => {
    try {
      await axios.post(`${BASE_URL}/ai-reports/comment`, {
        student_id: selectedStudentId,
        month,
        teacher_comment: comment,
        generated_by: teacherName,
      });
      setEditingComment(false);
    } catch {
      alert("Failed to save comment");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" /> Student Reports
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025", "August 2025", "September 2025","October 2025", "November 2025", "December 2025"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGroupId} onValueChange={(value) => {
            setSelectedGroupId(value);
            localStorage.setItem("reportsGroupId", value);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudentId} onValueChange={(value) => {
            setSelectedStudentId(value);
            localStorage.setItem("reportsStudentId", value);
          }}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Comment */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
          {editingComment ? (
            <>
              <textarea
                className="w-full border p-2 rounded"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button className="bg-green-600 text-white" onClick={handleSaveComment}>Save</Button>
                <Button variant="outline" onClick={() => setEditingComment(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="flex justify-between gap-2">
              <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">
                {comment || <em>Add a comment for this student.</em>}
              </p>
              <Button className="bg-blue-600 text-white" onClick={() => setEditingComment(true)}>Edit</Button>
            </div>
          )}
        </div>

        {/* AI Report */}
        <div>
          <h2 className="font-semibold text-lg mb-2">AI Report</h2>

          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-600 text-white"
            >
              {loading ? "Generating..." : "Generate AI Report"}
            </Button>

            {/* PDF Download */}
            {/* <Button
              onClick={() =>
                downloadReportPDF(
                  students.find((s) => s.id === selectedStudentId)?.name || "Student",
                  month,
                  reportEn || "No English report yet.",
                  reportAr || "No Arabic report yet."
                )
              }
              variant="outline"
              className="bg-blue-600 text-white"
            >
              <Download className="w-5 h-5" />
            </Button> */}
            
            {/* PNG Download */}
            <Button
              onClick={() =>
                downloadStudentStylePNG(
                  "studentStyleReport",
                  students.find((s) => s.id === selectedStudentId)?.name || "Student",
                  month
                )
              }
              className="bg-blue-600 text-white"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-2 mb-2">
            <Button
              variant={activeLang === "en" ? "default" : "outline"}
              onClick={() => setActiveLang("en")}
            >
              English
            </Button>
            <Button
              variant={activeLang === "ar" ? "default" : "outline"}
              onClick={() => setActiveLang("ar")}
            >
              Arabic
            </Button>
          </div>

          <div className="border bg-white p-4 rounded shadow min-h-[150px]">
            {editing ? (
              <>
                <textarea
                  className="w-full border p-2 rounded"
                  rows={8}
                  value={activeLang === "en" ? reportEn : reportAr}
                  onChange={(e) =>
                    activeLang === "en"
                      ? setReportEn(e.target.value)
                      : setReportAr(e.target.value)
                  }
                />
                <div className="mt-2 flex gap-2">
                  <Button className="bg-green-600 text-white" onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="whitespace-pre-line mb-2">
                  {activeLang === "en"
                    ? reportEn || <em>No English report yet.</em>
                    : reportAr
                    ? decodeHtml(reportAr)
                    : <em>No Arabic report yet.</em>}
                </div>
                <div className="flex gap-2">
              <Button
                className="bg-blue-600 text-white"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>

              {activeLang === "ar" && (
                <Button
                  className="bg-blue-600 text-white"
                  onClick={handleTranslateToArabic}
                  disabled={translating}
                >
                  {translating
                    ? reportAr
                      ? "Retranslating..."
                      : "Translating..."
                    : reportAr
                    ? "Retranslate to Arabic"
                    : "Translate to Arabic"}
                </Button>
              )}
            </div>

              </>
            )}
          </div>
        </div>
        {/* Hidden student style for PNG */}
        {/* <div
          id="studentStyleReport"
          className="hidden p-8 max-w-[700px] mx-auto bg-white text-black rounded shadow"
        >
          <p className="whitespace-pre-line">{reportEn || "No English report yet."}</p>

          {reportAr && (
            <>
              <h3 className="mt-6 font-bold">Arabic Version:</h3>
              <p dir="rtl" className="whitespace-pre-line">{decodeHtml(reportAr)}</p>
            </>
          )}
        </div> */}

  <div
  id="studentStyleReport"
  className="hidden"
  style={{
    width: "794px", // A4 width
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    margin: "0 auto",
    position: "relative",
  }}
>
  {/* Header wrapper with overlaid title box */}
  <div style={{ position: "relative", width: "100%" }}>
    <img
      src={header}
      alt="Header Design"
      style={{ width: "100%", display: "block" }}
    />

    {/* Title Box overlays the bottom part of header */}
    <div
      style={{
        position: "absolute",
        bottom: "-100px", // sits just above transition
        left: "50%",
        transform: "translateX(-50%)",
        width: "92%",
        backgroundColor: "#ffffff",
        border: "4px solid black",
        padding: "16px 24px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
        {students.find((s) => s.id === selectedStudentId)?.name || "Student"}’s Report for {month}
      </h1>
      <img
        src={logo}
        alt="Key2Enable"
        style={{ height: "60px", marginInline: "auto" }}
      />
    </div>
  </div>

  {/* Main content with top spacing to account for overlap */}
  <div style={{ padding: "108px 32px 32px" }}>
    <p style={{ whiteSpace: "pre-line", fontSize: "14px", lineHeight: "1.6" }}>
      {reportEn || "No English report yet."}
    </p>

    <hr style={{ border: "none", borderTop: "1.5px solid #888", margin: "24px 0" }} />

    {reportAr && (
      <>
        <h3 style={{ fontWeight: "bold", marginTop: "22px", textAlign: "right" }}>
          Arabic Version:
        </h3>
        <p
          dir="rtl"
          style={{
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: "1.6",
            textAlign: "right",
          }}
        >
          {decodeHtml(reportAr)}
        </p>
      </>
    )}
  </div>

  {/* Footer Strip - full width */}
  <img src={footer} alt="Footer Design" style={{ width: "100%", display: "block" }} />
</div>


      </div>
    </div>
  );
}
