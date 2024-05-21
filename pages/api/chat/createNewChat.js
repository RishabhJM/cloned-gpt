// import { getSession } from "@auth0/nextjs-auth0";
// import clientPromise from "lib/mongodb";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    const { userId, message } = req.body;

    // validate message data
    if (!message || typeof message !== "string" || message.length > 200) {
      res.status(422).json({
        message: "message is required and must be less than 200 characters",
      });
      return;
    }

    const newUserMessage = {
      role: "user",
      content: message,
    };
    const { data, error } = await supabase.from("chats").insert({
      userID: userId,
      messages: [JSON.stringify(newUserMessage)],
      title: message,
    }).select();
    res.status(200).json({
      id: data[0].id,
      userId:data[0].userID,
      messages: data[0].messages,
      title: data[0].title,
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "An error occurred when creating a new chat" });
    console.log("ERROR OCCURRED IN CREATE NEW CHAT: ", e);
  }
}
