const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// export const config = {
//   runtime: "edge",
// };

export default async function handler(req, res) {
  // console.log(req.body.message);
  // res.status(200).json({ message: 'Hello from Next.js!' });
  console.log("IN HERE!");
  try {
    console.log("REQ", req.body);
    const { message } = await req.body;
    console.log("MESSAGE", message);
    // const chat = model.startChat({
    //   history: [
    //     {
    //       role: "user",
    //       parts:
    //         "You are",
    //     },
    //     {
    //       role: "model",
    //       parts: "Hello! It's cold! Isn't that great?",
    //     },
    //   ],
    //   generationConfig: {
    //     maxOutputTokens: 100,
    //   },
    // });
    const result = await model.generateContent(message);
    // const result = await model.generateContentStream(message);
    // console.log(result);
    // console.log(result);
    const response = await result.response;
    console.log(result);
    const text = response.text();
    // console.log(text);
    res.status(200).json({ output: text });
    // return new Response(result);
  } catch (e) {
    console.log(e);
  }
}
