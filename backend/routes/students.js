// routes/students.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();


// GET all students (optionally filtered by group_id)
router.get('/', async (req, res) => {
  const { group_id } = req.query;

  let query = supabase
    .from('students')
    .select('*, groups(name)') // Include group name for display if needed
    .order('name', { ascending: true });

  if (group_id) {
    query = query.eq('group_id', group_id);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// POST new student
router.post('/', async (req, res) => {
  const { name, country, group_id, clerk_user_id, email} = req.body;

  const { data, error } = await supabase
    .from('students')
    .insert([{ name, country, group_id, clerk_user_id, email }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});


// PUT /students/:id — full update of student fields
// router.put('/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, country, group_id, clerk_user_id, email } = req.body;

//   const { data, error } = await supabase
//     .from('students')
//     .update({ name, country, group_id, clerk_user_id, email })
//     .eq('id', id)
//     .select();

//   if (error) return res.status(500).json({ error: error.message });
//   res.json(data[0]);
// });
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, country, group_id, clerk_user_id, email } = req.body;

  const updateFields = {
    name,
    country,
    group_id,
  };

  if (clerk_user_id && clerk_user_id.trim() !== '') {
    updateFields.clerk_user_id = clerk_user_id;
  }

  if (email && email.trim() !== '') {
    updateFields.email = email;
  }

  console.log("🛠 Updating student:", id, updateFields);

  const { data, error } = await supabase
    .from('students')
    .update(updateFields)
    .eq('id', id)
    .select();

  if (error) {
    console.error("❌ Supabase update error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
});


// GET /students/summary/:clerk_user_id
router.get('/summary/:clerk_user_id', async (req, res) => {
  const { clerk_user_id } = req.params;
  const { month } = req.query;

  const studentRes = await supabase
    .from('students')
    .select('id, name, group_id')
    .eq('clerk_user_id', clerk_user_id)
    .single();

  if (studentRes.error) return res.status(500).json({ error: studentRes.error.message });

  const studentId = studentRes.data.id;

  // 1. Attendance
  const { data: attendance, error: aErr } = await supabase
    .from('attendance_entries')
    .select('status')
    .eq('student_id', studentId)
    .eq('month', month);

  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'P').length;
  const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

  // 2. Assessment
  const { data: assessments, error: assessErr } = await supabase
    .from('assessment_scores')
    .select('raw_score, max_score')
    .eq('student_id', studentId)
    .eq('month', month);

  const totalScore = assessments.reduce((sum, a) => sum + (a.raw_score || 0), 0);
  const maxScore = assessments.reduce((sum, a) => sum + (a.max_score || 0), 0);
  const assessmentPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // 3. Mood
  const { data: moods } = await supabase
    .from('mood_entries')
    .select('mood')
    .eq('student_id', studentId)
    .eq('month', month);

  const mood = moods?.[moods.length - 1]?.mood || 'happy';

  res.json({
    id: studentId,
    name: studentRes.data.name,
    group_id: studentRes.data.group_id,
    attendancePercent,
    assessmentPercent,
    mood,
  });
});

// GET /students/for-teacher
router.get('/for-teacher', async (req, res) => {
  const { clerk_user_id } = req.query;

  // Step 1: Find the teacher based on Clerk ID
  const { data: teacher, error: teacherErr } = await supabase
    .from('teachers')
    .select('id')
    .eq('clerk_user_id', clerk_user_id)
    .maybeSingle();

  if (teacherErr || !teacher) {
    console.error("❌ Teacher lookup failed:", teacherErr);
    return res.status(404).json({ error: 'Teacher not found' });
  }

  console.log("🔎 teacher", teacher);

  // Step 2: Find the group IDs this teacher manages
  const { data: groupLinks, error: groupErr } = await supabase
    .from('group_teachers')
    .select('group_id')
    .eq('teacher_id', teacher.id);

  if (groupErr) {
    console.error("❌ Failed to get group links:", groupErr);
    return res.status(500).json({ error: 'Group link fetch failed' });
  }

  const groupIds = groupLinks.map(g => g.group_id);
  console.log("📦 groupIds", groupIds);

  if (groupIds.length === 0) return res.json([]);

  // Step 3: Fetch all students in those groups
  const { data: students, error: studentErr } = await supabase
    .from('students')
    .select('*, groups(name)')
    .in('group_id', groupIds);

  if (studentErr) {
    console.error("❌ Failed to fetch students:", studentErr);
    return res.status(500).json({ error: studentErr.message });
  }

  console.log("👦 students found:", students.length);
  res.json(students);
});


export default router;
