import supabase from "../supabaseClient.js";

const requireTeacher = async (req, res, next) => {
  try {
    const clerkUserId = req.query.clerk_user_id;

    if (!clerkUserId) {
      return res.status(400).json({ error: "Missing clerk_user_id" });
    }

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error || !data) {
      console.error("Teacher not found for Clerk ID:", clerkUserId);
      return res.status(404).json({ error: "Teacher not found" });
    }

    req.teacher = data;
    next();
  } catch (err) {
    console.error("Error in requireTeacher middleware:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default requireTeacher;
