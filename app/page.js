import Image from "next/image";

import ChatUI from "./components/ChatUI";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <ChatUI />
    </div>
  );
}
