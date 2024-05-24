import { useUser } from "@auth0/nextjs-auth0/client";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

export const Message = ({ user, role, content }) => {
  // console.log("USER: ", user);
  const src = user?.user_metadata.avatar_url;
  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${
        role === "assistant"
          ? "bg-gray-600"
          : role === "notice"
          ? "bg-red-600"
          : ""
      }`}
    >
      <div>
        {role === "user" && !!user && (
          <Image
            loader={() => src}
            src={src}
            width={30}
            height={30}
            alt="User avatar"
            className="rounded-sm shadow-md shadow-black/50"
          />
        )}
        {role === "assistant" && (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-gray-800 shadow-md shadow-black/50">
            <Image src="/logo2.png" width={30} height={30} alt=""></Image>
          </div>
        )}
      </div>
      <div className="prose prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
