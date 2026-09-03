

// stats.js
import express from 'express';
import supabase from '../supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Helper: get current month label like "June 2025"
function getCurrentMonthLabel() {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
}

// GET /stats/mood-summary?type=today|week|month&group_id=...
// Consolidated onto the main mood_entries table (student_id-scoped).
// group_id is now required — this endpoint is always scoped to a
// specific class, never the whole school, matching the same
// least-privilege pattern as the rest of the audit fixes.
router.get('/mood-summary', async (req, res) => {
  const type = req.query.type || 'month';
  const now = new Date();
  const { group_id } = req.query;

  if (!group_id) {
    return res.status(400).json({ error: 'Missing group_id' });
  }

  try {
    let query = supabase
      .from('mood_entries')
      .select('mood, entry_date')
      .eq('group_id', group_id);

    if (type === 'today') {
      const today = now.toISOString().split('T')[0];
      query = query.eq('entry_date', today);
    } else if (type === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      query = query
        .gte('entry_date', start.toISOString().split('T')[0])
        .lte('entry_date', end.toISOString().split('T')[0]);
    } else {
      // Default: month
      query = query.eq('month', req.query.month || getCurrentMonthLabel());
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    const moodCounts = {};
    for (const entry of data) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }

    res.json(moodCounts);
  } catch (err) {
    console.error("🔥 Unexpected mood summary error:", err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// ✅ Weekly Attendance
router.get('/attendance/weekly', async (req, res) => {
  const { group_id, week_start } = req.query;
  if (!group_id || !week_start) return res.status(400).json({ error: 'Missing group_id or week_start' });

  const startDate = new Date(week_start);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const { data, error } = await supabase
    .from('attendance_entries')
    .select('date, status')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .eq('group_id', group_id);

  if (error) return res.status(500).json({ error: error.message });

  const resultMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
  data.forEach(entry => {
    const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
    if (entry.status === 'P' && resultMap[day] !== undefined) resultMap[day]++;
  });

  const result = Object.entries(resultMap).map(([day, present]) => ({ day, present }));
  res.json(result);
});


router.get('/assessments/monthly-categories', async (req, res) => {
  const { group_id, month } = req.query;
  if (!group_id || !month) return res.status(400).json({ error: 'Missing group_id or month' });

  const { data, error } = await supabase
  .from('assessment_scores')
  .select('category, language, raw_score, max_score, students!inner(id, group_id)')
  .eq('month', month)
  .eq('students.group_id', group_id);

  if (error) return res.status(500).json({ error: error.message });

  const categoryStats = {};

  data.forEach(({ category, language, raw_score, max_score }) => {
    if (!categoryStats[category]) categoryStats[category] = {};
    if (!categoryStats[category][language]) categoryStats[category][language] = { total: 0, max: 0 };

    categoryStats[category][language].total += raw_score;
    categoryStats[category][language].max += max_score;
  });

  const result = Object.entries(categoryStats).map(([category, langs]) => {
    const entry = { category };
    for (const lang in langs) {
      const { total, max } = langs[lang];
      entry[lang] = max ? Math.round((total / max) * 100) : 0;
    }
    return entry;
  });

  res.json(result);
});

router.get('/attendance/daily', async (req, res) => {
  const { group_id, date } = req.query;
  if (!group_id || !date) return res.status(400).json({ error: 'Missing group_id or date' });

  const { data, error } = await supabase
    .from('attendance_entries')
    .select('status')
    .eq('group_id', group_id)
    .eq('date', date);

  if (error) return res.status(500).json({ error: error.message });

  const present = data.filter(entry => entry.status === 'P').length;
  const absent = data.filter(entry => entry.status === 'A').length;
  const holiday = data.filter(entry => entry.status === 'H').length;

  res.json({ present, absent, holiday });
});

// GET /stats/attendance/student-percentages?group_id=...&month=...

router.get('/attendance/student-percentages', async (req, res) => {
  const { group_id, month } = req.query;

  const { data, error } = await supabase
    .from('attendance_entries')
    .select('student_id, status')
    .eq('group_id', group_id)
    .eq('month', month);

  if (error) return res.status(500).json({ error: error.message });

  const studentStats = {};
  data.forEach(entry => {
    const id = entry.student_id;
    if (!studentStats[id]) studentStats[id] = { P: 0, A: 0 };
    if (entry.status === 'P') studentStats[id].P += 1;
    if (entry.status === 'A') studentStats[id].A += 1;
  });

  // ✅ FILTER STUDENTS BY GROUP
  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('group_id', group_id);

  const result = students.map(s => {
    const stats = studentStats[s.id] || { P: 0, A: 0 };
    const total = stats.P + stats.A;
    const percent = total > 0 ? Math.round((stats.P / total) * 100) : 0;
    return { name: s.name, percent };
  });

  res.json(result);
});

router.get('/assessments/student-progress', async (req, res) => {
  const { group_id, month } = req.query;
  if (!group_id || !month) return res.status(400).json({ error: 'Missing group_id or month' });

  // Step 1: Get all students in the group
  const { data: students, error: studentErr } = await supabase
    .from('students')
    .select('id, name')
    .eq('group_id', group_id);

  if (studentErr) return res.status(500).json({ error: studentErr.message });

  const studentMap = {};
  students.forEach((s) => {
    studentMap[s.id] = {
      name: s.name,
      English: { total: 0, max: 0 },
      Arabic: { total: 0, max: 0 },
    };
  });

  // Step 2: Get assessment scores
  const { data: scores, error: scoreErr } = await supabase
    .from('assessment_scores')
    .select('student_id, language, raw_score, max_score')
    .eq('month', month)
    .in('student_id', students.map(s => String(s.id)));

  if (scoreErr) return res.status(500).json({ error: scoreErr.message });

  scores.forEach(({ student_id, language, raw_score, max_score }) => {
    if (!studentMap[student_id]) return;
    if (language in studentMap[student_id]) {
      studentMap[student_id][language].total += raw_score;
      studentMap[student_id][language].max += max_score;
    }
  });

  const result = Object.values(studentMap).map((s) => ({
    name: s.name,
    English: s.English.max ? Math.round((s.English.total / s.English.max) * 100) : 0,
    Arabic: s.Arabic.max ? Math.round((s.Arabic.total / s.Arabic.max) * 100) : 0,
  }));

  res.json(result);
});

export default router;
