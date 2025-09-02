import { Check, FileCode, FileJson } from "lucide-react";
import { useMemo, useState } from "react";
import { jsonToTypescript } from "../lib/json-to-ts";

const example = `{
    "id": 123,
    "name": "Acme Widget",
    "tags": ["a", "b"],
    "inStock": true,
    "variants": [
      { "sku": "W-1", "price": 9.99 },
      { "sku": "W-2", "price": 12.5 }
    ]
  }`;

export default function Workspace() {
  const [raw, setRaw] = useState<string>(example);
  const [error, setError] = useState<string | null>(null);
  const [rootName, setRootName] = useState<string>("Root");
  const [copied, setCopied] = useState<boolean>(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert tab at cursor position
      const newValue = value.slice(0, start) + "\t" + value.slice(end);

      // Update the textarea value
      textarea.value = newValue;
      setRaw(newValue);

      // Move cursor after the inserted tab
      const newCursorPos = start + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRaw(e.target.value);
  };

  const output = useMemo(() => {
    try {
      setError(null);
      const parsed = JSON.parse(raw);
      return jsonToTypescript(parsed, rootName || "Root");
    } catch (e) {
      setError((e as Error).message);
      return "";
    }
  }, [raw, rootName]);

  return (
    <main className="flex-1 flex items-center">
      <div className="mx-auto w-full max-w-screen-xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON input */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2">
            <div>
              <h2 className="text-sm font-medium">
                <FileJson /> Raw JSON
              </h2>

              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Paste Raw JSON Input
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={rootName}
                onInput={(e) =>
                  setRootName((e.target as HTMLInputElement).value)
                }
                placeholder="Root name"
                className="h-9 w-36 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              <button
                className="cursor-pointer h-8 rounded-md border border-zinc-200 dark:border-zinc-800 px-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setRaw(example)}
              >
                Load example
              </button>
              <button
                className="cursor-pointer h-8 rounded-md border border-zinc-200 dark:border-zinc-800 px-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setRaw("")}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={raw}
            onKeyDown={handleKeyDown}
            onChange={handleInput}
            className="min-h-[50dvh] w-full resize-y bg-transparent p-4 font-mono text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            placeholder="Paste JSON here..."
          />
          {error && (
            <div className="border-t border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300">
              Invalid JSON: {error}
            </div>
          )}
        </section>

        {/* Right: TS output */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2">
            <div>
              <h2 className="text-sm font-medium">
                <FileCode />
                TypeScript
              </h2>
              <div className="text-xs pt-1 text-zinc-500 dark:text-zinc-400">
                Generated from JSON
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!output) return;
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                }}
                className="cursor-pointer h-8 rounded-md border border-zinc-200 dark:border-zinc-800 px-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1"
                disabled={!output}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied
                  </>
                ) : (
                  <>Copy TS</>
                )}
              </button>
            </div>
          </div>
          <pre className="min-h-[50dvh] w-full bg-transparent p-4 text-sm overflow-auto text-zinc-900 dark:text-zinc-100">
            <code className="font-mono whitespace-pre-wrap break-words">
              {output || "/* Valid JSON will generate interfaces here */"}
            </code>
          </pre>
        </section>
      </div>
    </main>
  );
}
