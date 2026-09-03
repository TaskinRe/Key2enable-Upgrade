// backend/routes/student-summary.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET /stats/student-summary?student_id=abc123&month=June 2025
router.get('/', async (req, res) => {
  const { student_id, month } = req.query;
  if (!student_id || !month) {
    return res.status(400).json({ error: 'Missing student_id or month' });
  }

  try {
    // Get student basic info
    const { data: studentData, error: studentErr } = await supabase
      .from('students')
      .select('name, profile_picture')
      .eq('id', student_id)
      .single();

    if (studentErr || !studentData) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Attendance
    const { data: attendance, error: attErr } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', student_id)
      .eq('month', month);

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'P').length;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Assessment
    const { data: assessments, error: assessErr } = await supabase
      .from('assessment_scores')
      .select('raw_score, max_score')
      .eq('student_id', student_id)
      .eq('month', month);

    const totalScore = assessments.reduce((sum, a) => sum + (a.raw_score || 0), 0);
    const totalMax = assessments.reduce((sum, a) => sum + (a.max_score || 0), 0);
    const assessmentPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    // Mood
    const { data: moods, error: moodErr } = await supabase
      .from('mood_entries')
      .select('mood')
      .eq('student_id', student_id)
      .eq('month', month);

    const moodCount = moods.reduce((acc, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(moodCount).sort((a, b) => b[1] - a[1]);
    const topMood = sorted[0]?.[0] || 'tired';

    const moodEmojiMap = {
      happy: '😊',
      sad: '😢',
      tired: '😴',
      excited: '🤩',
      calm: '😌',
    };

    const moodLabelMap = {
      happy: 'Happy',
      sad: 'Sad',
      tired: 'Tired',
      excited: 'Excited',
      calm: 'Calm',
    };

    // Homework (optional/fake until implemented)
    const homeworkPct = 72;

    res.json({
      id: student_id,
      name: studentData.name,
      profile_picture: studentData.profile_picture || null,
      attendance: attendancePct,
      homework: homeworkPct,
      assessment: assessmentPct,
      mood: {
        label: moodLabelMap[topMood] || 'Tired',
        emoji: moodEmojiMap[topMood] || '😴'
      }
    });
  } catch (err) {
    console.error('Student summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
