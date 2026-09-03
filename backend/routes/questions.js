// routes/questions.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET all questions
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('question_id, question_text, quiz_id')
    .order('question_id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all questions for a specific quiz
router.get('/quiz/:quiz_id', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', req.params.quiz_id)
    .order('question_id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET a single question by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('question_id', req.params.id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'Question not found' });
  }

  res.json(data);
});

// POST create a new question
router.post('/', async (req, res) => {
  const { quiz_id, question_text } = req.body;

  if (!quiz_id || !question_text) {
    return res.status(400).json({ error: 'Missing quiz_id or question_text' });
  }

  const { data, error } = await supabase
    .from('questions')
    .insert([{ quiz_id, question_text }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT update question text
router.put('/:id', async (req, res) => {
  const { question_text } = req.body;

  const { error } = await supabase
    .from('questions')
    .update({ question_text })
    .eq('question_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// DELETE a question
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
