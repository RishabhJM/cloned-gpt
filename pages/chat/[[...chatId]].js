import Head from "next/head";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Message } from "@/components/Message";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { BallTriangle } from "react-loader-spinner";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChatPage({ chatId, title, messages = [] }) {
  // console.log("props: ", title, messages);
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
  // console.log(routeHasChanged);

  //gets logged in user data from supabase
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
          id: uuid(),
          role: "assistant",
          content: fullMessage,
        },
      ]);
      setFullMessage("");
    }
  }, [generatingResponse, fullMessage, routeHasChanged]);

  // if we've created a new chat, {WORKING}
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, generatingResponse, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("THE EVENT");
    setGeneratingResponse(true);
    setOriginalChatId(chatId);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");

    const response = await fetch(`/api/chat/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText, userId: userId, chatId }),
    });
    const data = response.body;
    if (!data) {
      return;
    }
    setIncomingMessage(messageText);
    const text = await response.json();
    setNewChatId(text.chatId);
    console.log("EVENT 2");
    setFullMessage(text.response);
    setIncomingMessage("");
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];
  console.log("ALL MESSAGES",allMessages);

  return (
    <>
      <Head>
        <title>New chat</title>
      </Head>
      {Object.keys(user).length !== 0 ? (
        <div className="grid h-screen grid-cols-[260px_1fr]">
          <ChatSidebar user={user} chatId={chatId} />
          <div className="flex flex-col overflow-hidden bg-gray-700">
            <div className="flex flex-1 flex-col-reverse overflow-scroll no-scrollbar text-white">
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
                    <div>
                      <Message
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        user={user}
                      />
                    </div>
                  ))}
                  {!!incomingMessage && !routeHasChanged && (
                    <div>
                      RISHABH
                      <Message
                        role="assistant"
                        content={incomingMessage}
                        user={user}
                      />
                    </div>
                  )}
                  {!!incomingMessage && !!routeHasChanged && (
                    <Message
                      role="notice"
                      content="Only one message at a time. Please allow any other responses to complete before sending another message"
                    />
                  )}
                  {generatingResponse && (
                    <div className="flex justify-center">
                      <BallTriangle
                        height={100}
                        width={100}
                        radius={5}
                        color="#4fa94d"
                        ariaLabel="ball-triangle-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                      />
                    </div>
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
                    className="w-full resize-none rounded-[12px] bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500"
                  />
                  <button type="submit" className="btn">
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
          <button onClick={() => router.push("/")}>Go back to Home Page</button>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null;
  if (chatId) {
    const { data, error } = await supabase
      .from("chats")
      .select()
      .eq("id", chatId);
    const messagesArray = data[0].messages.map((message) =>
      JSON.parse(message)
    );
    console.log("DATA RJM", messagesArray);
    if (!data) {
      return {
        redirect: {
          destination: "/chat",
        },
      };
    }
    return {
      props: {
        chatId,
        title: data[0].title,
        messages: messagesArray.map((message) => ({
          ...message,
          id: uuid(),
        })),
      },
    };
  }
  return {
    props: {},
  };
};
