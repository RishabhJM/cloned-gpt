import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { userId } = req.body;
    const { data, error } = await supabase
      .from("chats")
      .select("id,title")
      .eq('userID', userId)
      .order("created_at", { ascending: false });
    res.status(200).json({ chats:data });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when getting the chat list" });
  }
}
