import BlogPage from "./blog/page";

import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BlogPage />
    </div>
  );
}
