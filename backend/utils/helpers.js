import supabase from '../supabaseClient.js';

export async function getTeacherByClerkId(clerk_user_id) {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .single();

  if (error) {
    console.error('Error fetching teacher:', error.message);
    return null;
  }

  return data;
}
