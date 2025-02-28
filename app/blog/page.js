import {
  BookOpen,
  Code,
  Brain,
  Camera,
  Languages,
  MessageSquare,
  ScanText,
  Tag,
} from "lucide-react";

const blogPosts = [
  {
    title: "การตัดคำภาษาไทย (Thai Word Tokenization)",
    description:
      "เรียนรู้เกี่ยวกับการตัดคำภาษาไทยด้วย AI และการประยุกต์ใช้งานในด้านต่างๆ ",
    icon: <Code className="w-6 h-6" />,
    category: "NLP",
  },
  {
    title: "การแปลภาษาอัตโนมัติ (Auto Translation)",
    description:
      "ค้นพบวิธีการแปลภาษาอัตโนมัติระหว่างภาษาไทยและภาษาอังกฤษด้วยเทคโนโลยี AI",
    icon: <Languages className="w-6 h-6" />,
    category: "Translation",
  },
  {
    title: "การถาม-ตอบอัตโนมัติ (Question Answering)",
    description:
      "ระบบ AI ที่สามารถตอบคำถามและให้ข้อมูลที่เกี่ยวข้องได้อย่างชาญฉลาด",
    icon: <MessageSquare className="w-6 h-6" />,
    category: "AI",
  },
  {
    title: "การเบลอใบหน้าอัตโนมัติ (Face Blurring)",
    description:
      "เทคโนโลยีการตรวจจับและเบลอใบหน้าอัตโนมัติเพื่อความเป็นส่วนตัว",
    icon: <Camera className="w-6 h-6" />,
    category: "Computer Vision",
  },
  {
    title: "การจำแนกอาหารไทย (Thai Food Classification)",
    description:
      "ระบบ AI ที่สามารถจำแนกและระบุชื่ออาหารไทยจากรูปภาพได้อย่างแม่นยำ",
    icon: <Brain className="w-6 h-6" />,
    category: "Image Recognition",
  },
  {
    title: "การปรับปรุงข้อความ (Text Cleansing)",
    description:
      "ระบบ AI ที่สามารถตรวจสอบและปรับปรุงข้อความให้สะอาดและเหมาะสมสำหรับการใช้งาน",
    icon: <ScanText className="w-6 h-6" />,
    category: "Text Processing",
  },
  {
    title: "การค้นหาหมวดหมู่ (Tagging)",
    description:
      "ระบบ AI ที่สามารถค้นหาหมวดหมู่และระบุประเภทของข้อมูลได้อย่างแม่นยำ",
    icon: <Tag className="w-6 h-6" />,
    category: "Data Analysis",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ฟีเจอร์ของระบบ</h1>
        <p className="text-xl text-gray-600">
          เรียนรู้เกี่ยวกับเทคโนโลยี AI และการประยุกต์ใช้งาน โดยใช้ AI FOR THAI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {blogPosts.map((post, index) => (
          <article
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {post.icon}
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {post.category}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                {post.title}
              </h2>

              <p className="text-gray-600 mb-4">{post.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
