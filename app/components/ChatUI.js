"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import axios from "axios";

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("tokenize"); // Default mode

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    
    try {
      const endpoint = mode === "tokenize" ? "tokenize" : "textqa";
      const response = await axios.post(`http://localhost:8000/${endpoint}`, {
        text: input,
      });
      
      if (mode === "tokenize" && response.data.tokens && Array.isArray(response.data.tokens.result)) {
        setMessages((prev) => [...prev, { text: response.data.tokens.result.join(" "), sender: "bot" }]);
      } else if (mode === "textqa" && response.data.answer) {
        setMessages((prev) => [...prev, { text: response.data.answer, sender: "bot" }]);
      } else {
        setMessages((prev) => [...prev, { text: "Unexpected API response format", sender: "bot" }]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [...prev, { text: `Error: ${error.response?.data?.message || error.message}` , sender: "bot" }]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 max-w-4xl mx-auto w-full">
      <div className="p-4 flex justify-center">
        <Button onClick={() => setMode("tokenize")} className={`mr-2 ${mode === "tokenize" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>Tokenize</Button>
        <Button onClick={() => setMode("textqa")} className={`${mode === "textqa" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>QA</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <Card
            key={index}
            className={`mb-2 p-3 max-w-2xl w-fit ${
              msg.sender === "user" ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-white"
            }`}
          >
            <CardContent>{msg.text}</CardContent>
          </Card>
        ))}
      </div>
      <div className="p-4 bg-white flex items-center w-full">
        <Input
          className="flex-grow mr-2"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
