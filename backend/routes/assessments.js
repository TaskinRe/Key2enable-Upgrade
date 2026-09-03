import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET all assessments (optionally filtered by month, language, week, group_id)
router.get('/', async (req, res) => {
  const { month, language, week, group_id } = req.query;

  if (!month || !language || !group_id) {
    return res.status(400).json({ error: "Missing month, language, or group_id" });
  }

  try {
    let query = supabase
      .from('assessment_scores')
      .select('*, students:student_id(name, group_id)')
      .eq('month', month)
      .eq('language', language);

    // if (week) query = query.eq('week', week);
    if (week !== undefined && week !== null && week !== '') {
  query = query.eq('week', week);
}

    const { data, error } = await query;

    if (error) {
      console.error("🔴 assessment_scores error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Filter by group_id from the joined students table
    const filtered = data.filter(d => d.students?.group_id === group_id);

    res.json(filtered);
  } catch (err) {
    console.error("❗ Unexpected server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// POST /assessments
router.post('/', async (req, res) => {
  console.log('POST /assessments - Request received');
  console.log('Request body:', req.body);
  
  try {
    const {
      student_name,
      category,
      raw_score,
      max_score,
      language,
      month,
      week,
      week_start,
      week_end
    } = req.body;
    
    // First, get or create the student
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('name', student_name)
      .single();

    if (studentError) {
      console.error('Error finding student:', studentError);
      return res.status(500).json({ error: studentError.message });
    }

    const newAssessment = {
      student_id: studentData.id,
      category,
      raw_score: Number(raw_score || 0),
      max_score: Number(max_score || 0),
      language,
      month,
      week: week || null,
      week_start: week_start || null,
      week_end: week_end || null
    };

    console.log('Attempting to insert:', newAssessment);

    const { data, error } = await supabase
      .from('assessment_scores')
      .insert([newAssessment])
      .select('*, students(name)');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Successfully inserted assessment:', data);
    res.json(data[0]);

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

// PUT /assessments/:id
router.put('/:id', async (req, res) => {
  const { raw_score, max_score } = req.body;
  const id = req.params.id;

  console.log("Received PUT for ID:", id);
  console.log("Raw Score:", raw_score, "Max Score:", max_score);

  const raw = Number(raw_score);
  const max = Number(max_score);

  const { data, error } = await supabase
    .from('assessment_scores')
    .update({ raw_score: raw, max_score: max }) // removed percentage
    .eq('id', id)
    .select();

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
});


export default router;