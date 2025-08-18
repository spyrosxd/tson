import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-zinc-950/40">
      <div className="mx-auto max-w-screen-xl px-4 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="size-10 rounded shadow-sm" />
          <span className="font-semibold tracking-tight">TSON CONVERTER</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
