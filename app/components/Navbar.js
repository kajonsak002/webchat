import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <Link
                href="/chatbot"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600">
                ChatBot
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600">
                ฟีเจอร์ของระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
