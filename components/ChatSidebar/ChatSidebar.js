import {
  faMessage,
  faPlus,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


export const ChatSidebar = ({ user, chatId }) => {
  const [chatList, setChatList] = useState([]);
  const router = useRouter();

  

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
      });
      const json = await response.json();
      console.log("CHAT LIST: ", json);
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link
        href="/chat"
        className="m-2 flex items-center gap-4 rounded-md p-2 hover:bg-gray-800; bg-emerald-500 hover:bg-emerald-600"
      >
        <FontAwesomeIcon icon={faPlus} className="w-[20px]"/> New chat
      </Link>
      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat._id}
            href={`/chat/${chat._id}`}
            className={`side-menu-item ${
              chatId === chat._id ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
          >
            <FontAwesomeIcon icon={faMessage} className="text-white/50" />{" "}
            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <h1> Welcome {user.email}</h1>
      <Button onClick={() => handleSignOut()}className="side-menu-item">
        <FontAwesomeIcon icon={faRightFromBracket} className="w-[20px]"/> Logout
      </Button>
    </div>
  );
};
