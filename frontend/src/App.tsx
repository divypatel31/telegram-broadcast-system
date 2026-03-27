import { useState, useRef, useCallback } from "react";

const styles = `/* same styles as your code (keep unchanged) */`;

type ToastType = "success" | "error";

interface Toast {
  type: ToastType;
  text: string;
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext || "")) return "📄";
  if (["doc", "docx"].includes(ext || "")) return "📝";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "🖼️";
  if (["zip", "rar", "tar"].includes(ext || "")) return "📦";
  if (["mp4", "mov", "avi"].includes(ext || "")) return "🎥";
  return "📎";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [toast, setToast] = useState<Toast | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const contactCount = 142;

  const showToast = (type: ToastType, text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = (f: File | undefined) => {
    if (f) setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const handleSend = async () => {
    if (!file) {
      showToast("error", "⚠️ Please select a file first");
      return;
    }

    setSending(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 85));
    }, 300);

    try {
      const res = await fetch("http://localhost:5000/api/send-file", {
        method: "POST",
        body: formData,
      });

      clearInterval(tick);
      setProgress(100);

      if (res.ok) {
        showToast("success", `✅ Sent to ${contactCount} contacts`);
        setFile(null);
        setMessage("");
      } else {
        showToast("error", "❌ Server error");
      }
    } catch (error) {
      clearInterval(tick);
      showToast("error", "❌ Cannot connect to server");
    } finally {
      setTimeout(() => {
        setSending(false);
        setProgress(0);
      }, 600);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="app">
        <div className="card">
          <div className="card-header">
            <div className="tg-icon">✈️</div>
            <div className="header-text">
              <h1>TELEGRAM BROADCAST</h1>
              <p>Admin Panel</p>
            </div>
            <div className="contact-badge">👥 {contactCount}</div>
          </div>

          <div className="card-body">
            <div>
              <div className="field-label">Attachment</div>

              {!file ? (
                <div
                  className={`drop-zone${isDragOver ? " drag-over" : ""}`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    style={{ display: "none" }}
                  />

                  <span className="drop-icon">📁</span>
                  <div className="drop-label">
                    Drop file or <span>browse</span>
                  </div>
                </div>
              ) : (
                <div className="file-pill">
                  <span>{getFileIcon(file.name)}</span>
                  <div>
                    <div>{file.name}</div>
                    <div>{formatBytes(file.size)}</div>
                  </div>
                  <button onClick={() => setFile(null)}>✕</button>
                </div>
              )}
            </div>

            <div>
              <div className="field-label">Message</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {sending && (
              <div className="progress-wrap">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={sending || !file}
            >
              {sending ? "Sending..." : "SEND"}
            </button>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </>
  );
}