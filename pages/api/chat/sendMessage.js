// import { OpenAIEdgeStream } from "openai-edge-stream";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// export const config = {
//   runtime: "edge",
// };

export default async function handler(req,res) {
  try {
    const { chatId: chatIdFromParam, message, userId } = req.body;
    console.log(message,userId);
    // validate message data
    if (!message || typeof message !== "string" || message.length > 200) {
      return new Response(
        {
          message: "message is required and must be less than 200 characters",
        },
        {
          status: 422,
        }
      );
    }

    let chatId = chatIdFromParam;
    // let newChatId;
    let chatMessages = [];

    if (chatId) {
      // add message to chat
      console.log("NEW CHAT",chatId)
      const response = await fetch(
        `http://${req.headers.host}/api/chat/addMessageToChat`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({
            chatId,
            role: "user",
            content: message,
            userId
          }),
        }
      );
      const json = response.body;
      console.log("JSON:",json);
      const text = await response.json();
      console.log("TEXT:",text);
      chatMessages = text.messages || [];
      console.log("CHAT ID:",chatId);
    } else {
      console.log("IDHAR");
      const response = await fetch(
        `http://${req.headers.host}/api/chat/createNewChat`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            message,
            userId
          }),
        }
      );
      // console.log("RESPONSE:",response);
      const json = response.body;
      const text = await response.json();
      console.log("API TEXT:",text)
      chatId = text.id;
      console.log("CHATID",chatId);
      // newChatId = json.id;
      chatMessages = json.messages || [];
    }

    const messagesToInclude = [];
    chatMessages.reverse();
    // let usedTokens = 0;
    // for (let chatMessage of chatMessages) {
    //   const messageTokens = chatMessage.content.length / 4;
    //   usedTokens = usedTokens + messageTokens;
    //   if (usedTokens <= 2000) {
    //     messagesToInclude.push(chatMessage);
    //   } else {
    //     break;
    //   }
    // }

    messagesToInclude.reverse();

    // console.log(messagesToInclude);

    const result = await model.generateContent(message);
    const response = await result.response;
    console.log("RESULT",result);
    const text = response.text();
    console.log("TEXT",text)
    const resp = await fetch(
      `http://${req.headers.host}/api/chat/addMessageToChat`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          role: "assistant",
          content: text,
          userId
        }),
      }
    );
    res.status(200).json({ response:text, chatId:chatId });
  } catch (e) {
    res.status(500).json({ Error:e });
    console.log(e);
  }
}