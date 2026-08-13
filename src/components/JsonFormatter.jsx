import { useState, useRef, useEffect, useCallback } from "react";
import {
  Braces,
  Sparkles,
  Minimize2,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

const countLines = (text) => (text ? text.split("\n").length : 0);
const formatBytes = (n) =>
  n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState("No output");
  const [message, setMessage] = useState(null); // { text, type }
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const inputStatus = input.trim() ? "Data entered" : "Waiting for input";
  const showMessage = (text, type) => setMessage({ text, type });

  const parseInput = () => {
    const value = input.trim();
    if (!value) {
      showMessage("Enter JSON data to continue.", "error");
      return undefined;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      setOutput("");
      setOutputStatus("Invalid JSON");
      showMessage(`Invalid JSON: ${error.message}`, "error");
      return undefined;
    }
  };

  const formatJson = useCallback(() => {
    const json = parseInput();
    if (json === undefined) return;
    setOutput(JSON.stringify(json, null, 4));
    setOutputStatus("Valid JSON");
    showMessage("JSON formatted.", "success");
  }, [input]);

  const minifyJson = () => {
    const json = parseInput();
    if (json === undefined) return;
    setOutput(JSON.stringify(json));
    setOutputStatus("Minified");
    showMessage("JSON minified.", "success");
  };

  const copyJson = async () => {
    if (!output) {
      showMessage("Format some JSON first, then copy it.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      showMessage("Copied to clipboard.", "success");
    } catch {
      showMessage("Copy failed. Select the text and copy manually.", "error");
    }
  };

  const downloadJson = () => {
    if (!output) {
      showMessage("Format some JSON first, then download it.", "error");
      return;
    }
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = url;
    link.download = `formatted-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showMessage(`Downloaded ${link.download}`, "success");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setOutputStatus("No output");
    setMessage(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const el = event.target;
      const { selectionStart: start, selectionEnd: end } = el;
      setInput(input.slice(0, start) + "    " + input.slice(end));
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      formatJson();
    }
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const btnBase =
    "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-4";

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:h-[72px] sm:px-9">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-600 to-violet-600 text-white sm:h-10 sm:w-10">
            <Braces size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight sm:text-[18px]">
              JSON Formatter
            </h2>
            <span className="hidden text-xs text-slate-500 sm:inline">
              Format, validate and minify JSON
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          <span className="hidden sm:inline">Ready</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1450px] px-4 py-5 sm:px-8 sm:py-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-bold tracking-tight sm:text-[28px]">
              Format your JSON
            </h1>
            <p className="text-sm text-slate-500">
              Paste JSON on the left, format it, then copy or download the
              result.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:flex lg:flex-wrap">
            <button
              onClick={formatJson}
              className={`${btnBase} col-span-2 bg-blue-600 text-white hover:bg-blue-700 sm:col-span-1`}
            >
              <Sparkles size={16} /> Format
            </button>
            <button
              onClick={minifyJson}
              className={`${btnBase} border border-slate-200 bg-white hover:bg-slate-50`}
            >
              <Minimize2 size={16} /> Minify
            </button>
            <button
              onClick={copyJson}
              className={`${btnBase} border border-slate-200 bg-white hover:bg-slate-50`}
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={downloadJson}
              className={`${btnBase} border border-slate-200 bg-white hover:bg-slate-50`}
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={clearAll}
              className={`${btnBase} border border-rose-200 bg-rose-50 text-red-600 hover:bg-rose-100`}
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <EditorCard
            icon={<ArrowDownToLine size={15} />}
            label="INPUT JSON"
            info={inputStatus}
            text={input}
            footerRight="JSON"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              aria-label="Input JSON"
              placeholder={
                'Paste your JSON here...\n\nExample:\n\n{\n    "name": "John",\n    "age": 30,\n    "city": "Chennai"\n}'
              }
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-slate-200 outline-none placeholder:text-slate-500 sm:p-5"
            />
            <div className="pointer-events-none absolute right-3 top-3 hidden rounded-md border border-dashed border-slate-600 px-2.5 py-1.5 text-[11px] text-slate-400 sm:block">
              Ctrl + Enter to format
            </div>
          </EditorCard>

          <EditorCard
            icon={<ArrowUpFromLine size={15} />}
            label="FORMATTED JSON"
            info={outputStatus}
            text={output}
            footerRight="Formatted"
          >
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              aria-label="Formatted JSON"
              placeholder="Formatted JSON will appear here..."
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-blue-100 outline-none placeholder:text-slate-500 sm:p-5"
            />
          </EditorCard>
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`mt-4 flex min-h-[42px] items-center gap-2 rounded-lg px-4 text-[13px] transition-opacity duration-200 ${
            message ? "opacity-100" : "opacity-0"
          } ${
            message?.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message &&
            (message.type === "error" ? (
              <CircleAlert size={16} className="shrink-0" />
            ) : (
              <CircleCheck size={16} className="shrink-0" />
            ))}
          <span className="break-words">{message?.text ?? ""}</span>
        </div>
      </main>
    </div>
  );
}

function EditorCard({ icon, label, info, text, footerRight, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-12 items-center justify-between border-b border-slate-200 px-3 sm:h-[50px] sm:px-4">
        <div className="flex items-center gap-2 text-xs font-bold sm:text-[13px]">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <span className="text-[11px] text-slate-500">{info}</span>
      </div>

      <div className="relative h-[280px] bg-slate-900 sm:h-[420px] lg:h-[540px]">
        {children}
      </div>

      <div className="flex h-10 items-center justify-between border-t border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-500 sm:h-[42px] sm:px-3.5">
        <div className="flex gap-3 sm:gap-4">
          <span>
            Lines: <b>{countLines(text)}</b>
          </span>
          <span>
            Size: <b>{formatBytes(text.length)}</b>
          </span>
        </div>
        <span className="hidden sm:inline">{footerRight}</span>
      </div>
    </div>
  );
}
