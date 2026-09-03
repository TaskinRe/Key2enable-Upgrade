// backend/routes/teachers.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();


// POST /teachers
router.post('/', async (req, res) => {
  const { name, email, clerk_user_id } = req.body;

  if (!name || !email || !clerk_user_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Check if teacher already exists
  const { data: existing, error: findError } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });

  if (existing) {
    return res.status(200).json({ success: true, message: 'Teacher already exists', data: existing });
  }

  const { data, error } = await supabase
    .from('teachers')
    .insert([{ name, email, clerk_user_id }]);

  if (error) {
    console.error("❌ Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});


// GET /teachers/by-clerk-id?clerk_user_id=...
router.get('/by-clerk-id', async (req, res) => {
  const { clerk_user_id } = req.query;

  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || null);
});


// GET /teachers/with-groups
router.get('/with-groups', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      id, name, email, country, is_new,
      group_teachers (
        groups ( id, name )
      )
    `);

  if (error) return res.status(500).json({ error: error.message });

  const formatted = data.map((t) => ({
    ...t,
    groups: t.group_teachers.map((gt) => gt.groups?.name).filter(Boolean),
  }));

  res.json(formatted);
});

// PUT /:id — update basic teacher info
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, country } = req.body;

  //  if (req.body.is_new === false) {
  //   updatePayload.is_new = false;
  // }

  const { data, error } = await supabase
    .from('teachers')
    .update({ name, email, country, is_new: false  })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// PUT /teachers/:id/groups
router.put('/:id/groups', async (req, res) => {
  const { id } = req.params;
  const { group_ids } = req.body;

  if (!Array.isArray(group_ids)) {
    return res.status(400).json({ error: 'group_ids must be an array' });
  }

  // Step 1: Delete existing group-teacher links
  const { error: deleteErr } = await supabase
    .from('group_teachers')
    .delete()
    .eq('teacher_id', id);

  if (deleteErr) return res.status(500).json({ error: deleteErr.message });

  // Step 2: Insert new links
  const inserts = group_ids.map((group_id) => ({
    teacher_id: id,
    group_id,
  }));

  const { error: insertErr } = await supabase
    .from('group_teachers')
    .insert(inserts);

  if (insertErr) return res.status(500).json({ error: insertErr.message });

  //Clear is_new flag if teacher is marked new
  await supabase
    .from('teachers')
    .update({ is_new: false })
    .eq('id', id);

  res.json({ success: true });
});


export default router;


