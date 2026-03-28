import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ToolCard } from "@/components/home/ToolCard";
import { FileUp, SplitSquareHorizontal, FileArchive, RotateCw, Type, Image as ImageIcon, Eye } from "lucide-react";

const tools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into one unified document.", href: "/merge", icon: FileUp },
  { title: "Split PDF", description: "Extract pages or split a PDF into multiple files.", href: "/split", icon: SplitSquareHorizontal },
  { title: "Compress PDF", description: "Reduce file size while maintaining quality.", href: "/compress", icon: FileArchive },
  { title: "Rotate PDF", description: "Rotate specific pages or the entire document.", href: "/rotate", icon: RotateCw },
  { title: "Watermark PDF", description: "Add custom text watermarks to your pages.", href: "/watermark", icon: Type },
  { title: "Image to PDF", description: "Convert JPG, PNG, and WebP images to PDF.", href: "/image-to-pdf", icon: ImageIcon },
  { title: "PDF Preview", description: "View all pages as thumbnails instantly.", href: "/preview", icon: Eye },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
