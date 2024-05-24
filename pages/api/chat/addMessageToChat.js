import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { chatId, role, content, userId } = req.body;
    console.log("IN HERE");

    let objectId;

    try {
      objectId = chatId;
    } catch (e) {
      res.status(422).json({
        message: "Invalid chat ID",
      });
      return;
    }

    // validate content data
    if (
      !content ||
      typeof content !== "string" ||
      (role === "user" && content.length > 200) ||
      (role === "assistant" && content.length > 100000)
    ) {
      res.status(422).json({
        message: "content is required and must be less than 200 characters",
      });
      return;
    }

    // validate role
    if (role !== "user" && role !== "assistant") {
      res.status(422).json({
        message: "role must be either 'assistant' or 'user'",
      });
      return;
    }
    // console.log("ABOUT TO GO INNNN")
    // Fetch current messages
    console.log(objectId);
    const { data: currentData, error: fetchError } = await supabase
      .from("chats")
      .select("messages")
      .eq("id", Number(objectId))
      .eq("userID", userId)
      .single();
    console.log(currentData,fetchError);
    if (fetchError) {
      console.error("Error fetching current messages:", fetchError);
      return;
    }

    const { messages } = currentData;
    const newMessage = { role, content };
    const updatedMessages = [...messages, JSON.stringify(newMessage)];
    console.log(updatedMessages);
    // Update messages array
    const { data, error } = await supabase
      .from("chats")
      .update({ messages: updatedMessages })
      .eq("id", objectId)
      .eq("userID", userId)
      .select();

    if (error) {
      console.error("Error updating messages:", error);
    } else {
      console.log("Messages updated successfully:", data);
    }

    res.status(200).json({
      chat: {
        ...data[0],
        id: data[0].id,
      },
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when adding a message to a chat" });
  }
}
