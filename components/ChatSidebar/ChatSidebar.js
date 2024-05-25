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
import Image from "next/image";

const supabaseUrl = "https://xcnsfjtsufywoloplzac.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const ChatSidebar = ({ user, chatId }) => {
  const [chatList, setChatList] = useState([]);
  const router = useRouter();
  const src = user?.user_metadata.avatar_url || "/man.png";

  // console.log(user);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    // console.log("I AM HERE!");
    const loadChatList = async () => {
      const response = await fetch(`/api/chat/getChatList`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });
      // console.log(response);
      const json = await response.json();
      // console.log("CHAT LIST: ", json);
      setChatList(json?.chats || []);
    };
    loadChatList();
  }, [chatId]);
  // console.log(chatList);
  // console.log(chatId);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link
        href="/chat"
        className="side-menu-item bg-emerald-500 hover:bg-emerald-600"
      >
        <FontAwesomeIcon icon={faPlus} className="w-[20px]" /> New chat
      </Link>
      <div className="flex-1 overflow-auto bg-gray-950">
        {chatList.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={`side-menu-item ${
              chatId === chat.id ? "bg-gray-700 hover:bg-gray-700" : ""
            }`}
            // onClick={() => router.push(`/chat/${chat.id}`)}
          >
            <FontAwesomeIcon
              icon={faMessage}
              className="text-white/50 w-[20px]"
            />{" "}
            <span
              title={chat.title}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {chat.title}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex py-4">
        <Image
          loader={() => src}
          src={src}
          width={40}
          height={40}
          alt=""
          className="rounded-full m-2"
        ></Image>
        <h1> Welcome {user.email}</h1>
      </div>

      <Button onClick={() => handleSignOut()} className="side-menu-item">
        <FontAwesomeIcon icon={faRightFromBracket} className="w-[20px]" />{" "}
        Logout
      </Button>
    </div>
  );
};
