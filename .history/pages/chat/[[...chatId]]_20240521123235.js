import Head from "next/head";
import { getSession } from "@auth0/nextjs-auth0";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Message } from "@/components/Message";
import { useRouter } from "next/router";
import { streamReader } from "openai-edge-stream";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChatPage({ chatId, title, messages = [] }) {
  console.log("props: ", title, messages);
  const [user, setUser] = useState({});
  const [userId, setUserId] = useState({});
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState("");
  const [originalChatId, setOriginalChatId] = useState(chatId);
  const router = useRouter();

  const routeHasChanged = chatId !== originalChatId;

  useEffect(() => {
    async function getUserData() {
      await supabase.auth.getUser().then((value) => {
        // console.log(value.data.user.id);
        if (value.data?.user) {
          console.log(value.data.user);
          setUser(value.data.user);
          setUserId(value.data.user.id);
        }
      });
    }
    getUserData();
  }, []);

  // when our route changes
  useEffect(() => {
    setNewChatMessages([]);
    setNewChatId(null);
  }, [chatId]);

  // save the newly streamed message to new chat messages
  useEffect(() => {
    if (!routeHasChanged && !generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        {
          _id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage, routeHasChanged]);

  // if we've created a new chat
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setOriginalChatId(chatId);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");
    console.log("MESSAGE_TEXT",messageText);
    //console.log("NEW CHAT: ", json);
    const response = await fetch(`/api/chat/testChat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });
    const data = response.body;
    // const text = await response.json();
    // console.log(text.output);
    if (!data) {
      return;
    }

    const reader = data.getReader();
    let content = "";
    // await streamReader(reader, (message) => {
    //   console.log("MESSAGE: ", message);
    //   if (message.event === "newChatId") {
    //     setNewChatId(message.content);
    //   } else {
    //     setIncomingMessage((s) => `${s}${message.content}`);
    //     content = content + message.content;
    //   }
    // });
    // console.log("READER",reader);
    // setFullMessage(text.output);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      {Object.keys(user).length !== 0 ? (
        <div className="grid h-screen grid-cols-[260px_1fr]">
          <ChatSidebar user={user} chatId={chatId} />
          <div className="flex flex-col overflow-hidden bg-gray-700">
            <div className="flex flex-1 flex-col-reverse overflow-scroll text-white">
              {!allMessages.length && !incomingMessage && (
                <div className="m-auto flex items-center justify-center text-center">
                  <div>
                    <Image
                      src="/logo2.png"
                      width={300}
                      height={300}
                      alt=""
                    ></Image>
                    <h1 className="mt-2 text-4xl font-bold text-white/50">
                      Ask me a question!
                    </h1>
                  </div>
                </div>
              )}
              {!!allMessages.length && (
                <div className="mb-auto">
                  {allMessages.map((message) => (
                    <Message
                      key={message._id}
                      role={message.role}
                      content={message.content}
                      user={user}
                    />
                  ))}
                  {!!incomingMessage && !routeHasChanged && (
                    <Message role="assistant" content={incomingMessage} />
                  )}
                  {!!incomingMessage && !!routeHasChanged && (
                    <Message
                      role="notice"
                      content="Only one message at a time. Please allow any other responses to complete before sending another message"
                    />
                  )}
                </div>
              )}
            </div>
            <footer className="bg-gray-800 p-10">
              <form onSubmit={handleSubmit}>
                <fieldset className="flex gap-2" disabled={generatingResponse}>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={generatingResponse ? "" : "Send a message..."}
                    className="w-full resize-none rounded-lg bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600 disabled:bg-emerald-300;"
                  >
                    Send
                  </button>
                </fieldset>
              </form>
            </footer>
          </div>
        </div>
      ) : (
        <div>
          <h1>You are not logged in, Please Login!</h1>
          <button onClick={()=> router.push("/")}>Go back to Home Page</button>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    let objectId;

    try {
      objectId = new ObjectId(chatId);
    } catch (e) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }

    const { user } = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("ChattyPete");
    const chat = await db.collection("chats").findOne({
      userId: user.sub,
      _id: objectId,
    });

    if (!chat) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }

    return {
      props: {
        chatId,
        title: chat.title,
        messages: chat.messages.map((message) => ({
          ...message,
          _id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};