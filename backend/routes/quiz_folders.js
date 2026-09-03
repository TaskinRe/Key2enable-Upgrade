import express from 'express';
import supabase from '../supabaseClient.js';
import { getTeacherByClerkId } from '../utils/helpers.js';

const router = express.Router();

// GET all folders for a given teacher
router.get('/', async (req, res) => {
  const { clerk_user_id } = req.query;

  if (!clerk_user_id) {
    return res.status(400).json({ error: 'Missing clerk_user_id' });
  }

  try {
    const teacher = await getTeacherByClerkId(clerk_user_id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const { data: folders, error } = await supabase
      .from('quiz_folders')
      .select('*')
      .eq('teacher_id', teacher.id);

    if (error) {
      console.error('Error fetching folders:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json(folders);
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// POST create new folder and assign quizzes by updating their folder_id
router.post('/', async (req, res) => {
  const { folder_name, quiz_ids, clerk_user_id } = req.body;

  if (!folder_name || !clerk_user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const teacher = await getTeacherByClerkId(clerk_user_id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    // Create the folder
    const { data: folder, error: folderError } = await supabase
      .from('quiz_folders')
      .insert([{ folder_name, teacher_id: teacher.id }])
      .select()
      .single();

    if (folderError) {
      console.error('Error creating folder:', folderError.message);
      return res.status(500).json({ error: folderError.message });
    }

    // If any quizzes were selected, update their folder_id
    if (Array.isArray(quiz_ids) && quiz_ids.length > 0) {
      for (const quiz_id of quiz_ids) {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({ folder_id: folder.id })
          .eq('id', quiz_id); // 🔥 FIXED LINE

        if (updateError) {
          console.error(`Failed to assign folder to quiz ${quiz_id}:`, updateError.message);
          return res.status(500).json({ error: `Failed to assign folder to quiz ${quiz_id}` });
        }
      }
    }

    res.status(201).json(folder);
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// DELETE folder by ID
router.delete('/:folderId', async (req, res) => {
  const { folderId } = req.params;

  try {
    // Unassign all quizzes from this folder
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ folder_id: null })
      .eq('folder_id', folderId);

    if (updateError) {
      console.error('Error unassigning quizzes:', updateError.message);
      return res.status(500).json({ error: 'Failed to unassign quizzes from folder' });
    }

    // Then delete the folder
    const { error } = await supabase
      .from('quiz_folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Error deleting folder:', error.message);
      return res.status(500).json({ error: 'Failed to delete folder' });
    }

    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('Unexpected server error:', err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
