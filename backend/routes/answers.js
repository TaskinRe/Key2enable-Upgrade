// routes/answers.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET all answers
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('answers')
    .select('answer_id, answer_text, is_correct, question_id')
    .order('answer_id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET all answers for a specific question
router.get('/question/:question_id', async (req, res) => {
  const { question_id } = req.params;

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', question_id)
    .order('answer_id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET a single answer by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('answer_id', req.params.id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'Answer not found' });
  }

  res.json(data);
});

// POST create a new answer
router.post('/', async (req, res) => {
  const { question_id, answer_text, is_correct } = req.body;

  if (!question_id || !answer_text || is_correct === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('answers')
    .insert([{ question_id, answer_text, is_correct }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT update an existing answer
router.put('/:id', async (req, res) => {
  const { answer_text, is_correct } = req.body;

  const { error } = await supabase
    .from('answers')
    .update({ answer_text, is_correct })
    .eq('answer_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// DELETE an answer
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('answer_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
