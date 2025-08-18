import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { ThemeProvider } from "./components/theme-provider";
import Workspace from "./components/workspace";

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen relative overflow-hidden flex flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Background Blobs */}
        <div
          className="pointer-events-none absolute top-4 left-0 -translate-x-1/2 w-48 sm:w-72 h-48 sm:h-72 
          bg-purple-300 dark:bg-purple-700/60 
          rounded-full 
          mix-blend-multiply dark:mix-blend-lighten 
          blur-xl 
          opacity-70 dark:opacity-60 
          animate-blob"
        ></div>
        <div
          className="pointer-events-none absolute top-4 right-4 w-48 sm:w-72 h-48 sm:h-72 
          bg-yellow-300 dark:bg-yellow-400/40 
          rounded-full 
          mix-blend-multiply dark:mix-blend-lighten 
          blur-xl 
          opacity-70 dark:opacity-50 
          animate-blob animation-delay-2000"
        ></div>
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 w-48 sm:w-72 h-48 sm:h-72 
          bg-pink-300 dark:bg-pink-600/50 
          rounded-full 
          mix-blend-multiply dark:mix-blend-lighten 
          blur-xl 
          opacity-70 dark:opacity-50 
          animate-blob animation-delay-4000"
        ></div>

        {/* Navbar */}
        <Navbar />

        {/* Workspace */}
        <Workspace />

        {/* Footer */}
        <Footer />
      </div>
      <Analytics />
    </ThemeProvider>
  );
}
