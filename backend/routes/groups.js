// routes/groups.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET all groups
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /groups/for-teacher?clerk_user_id=...
router.get('/for-teacher', async (req, res) => {
  const { clerk_user_id } = req.query;
  if (!clerk_user_id) return res.status(400).json({ error: 'Missing clerk_user_id' });

  // Get teacher ID from clerk ID
  const { data: teacher, error: teacherErr } = await supabase
    .from('teachers')
    .select('id')
    .eq('clerk_user_id', clerk_user_id)
    .maybeSingle();

  if (teacherErr || !teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  // Get group IDs assigned to this teacher
  const { data: groupLinks, error: groupErr } = await supabase
    .from('group_teachers')
    .select('group_id')
    .eq('teacher_id', teacher.id);

  if (groupErr) return res.status(500).json({ error: groupErr.message });

  const groupIds = groupLinks.map(g => g.group_id);

  // Get group names
  const { data: groups, error: groupsErr } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);

  if (groupsErr) return res.status(500).json({ error: groupsErr.message });

  res.json(groups);
});

router.post('/', async (req, res) => {
  const { name, clerk_user_id } = req.body;

  if (!clerk_user_id || !name) {
    return res.status(400).json({ error: 'Missing name or clerk_user_id' });
  }

  // 1. Get the teacher ID from the clerk_user_id
  const { data: teacher, error: teacherErr } = await supabase
    .from('teachers')
    .select('id')
    .eq('clerk_user_id', clerk_user_id)
    .maybeSingle();

  if (teacherErr || !teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }

  // 2. Insert the new group
  const { data: newGroup, error: insertError } = await supabase
    .from('groups')
    .insert([{ name }])
    .select()
    .maybeSingle();

  if (insertError) return res.status(500).json({ error: insertError.message });

  // 3. Link group to teacher
  const { error: linkError } = await supabase
    .from('group_teachers')
    .insert([{ teacher_id: teacher.id, group_id: newGroup.id }]);

  if (linkError) return res.status(500).json({ error: linkError.message });

  res.status(201).json(newGroup);
});


export default router;
