"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Menu,
  X,
  MessageSquare,
  SplitSquareVertical,
  Languages,
  Camera,
  Trash2,
  ScanText,
  Tag,
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Link from "next/link";

// Add categories and reorganize modes
const modeCategories = [
  {
    title: "การวิเคราะห์ข้อความ",
    modes: [
      {
        id: "tokenize",
        name: "ตัดคำ",
        icon: <SplitSquareVertical className="w-5 h-5" />,
      },
      {
        id: "textqa",
        name: "ถามตอบ",
        icon: <MessageSquare className="w-5 h-5" />,
      },
      {
        id: "text_cleansing",
        name: "ปรับปรุงข้อความ",
        icon: <ScanText className="w-5 h-5" />,
      },
      {
        id: "tag",
        name: "ค้นหาหมวดหมู่",
        icon: <Tag className="w-5 h-5" />,
      },
      {
        id: "emoji",
        name: "ทำนายอิโมจิ",
        icon: <MessageSquare className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "การแปลภาษา",
    modes: [
      {
        id: "en2th",
        name: "แปลอังกฤษเป็นไทย",
        icon: <Languages className="w-5 h-5" />,
      },
      {
        id: "th2en",
        name: "แปลไทยเป็นอังกฤษ",
        icon: <Languages className="w-5 h-5" />,
      },
      {
        id: "zh2th",
        name: "แปลจีนเป็นไทย",
        icon: <Languages className="w-5 h-5" />,
      },
      {
        id: "th2zh",
        name: "แปลไทยเป็นจีน",
        icon: <Languages className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "การวิเคราะห์รูปภาพ",
    modes: [
      {
        id: "face_detection",
        name: "ตรวจจับใบหน้า",
        icon: <Camera className="w-5 h-5" />,
      },
      {
        id: "face_blur",
        name: "เบลอหน้า",
        icon: <Camera className="w-5 h-5" />,
      },
      {
        id: "thai_food",
        name: "ทายอาหารไทยจากรูป",
        icon: <Camera className="w-5 h-5" />,
      },
    ],
  },
];

// Update Sidebar component
function Sidebar({
  currentMode,
  setMode,
  setShowChatHistory,
  showChatHistory,
  isCollapsed,
}) {
  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
      <div className="p-4 border-b flex items-center">
        <h1
          className={`font-bold text-gray-800 text-center transition-all ${
            isCollapsed ? "text-sm" : "text-xl"
          }`}>
          {isCollapsed ? "AI" : "AIFORTHAI"}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          <div className="pb-4 border-b">
            <Link
              href="/blog"
              className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ScanText className="w-5 h-5 text-gray-500" />
              {!isCollapsed && <span className="ml-3">ความรู้เบื้องต้น</span>}
            </Link>
          </div>

          {modeCategories.map((category, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {category.title}
                </h2>
              )}
              <div className="space-y-1">
                {category.modes.map((modeOption) => (
                  <button
                    key={modeOption.id}
                    onClick={() => setMode(modeOption.id)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      currentMode?.id === modeOption.id
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    {modeOption.icon}
                    {!isCollapsed && (
                      <span className="ml-3">{modeOption.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => setShowChatHistory(!showChatHistory)}
          className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          {!isCollapsed && <span className="ml-3">ประวัติการแชท</span>}
        </button>
      </div>
    </div>
  );
}

// Update ChatUI component to use flattened modes for other functions
export default function ChatUI() {
  const [messages, setMessages] = useState([
    { text: "สวัสดีมีอะไรให้ฉันช่วยหรือไม่?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("tokenize");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Flatten modes for use in other functions
  const modes = modeCategories.reduce((acc, category) => {
    return [...acc, ...category.modes];
  }, []);

  const getCurrentMode = () => {
    return modes.find((m) => m.id === mode);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
      setSelectedImage(URL.createObjectURL(file));
      toast.info(`เลือกไฟล์ ${file.name} แล้ว`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const drawFaceBoxes = (imageUrl, faces) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous"; // Add this line to handle CORS
      image.src = imageUrl;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Draw rectangles for each face
        ctx.strokeStyle = "#00ff00"; // Green color
        ctx.lineWidth = 3;

        faces.forEach((face) => {
          const x = parseInt(face.bbox.xLeftTop);
          const y = parseInt(face.bbox.yLeftTop);
          const width = parseInt(face.bbox.xRightBottom) - x;
          const height = parseInt(face.bbox.yRightBottom) - y;

          ctx.strokeRect(x, y, width, height);

          // Add confidence score above the box
          ctx.fillStyle = "#00ff00";
          ctx.font = "16px Arial";
          ctx.fillText(
            `${face.score.toFixed(2)}%`,
            x,
            y > 20 ? y - 5 : y + height + 20
          );
        });

        resolve(canvas.toDataURL());
      };
    });
  };

  const sendMessage = async () => {
    if (
      (mode === "face_blur" ||
        mode === "thai_food" ||
        mode === "face_detection") &&
      !selectedFile
    ) {
      toast.error("กรุณาเลือกรูปภาพก่อนดำเนินการ", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (
      mode !== "face_blur" &&
      mode !== "thai_food" &&
      mode !== "face_detection" &&
      !input.trim()
    ) {
      toast.error("กรุณาพิมพ์ข้อความก่อนดำเนินการ", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const userMessage =
      mode === "face_blur"
        ? `กำลังเบลอหน้าในรูปภาพ: ${selectedFileName}`
        : mode === "thai_food"
        ? `กำลังทายอาหารไทยจากรูปภาพ: ${selectedFileName}`
        : mode === "face_detection"
        ? `กำลังตรวจจับใบหน้าในรูปภาพ: ${selectedFileName}`
        : input;

    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);
    setInput(""); // This will always set a string value
    setIsSubmitting(true);

    try {
      let endpoint;
      let requestData;
      let config = {};

      switch (mode) {
        case "tokenize":
          endpoint = "tokenize";
          requestData = { text: input };
          break;
        case "textqa":
          endpoint = "textqa";
          requestData = { text: input };
          break;
        case "en2th":
          endpoint = "en2th";
          requestData = { text: input };
          break;
        case "th2en":
          endpoint = "th2en";
          requestData = { text: input };
          break;
        case "zh2th":
          endpoint = "zh2th";
          requestData = { text: input };
          break;
        case "th2zh":
          endpoint = "th2zh";
          requestData = { text: input };
          break;
        case "face_blur":
          endpoint = "face_blur";
          requestData = new FormData();
          requestData.append("file", selectedFile);
          config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          break;
        case "thai_food":
          endpoint = "thai_food";
          requestData = new FormData();
          requestData.append("file", selectedFile);
          config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          break;
        case "tag":
          endpoint = "tag";
          requestData = { text: input };
          break;
        case "text_cleansing":
          endpoint = "text_cleansing";
          requestData = { text: input };
          break;
        case "face_detection":
          endpoint = "face_detection";
          requestData = new FormData();
          requestData.append("file", selectedFile);
          config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          break;
        case "emoji":
          endpoint = "emoji";
          requestData = { text: input };
          break;
        default:
          break;
      }

      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        requestData,
        config
      );

      const currentTime = new Date().toLocaleString();

      if (mode === "tokenize" && response.data.tokens) {
        setMessages((prev) => [
          ...prev,
          {
            text: response.data.tokens.result.join(" "),
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      } else if (mode === "textqa" && response.data.answer) {
        setMessages((prev) => [
          ...prev,
          { text: response.data.answer, sender: "bot", timestamp: currentTime },
        ]);
      } else if (mode === "en2th" || mode === "th2en") {
        if (response.data.translate?.translated_text) {
          setMessages((prev) => [
            ...prev,
            {
              text: response.data.translate.translated_text,
              sender: "bot",
              timestamp: currentTime,
            },
          ]);
        }
      } else if (mode === "zh2th" || mode === "th2zh") {
        console.log(response.data.translate);
        setMessages((prev) => [
          ...prev,
          {
            text: response.data.translate.output,
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      } else if (mode === "tag") {
        const tags = response.data.tags.tags || [];
        const tagItems = tags.map((item) => ({
          tag: item.tag,
          score: item.score * 100,
        }));

        setMessages((prev) => [
          ...prev,
          {
            text: "หมวดหมู่ที่เกี่ยวข้อง",
            tags: tagItems, // Store tags array with scores
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      } else if (mode === "text_cleansing") {
        console.log(response.data.textClensing);
        const textClean = response.data.textClensing.cleansing_text;
        setMessages((prev) => [
          ...prev,
          {
            text: textClean,
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      } else if (mode === "face_blur") {
        console.log(response.data);
        if (response.data.URL) {
          const faceInfo = response.data.json_data
            ? `พบใบหน้า ${response.data.json_data.length} ใบหน้า`
            : "ประมวลผลเสร็จสิ้น";

          setMessages((prev) => [
            ...prev,
            {
              text: faceInfo,
              imageUrl: response.data.URL,
              sender: "bot",
              timestamp: currentTime,
              isImage: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: "ไม่สามารถเบลอภาพได้ กรุณาลองใหม่อีกครั้ง",
              sender: "bot",
              timestamp: currentTime,
            },
          ]);
        }
      } else if (mode === "thai_food") {
        const prediction = response.data.thaifood.objects[0].label;
        const score = response.data.thaifood.objects[0].score;
        const scorePercent = score * 100;

        setMessages((prev) => [
          ...prev,
          {
            text: prediction,
            score: scorePercent,
            imageUrl: response.data.image_url,
            sender: "bot",
            timestamp: currentTime,
            isImage: true,
          },
        ]);
      } else if (mode === "face_detection") {
        const faces = response.data.face_detection.objects || [];
        const faceCount = faces.length;

        if (faceCount > 0) {
          // Get image dimensions before creating annotated image
          const img = new Image();
          img.src = response.data.compressed_image_url;
          await new Promise((resolve) => {
            img.onload = () => {
              setImageDimensions({
                width: img.width,
                height: img.height,
              });
              resolve();
            };
          });

          // Create annotated image with face boxes using compressed image
          const annotatedImageUrl = await drawFaceBoxes(
            response.data.compressed_image_url,
            faces.map((face) => ({
              bbox: face.bbox,
              score: parseFloat(face.score) * 100,
            }))
          );

          setMessages((prev) => [
            ...prev,
            {
              text: `พบใบหน้าทั้งหมด ${faceCount} ใบหน้า`,
              faces: faces.map((face) => ({
                bbox: face.bbox,
                score: parseFloat(face.score) * 100,
              })),
              originalImageUrl: response.data.original_image_url,
              imageUrl: annotatedImageUrl,
              sender: "bot",
              timestamp: currentTime,
              isImage: true,
              isFaceDetection: true,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: "ไม่พบใบหน้าในภาพ",
              originalImageUrl: response.data.original_image_url,
              sender: "bot",
              timestamp: currentTime,
              isImage: true,
            },
          ]);
        }
      } else if (mode === "emoji") {
        const emojis = response.data.emojis;
        setMessages((prev) => [
          ...prev,
          {
            text: `ผลลัพธ์: ${emojis.join(" ")}`,
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "รูปแบบข้อมูลที่ได้รับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
            sender: "bot",
            timestamp: currentTime,
          },
        ]);
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: `เกิดข้อผิดพลาด: ${
            error.response?.data?.message || error.message
          }`,
          sender: "bot",
        },
      ]);
    } finally {
      setIsSubmitting(false);

      if (
        mode === "face_blur" ||
        mode === "thai_food" ||
        mode === "face_detection"
      ) {
        if (selectedImage) {
          URL.revokeObjectURL(selectedImage);
        }
        setSelectedFile(null);
        setSelectedFileName("");
        setSelectedImage(null);
      }
    }
  };

  const saveChatHistory = () => {
    const currentTime = new Date().toLocaleString();
    const savedChat = {
      messages,
      mode: getCurrentMode().name,
      timestamp: currentTime,
    };
    setChatHistory((prev) => [...prev, savedChat]);
    setMessages([{ text: "สวัสดีมีอะไรให้ฉันช่วยหรือไม่?", sender: "bot" }]);

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedFile(null);
    setSelectedFileName("");
    setSelectedImage(null);

    toast.success("บันทึกประวัติการแชทสำเร็จ", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const clearChat = () => {
    setMessages([{ text: "สวัสดีมีอะไรให้ฉันช่วยหรือไม่?", sender: "bot" }]);

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setInput(""); // This will always set a string value
    setSelectedFile(null);
    setSelectedFileName("");
    setSelectedImage(null);

    toast.success("ล้างเเชทเเละข้อความเเล้ว", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const confirmEndChat = () => {
    Swal.fire({
      title: "สิ้นสุดการเเชท",
      text: "ต้องการบันทึกข้อมูลเเชทหรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ไม่บันทึก",
    }).then((result) => {
      if (result.isConfirmed) {
        saveChatHistory();
      }
    });
  };

  const testApiConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      console.log("API Connection Test:", response.data);
      toast.success("เชื่อมต่อกับ API สำเร็จ", {
        position: "top-right",
        autoClose: 3000,
      });
      return true;
    } catch (error) {
      console.error("API Connection Test Failed:", error);
      toast.error(`ไม่สามารถเชื่อมต่อกับ API: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    }
  };

  useEffect(() => {
    testApiConnection();

    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, []);

  const currentMode = getCurrentMode();
  const isImageMode =
    mode === "face_blur" || mode === "thai_food" || mode === "face_detection";

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Add function to get category from mode
  const getModeCategory = (modeName) => {
    for (const category of modeCategories) {
      const mode = category.modes.find((m) => m.name === modeName);
      if (mode) {
        return category.title;
      }
    }
    return "ไม่ระบุหมวดหมู่";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:translate-x-0 inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-30 lg:z-0`}>
        <Sidebar
          currentMode={getCurrentMode()}
          setMode={setMode}
          modes={modes}
          setShowChatHistory={setShowChatHistory}
          showChatHistory={showChatHistory}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {showChatHistory ? (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Header with Controls */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-gray-100 rounded-lg hidden lg:block">
                  <Menu className="w-5 h-5" />
                </button>
                {currentMode?.icon}
                <h1 className="text-xl font-semibold text-gray-800">
                  {currentMode?.name}
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={clearChat} size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  ล้างแชท
                </Button>
                <Button onClick={confirmEndChat} size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  บันทึกประวัติการแชท
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 scroll-smooth">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}>
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800"
                      }`}>
                      <div
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: msg.text.replace(/\n/g, "<br />"),
                        }}
                      />
                      {msg.tags && (
                        <div className="mt-3 space-y-3">
                          {msg.tags.map((tag, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{tag.tag}</span>
                                <span>{tag.score.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${tag.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.score !== undefined && !msg.tags && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${msg.score}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            ความเชื่อมั่น: {msg.score.toFixed(2)}%
                          </p>
                        </div>
                      )}
                      {msg.isImage && (
                        <div className="mt-3 space-y-4">
                          {msg.isFaceDetection ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 mb-2">
                                  ภาพต้นฉบับ
                                </p>
                                <img
                                  src={msg.originalImageUrl}
                                  alt="Original"
                                  className="rounded-lg w-full"
                                />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 mb-2">
                                  ผลการตรวจจับใบหน้า
                                </p>
                                <img
                                  src={msg.imageUrl}
                                  alt="Face Detection Result"
                                  className="rounded-lg w-full"
                                />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={msg.imageUrl || msg.originalImageUrl}
                              alt="Result"
                              className="rounded-lg max-w-sm"
                            />
                          )}
                        </div>
                      )}
                      {msg.faces && (
                        <div className="mt-3">
                          <p className="mb-2">ผลการตรวจจับใบหน้า:</p>
                          {msg.faces.map((face, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 p-2 rounded mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>ใบหน้าที่ {idx + 1}</span>
                                <span>{face.score.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${face.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.emojis && (
                        <div className="mt-2 space-x-2">
                          {msg.emojis.map((emoji, idx) => (
                            <span key={idx} className="text-2xl">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Input Area */}
            <div className="border-t bg-white p-4 sticky bottom-0 z-10">
              <div className="max-w-3xl mx-auto">
                {isImageMode ? (
                  <div className="space-y-4">
                    {selectedImage ? (
                      <div className="relative">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={selectedImage}
                            alt="Preview"
                            className="w-full h-[200px] object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                              <Button
                                onClick={sendMessage}
                                disabled={isSubmitting}
                                className="bg-blue-500 hover:bg-blue-600">
                                {isSubmitting ? (
                                  "กำลังประมวลผล..."
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    ส่งรูปภาพ
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setSelectedFileName("");
                                  setSelectedImage(null);
                                }}
                                className="bg-red-500 hover:bg-red-600">
                                <X className="w-4 h-4 mr-2" />
                                ยกเลิก
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          {selectedFileName}
                        </p>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          document.getElementById("image-upload").click()
                        }
                        className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          onChange={handleFileChange}
                        />
                        <div className="text-center">
                          <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            คลิกหรือลากไฟล์มาวางที่นี่
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1 flex bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <Input
                        className="flex-1 border-none bg-transparent px-4 focus:ring-0"
                        placeholder="พิมพ์ข้อความของคุณ..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={isSubmitting}
                        className="rounded-none px-6">
                        {isSubmitting ? (
                          "กำลังส่ง..."
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                ประวัติการสนทนา
              </h2>
              <div className="space-y-4">
                {chatHistory.length > 0 ? (
                  chatHistory.map((chat, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedChat(chat)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <span className="font-medium text-gray-800">
                              {chat.mode}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {chat.timestamp}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          หมวดหมู่: {getModeCategory(chat.mode)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ยังไม่มีประวัติการสนทนา</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat History Modal */}
        {selectedChat && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    ประวัติการสนทนา
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    หมวดหมู่: {getModeCategory(selectedChat.mode)}
                  </p>
                  <p className="text-sm text-gray-500">
                    โหมด: {selectedChat.mode} | เวลา: {selectedChat.timestamp}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedChat(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {selectedChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}>
                    <div
                      className={`max-w-2xl rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.tags && (
                        <div className="mt-3 space-y-3">
                          {msg.tags.map((tag, tagIdx) => (
                            <div key={tagIdx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{tag.tag}</span>
                                <span>{tag.score.toFixed(2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${tag.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.isImage && (
                        <div className="mt-3 space-y-4">
                          {msg.isFaceDetection ? (
                            <div className="grid grid-cols-1 gap-4">
                              <img
                                src={msg.imageUrl}
                                alt="Face Detection Result"
                                className="rounded-lg w-full"
                              />
                              {msg.faces && (
                                <div className="space-y-2">
                                  {msg.faces.map((face, faceIdx) => (
                                    <div
                                      key={faceIdx}
                                      className="bg-white/50 p-2 rounded">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>ใบหน้าที่ {faceIdx + 1}</span>
                                        <span>{face.score.toFixed(2)}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${face.score}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <img
                              src={msg.imageUrl}
                              alt="Result"
                              className="rounded-lg max-w-sm"
                            />
                          )}
                        </div>
                      )}
                      {msg.timestamp && (
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}>
                          {msg.timestamp}
                        </div>
                      )}
                      {msg.emojis && (
                        <div className="mt-2 space-x-2">
                          {msg.emojis.map((emoji, idx) => (
                            <span key={idx} className="text-2xl">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
