import React, { useState, useRef, useCallback, ChangeEvent, DragEvent, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Outfit', sans-serif;
    background: #050505;
    background-image: 
      radial-gradient(at 0% 0%, rgba(41, 182, 246, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(2, 119, 189, 0.15) 0px, transparent 50%);
    color: #E0E8F0;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .card {
    width: 100%;
    max-width: 540px;
    background: rgba(15, 20, 25, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 24px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .card-header {
    padding: 32px 32px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tg-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #29B6F6, #0277BD);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: 0 8px 20px rgba(41,182,246,0.3);
  }

  .header-text h1 {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: -0.5px;
    margin-bottom: 2px;
  }

  .header-text p {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    font-weight: 300;
  }

  .status-badge {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 8px 14px;
    border-radius: 20px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background-color: #4CAF50;
    border-radius: 50%;
    box-shadow: 0 0 10px #4CAF50;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
  }

  .status-text {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #E0E8F0;
  }

  .status-text span {
    color: #4CAF50;
    font-weight: 700;
  }

  .card-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Drop zone */
  .drop-zone {
    border: 2px dashed rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(0,0,0,0.2);
    position: relative;
  }

  .drop-zone:hover, .drop-zone.drag-over {
    border-color: rgba(41,182,246,0.6);
    background: rgba(41,182,246,0.05);
    transform: translateY(-2px);
  }

  .drop-zone input[type="file"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }

  .drop-icon {
    font-size: 36px;
    margin-bottom: 12px;
    display: block;
    opacity: 0.8;
  }

  .drop-label {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    font-weight: 400;
  }

  .drop-label span {
    color: #29B6F6;
    font-weight: 600;
  }

  /* File pill */
  .file-pill {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(41,182,246,0.1);
    border: 1px solid rgba(41,182,246,0.3);
    border-radius: 14px;
    padding: 16px 20px;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .file-pill-icon { font-size: 28px; flex-shrink: 0; }

  .file-pill-info { flex: 1; min-width: 0; }
  .file-pill-name {
    font-size: 14px;
    font-weight: 600;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .file-pill-size {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-family: 'Space Mono', monospace;
    margin-top: 4px;
  }

  .file-pill-remove {
    background: rgba(255,255,255,0.05);
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .file-pill-remove:hover { color: #fff; background: #ef5350; }

  /* Message input */
  .field-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 10px;
    font-family: 'Outfit', sans-serif;
  }

  textarea {
    width: 100%;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    color: #E0E8F0;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    resize: none;
    outline: none;
    transition: all 0.2s;
    min-height: 100px;
  }
  textarea::placeholder { color: rgba(255,255,255,0.2); }
  textarea:focus { 
    border-color: rgba(41,182,246,0.5); 
    background: rgba(0,0,0,0.4);
    box-shadow: 0 0 0 4px rgba(41,182,246,0.1);
  }

  /* Send button */
  .send-btn {
    width: 100%;
    background: linear-gradient(135deg, #29B6F6 0%, #0277BD 100%);
    border: none;
    border-radius: 14px;
    padding: 18px;
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(41,182,246,0.4);
  }

  .send-btn:disabled {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.3);
    cursor: not-allowed;
  }

  /* Progress bar */
  .progress-wrap {
    background: rgba(0,0,0,0.3);
    border-radius: 8px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #29B6F6, #4CAF50);
    border-radius: 8px;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(41,182,246,0.5);
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 20, 25, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    z-index: 1000;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toast.success { border-bottom: 3px solid #4CAF50; }
  .toast.error { border-bottom: 3px solid #ef5350; }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

type ToastData = {
  type: "success" | "error";
  text: string;
};

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
  if (["zip", "rar", "tar"].includes(ext)) return "📦";
  if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
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
  const [toast, setToast] = useState<ToastData | null>(null);
  
  // ✅ NEW: State to hold the real contact count
  const [contactCount, setContactCount] = useState<number>(0);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NEW: Fetch the real contact count when the component loads
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/count");
        if (response.ok) {
          const data = await response.json();
          setContactCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch user count", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchUserCount();
  }, []); // Empty dependency array means this runs once when the page loads

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = (f: File | null | undefined) => {
    if (f) setFile(f);
  };

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const handleSend = async () => {
    if (!file) {
      showToast("error", "⚠️  Please select a file first");
      return;
    }
    if (contactCount === 0) {
      showToast("error", "⚠️  No users in database to send to.");
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
        showToast("success", `✅ Broadcast successful to ${contactCount} users!`);
        setFile(null);
        setMessage("");
      } else {
        showToast("error", "❌ Server error. Check backend logs.");
      }
    } catch {
      clearInterval(tick);
      showToast("error", "❌ Could not reach the server");
    } finally {
      setTimeout(() => {
        setSending(false);
        setProgress(0);
      }, 800);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="card">
          {/* Header */}
          <div className="card-header">
            <div className="tg-icon">✈️</div>
            <div className="header-text">
              <h1>TELEGRAM SYSTEM</h1>
              <p>Admin Broadcast Control</p>
            </div>
            
            {/* ✅ NEW: Dynamic Live Status Badge */}
            <div className="status-badge">
              <div className="status-dot"></div>
              <div className="status-text">
                {isLoadingContacts ? "Loading..." : <span>{contactCount}</span>} Users
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* File upload */}
            <div>
              <div className="field-label">Media Attachment</div>
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleFile(e.target.files?.[0])
                    }
                    style={{ display: "none" }}
                  />
                  <span className="drop-icon">📁</span>
                  <div className="drop-label">
                    Drag and drop file here or <span>browse files</span>
                  </div>
                </div>
              ) : (
                <div className="file-pill">
                  <span className="file-pill-icon">{getFileIcon(file.name)}</span>
                  <div className="file-pill-info">
                    <div className="file-pill-name">{file.name}</div>
                    <div className="file-pill-size">{formatBytes(file.size)}</div>
                  </div>
                  <button
                    className="file-pill-remove"
                    onClick={() => setFile(null)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <div className="field-label">Broadcast Caption</div>
              <textarea
                placeholder="Write an announcement to send to all users..."
                value={message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(e.target.value)
                }
                maxLength={1024}
              />
            </div>

            {/* Progress */}
            {sending && (
              <div className="progress-wrap">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Send */}
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={sending || !file || contactCount === 0}
            >
              {sending ? (
                <>
                  <span className="spinner" /> BROADCASTING...
                </>
              ) : (
                <>✈️ INITIATE BROADCAST</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.text}
        </div>
      )}
    </>
  );
}