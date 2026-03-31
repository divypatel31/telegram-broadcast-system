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
    padding: 40px 24px;
    transition: padding 0.3s ease;
  }

  .dashboard-layout {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .dashboard-layout { flex-direction: column; align-items: center; }
    .preview-phone { display: none !important; }
  }

  @media (max-width: 600px) {
    .app { padding: 16px 12px; }
    .card { border-radius: 18px !important; max-height: calc(100vh - 32px) !important; }
    .card-header { padding: 24px 20px 20px !important; }
    .card-body { padding: 20px !important; gap: 20px !important; }
    .header-text h1 { font-size: 14px !important; }
    .status-badge { padding: 6px 10px !important; }
    .tab-btn { padding: 14px 10px !important; font-size: 12px !important; }
    .drop-zone { padding: 30px 16px !important; }
    .btn-group { flex-direction: column !important; gap: 10px !important; }
    .history-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
    .toast { width: 90% !important; padding: 12px 16px !important; font-size: 13px !important; bottom: 20px !important; }
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
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }

  .card-header {
    padding: 32px 32px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
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

  .header-text h1 { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 2px; }
  .header-text p { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 300; }

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

  .logout-btn {
    background: rgba(239,83,80,0.1);
    color: #ef5350;
    border: 1px solid rgba(239,83,80,0.3);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: auto;
  }
  .logout-btn:hover { background: rgba(239,83,80,0.2); }

  .status-dot { width: 8px; height: 8px; background-color: #4CAF50; border-radius: 50%; box-shadow: 0 0 10px #4CAF50; animation: pulse 2s infinite; }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
  }

  .status-text { font-family: 'Space Mono', monospace; font-size: 11px; color: #E0E8F0; }
  .status-text span { color: #4CAF50; font-weight: 700; }

  .tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2); flex-shrink: 0; }
  .tab-btn { flex: 1; background: none; border: none; padding: 16px; color: rgba(255,255,255,0.5); font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; border-bottom: 2px solid transparent; }
  .tab-btn:hover { color: rgba(255,255,255,0.8); }
  .tab-btn.active { color: #29B6F6; border-bottom: 2px solid #29B6F6; background: rgba(41,182,246,0.05); }

  .card-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }

  .drop-zone { border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(0,0,0,0.2); position: relative; }
  .drop-zone:hover, .drop-zone.drag-over { border-color: rgba(41,182,246,0.6); background: rgba(41,182,246,0.05); transform: translateY(-2px); }
  .drop-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .drop-icon { font-size: 36px; margin-bottom: 12px; display: block; opacity: 0.8; }
  .drop-label { font-size: 14px; color: rgba(255,255,255,0.6); font-weight: 400; }
  .drop-label span { color: #29B6F6; font-weight: 600; }

  .file-pill { display: flex; align-items: center; gap: 16px; background: rgba(41,182,246,0.1); border: 1px solid rgba(41,182,246,0.3); border-radius: 14px; padding: 16px 20px; animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .file-pill-icon { font-size: 28px; flex-shrink: 0; }
  .file-pill-info { flex: 1; min-width: 0; }
  .file-pill-name { font-size: 14px; font-weight: 600; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .file-pill-size { font-size: 12px; color: rgba(255,255,255,0.4); font-family: 'Space Mono', monospace; margin-top: 4px; }
  .file-pill-remove { background: rgba(255,255,255,0.05); border: none; color: rgba(255,255,255,0.6); cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .file-pill-remove:hover { color: #fff; background: #ef5350; }

  .field-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; font-family: 'Outfit', sans-serif; display: flex; justify-content: space-between; }

  input[type="password"], input[type="datetime-local"], input[type="text"], textarea {
    width: 100%;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px;
    color: #E0E8F0;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    outline: none;
    transition: all 0.2s;
  }
  
  input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }

  textarea { resize: none; min-height: 100px; }
  input[type="password"]::placeholder, input[type="text"]::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
  input[type="password"]:focus, input[type="datetime-local"]:focus, input[type="text"]:focus, textarea:focus { border-color: rgba(41,182,246,0.5); background: rgba(0,0,0,0.4); box-shadow: 0 0 0 4px rgba(41,182,246,0.1); }

  .schedule-toggle {
    background: none; border: none; color: #29B6F6; font-size: 13px; font-weight: 600; 
    cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: 'Outfit';
  }
  .schedule-toggle:hover { color: #fff; }

  .mode-switch {
    background: none; border: none; color: rgba(255,255,255,0.4); font-size: 11px;
    cursor: pointer; font-family: 'Space Mono', monospace; text-transform: uppercase;
  }
  .mode-switch:hover { color: #29B6F6; }

  .btn-group { display: flex; gap: 12px; }
  .send-btn { width: 100%; background: linear-gradient(135deg, #29B6F6 0%, #0277BD 100%); border: none; border-radius: 14px; padding: 18px; color: #fff; font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
  .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(41,182,246,0.4); }
  .send-btn:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); cursor: not-allowed; }
  
  .send-btn.schedule-btn { background: linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%); }
  .send-btn.schedule-btn:hover:not(:disabled) { box-shadow: 0 12px 28px rgba(171,71,188,0.4); }

  .abort-btn { background: linear-gradient(135deg, #ef5350 0%, #c62828 100%); box-shadow: 0 4px 15px rgba(239,83,80,0.3); }
  .abort-btn:hover:not(:disabled) { box-shadow: 0 8px 25px rgba(239,83,80,0.5); }

  .progress-wrap { background: rgba(0,0,0,0.3); border-radius: 8px; height: 6px; overflow: hidden; margin-bottom: 8px; }
  .progress-bar { height: 100%; background: linear-gradient(90deg, #29B6F6, #4CAF50); border-radius: 8px; transition: width 0.3s ease; box-shadow: 0 0 10px rgba(41,182,246,0.5); }

  .history-list { display: flex; flex-direction: column; gap: 12px; }
  .history-item { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: background 0.2s; }
  .history-item:hover { background: rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.1); }
  .history-header { display: flex; justify-content: space-between; align-items: center; }
  .history-date { font-family: 'Space Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.4); }
  .history-stats { display: flex; gap: 8px; }
  .stat-pill { font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
  .stat-pill.success { background: rgba(76,175,80,0.1); color: #81C784; border: 1px solid rgba(76,175,80,0.2); }
  .stat-pill.error { background: rgba(239,83,80,0.1); color: #E57373; border: 1px solid rgba(239,83,80,0.2); }
  .history-message { font-size: 14px; color: #E0E8F0; line-height: 1.4; word-break: break-word; }
  .history-file { font-size: 12px; color: #29B6F6; display: flex; align-items: center; gap: 6px; background: rgba(41,182,246,0.05); padding: 6px 10px; border-radius: 6px; width: fit-content; }

  .pagination-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
  .page-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: 'Space Mono', monospace; font-size: 12px; transition: all 0.2s; }
  .page-btn:hover:not(:disabled) { background: rgba(41,182,246,0.15); border-color: #29B6F6; }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .page-info { font-size: 12px; color: rgba(255,255,255,0.4); font-family: 'Space Mono', monospace; }

  .preview-phone { width: 340px; height: 700px; background: #0E1621; border-radius: 40px; border: 10px solid #1a1a1a; box-shadow: 0 24px 40px rgba(0,0,0,0.5), inset 0 0 0 2px #333; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; position: sticky; top: 40px; animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .phone-header { background: #17212B; padding: 16px 20px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid rgba(0,0,0,0.2); }
  .phone-avatar { width: 40px; height: 40px; background: #29B6F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(41,182,246,0.3); }
  .phone-title { color: #fff; font-weight: 600; font-size: 16px; letter-spacing: 0.3px; }
  .phone-subtitle { color: #7F91A4; font-size: 12px; margin-top: 2px;}
  .phone-body { flex: 1; background: #0E1621; padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .chat-bubble { background: #182533; border-radius: 14px 14px 14px 4px; padding: 10px; max-width: 90%; color: #E4EBF2; font-size: 14px; position: relative; align-self: flex-start; box-shadow: 0 1px 2px rgba(0,0,0,0.2); word-break: break-word; }
  .bubble-file { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); }
  .bubble-file-icon { width: 44px; height: 44px; background: #2B5278; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .bubble-file-name { font-weight: 600; font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
  .bubble-file-size { font-size: 12px; color: #7F91A4; margin-top: 2px; }
  .bubble-text { padding: 4px 4px 8px 4px; white-space: pre-wrap; line-height: 1.5; }
  .bubble-time { font-size: 11px; color: #7F91A4; text-align: right; margin-top: 4px; padding-right: 4px; }
  .placeholder-msg { text-align: center; color: rgba(255,255,255,0.2); font-size: 14px; margin-top: 60%; font-style: italic; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; }

  .toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: rgba(15, 20, 25, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px 24px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; box-shadow: 0 12px 40px rgba(0,0,0,0.5); z-index: 1000; animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .toast.success { border-bottom: 3px solid #4CAF50; }
  .toast.error { border-bottom: 3px solid #ef5350; }
  .toast.warning { border-bottom: 3px solid #FFCA28; color: #FFE082; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

type ToastData = { type: "success" | "error" | "warning"; text: string; };
type BroadcastRecord = { id: number; message: string; file_path: string | null; success_count: number; fail_count: number; total_targets: number; sent_at: string; };

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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("tg_jwt_token"));
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [view, setView] = useState<"broadcast" | "history">("broadcast");
  const [historyData, setHistoryData] = useState<BroadcastRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  
  // ✅ Schedule State
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  
  // ✅ NEW: Dual Mode Scheduler State
  const [scheduleMode, setScheduleMode] = useState<"calendar" | "manual">("calendar");

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [contactCount, setContactCount] = useState<number>(0);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(true);
  const [isAborting, setIsAborting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBroadcastId = useRef<string | null>(null);

  const showToast = (type: "success" | "error" | "warning", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuthError = (res: Response) => {
    if (res.status === 401) {
      handleLogout();
      showToast("error", "🔒 Session expired. Please log in again.");
      return true;
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch("https://telegram-broadcast-system.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem("tg_jwt_token", data.token);
        setLoginPassword("");
        showToast("success", "✅ Logged in securely");
      } else {
        showToast("error", "❌ Invalid password");
      }
    } catch (err) {
      showToast("error", "❌ Cannot connect to server");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("tg_jwt_token");
    setHistoryData([]);
    setContactCount(0);
  };

  useEffect(() => {
    const fetchUserCount = async () => {
      if (!token) return;
      setIsLoadingContacts(true);
      try {
        const response = await fetch("https://telegram-broadcast-system.onrender.com/api/users/count", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (handleAuthError(response)) return;
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
  }, [token]);

  const loadHistory = async (pageNum: number) => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`https://telegram-broadcast-system.onrender.com/api/history?page=${pageNum}&limit=10`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (handleAuthError(response)) return;
      if (response.ok) {
        const result = await response.json();
        setHistoryData(result.data);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      showToast("error", "❌ Failed to load history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = () => {
    setView("history");
    loadHistory(1);
  };

  const handleFile = (f: File | null | undefined) => { if (f) setFile(f); };
  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }, []);
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = () => setIsDragOver(false);

  const handleAbort = async () => {
    if (!token || !activeBroadcastId.current) return;
    setIsAborting(true);
    try {
      const res = await fetch(`https://telegram-broadcast-system.onrender.com/api/cancel?broadcastId=${activeBroadcastId.current}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        showToast("warning", "🛑 Abort signal sent! Stopping broadcast...");
      } else {
        showToast("error", "❌ Failed to send abort signal.");
        setIsAborting(false);
      }
    } catch (e) {
      showToast("error", "❌ Server error while aborting.");
      setIsAborting(false);
    }
  };

  const handleSend = async () => {
    if (!file && !message.trim()) {
      showToast("error", "⚠️  Please select a file or type a message first.");
      return;
    }
    if (contactCount === 0) {
      showToast("error", "⚠️  No users in database to send to.");
      return;
    }
    
    // ✅ NEW: Advanced Date Validation for both modes
    let isoTime = "";
    if (isScheduling) {
      if (!scheduleTime) {
        showToast("error", "⚠️  Please enter a date and time to schedule.");
        return;
      }
      
      const parsedDate = new Date(scheduleTime);
      if (isNaN(parsedDate.getTime())) {
        showToast("error", "❌ Invalid date format. Please use YYYY-MM-DD HH:MM");
        return;
      }
      
      if (parsedDate.getTime() < Date.now()) {
        showToast("error", "❌ Scheduled time must be in the future.");
        return;
      }

      isoTime = parsedDate.toISOString();
    }

    setSending(true);
    setIsAborting(false);
    setProgress(10);

    const currentBroadcastId = Date.now().toString();
    activeBroadcastId.current = currentBroadcastId;

    const formData = new FormData();
    formData.append("broadcastId", currentBroadcastId);
    if (file) formData.append("file", file);
    formData.append("message", message);
    
    if (isScheduling && isoTime) {
      formData.append("scheduledAt", isoTime);
    }

    const tick = setInterval(() => { setProgress((p) => Math.min(p + Math.random() * 15, 85)); }, 300);

    try {
      const res = await fetch(`https://telegram-broadcast-system.onrender.com/api/send-file?broadcastId=${currentBroadcastId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      
      if (handleAuthError(res)) {
        clearInterval(tick);
        setSending(false);
        return;
      }

      clearInterval(tick);
      setProgress(100);
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.result && data.result.scheduled) {
          showToast("success", `📅 Broadcast successfully scheduled!`);
          setFile(null);
          setMessage("");
          setIsScheduling(false);
          setScheduleTime("");
        } else if (data.result && data.result.aborted) {
          showToast("warning", `🛑 Broadcast aborted. Sent to ${data.result.sent} users.`);
        } else {
          showToast("success", `✅ Broadcast successful to ${data.result.sent} users!`);
          setFile(null);
          setMessage("");
        }
      } else {
        showToast("error", "❌ Server error. Check backend logs.");
      }
    } catch {
      clearInterval(tick);
      showToast("error", "❌ Could not reach the server");
    } finally {
      setTimeout(() => {
        setSending(false);
        setIsAborting(false);
        setProgress(0);
        activeBroadcastId.current = null; 
      }, 1200);
    }
  };

  if (!token) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="card-header" style={{ justifyContent: 'center', padding: '40px 32px' }}>
              <div className="tg-icon">🔒</div>
              <div className="header-text">
                <h1>SECURE LOGIN</h1>
                <p>Telegram Broadcast Admin</p>
              </div>
            </div>
            <form className="card-body" onSubmit={handleLogin}>
              <div>
                <div className="field-label">Admin Password</div>
                <input
                  type="password"
                  placeholder="Enter administrator password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="send-btn" type="submit" disabled={!loginPassword || isLoggingIn}>
                {isLoggingIn ? <span className="spinner" /> : "AUTHENTICATE"}
              </button>
            </form>
          </div>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="dashboard-layout">
          
          <div className="card">
            <div className="card-header">
              <div className="tg-icon">✈️</div>
              <div className="header-text">
                <h1>TELEGRAM SYSTEM</h1>
                <p>Admin Broadcast Control</p>
              </div>
              <div className="status-badge">
                <div className="status-dot"></div>
                <div className="status-text">{isLoadingContacts ? "..." : <span>{contactCount}</span>} Users</div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="tabs">
              <button className={`tab-btn ${view === "broadcast" ? "active" : ""}`} onClick={() => setView("broadcast")}>New Broadcast</button>
              <button className={`tab-btn ${view === "history" ? "active" : ""}`} onClick={handleViewHistory}>History Log</button>
            </div>

            <div className="card-body">
              {view === "broadcast" && (
                <>
                  <div>
                    <div className="field-label">Media Attachment</div>
                    {!file ? (
                      <div className={`drop-zone${isDragOver ? " drag-over" : ""}`} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}>
                        <input ref={fileInputRef} type="file" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
                        <span className="drop-icon">📁</span>
                        <div className="drop-label">Drag and drop file here or <span>browse files</span></div>
                      </div>
                    ) : (
                      <div className="file-pill">
                        <span className="file-pill-icon">{getFileIcon(file.name)}</span>
                        <div className="file-pill-info">
                          <div className="file-pill-name">{file.name}</div>
                          <div className="file-pill-size">{formatBytes(file.size)}</div>
                        </div>
                        <button className="file-pill-remove" onClick={() => setFile(null)}>✕</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="field-label">Broadcast Caption (HTML Supported)</div>
                    <textarea
                      placeholder="Write an announcement to send to all users..."
                      value={message}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      maxLength={1024}
                    />
                  </div>

                  {/* ✅ NEW: Dual Mode Scheduling UI */}
                  <div>
                    <button 
                      className="schedule-toggle" 
                      onClick={() => setIsScheduling(!isScheduling)}
                    >
                      {isScheduling ? "▼ Cancel Scheduling" : "▶ Schedule for later (Cron)"}
                    </button>
                    
                    {isScheduling && (
                      <div style={{ marginTop: "16px", animation: "fadeIn 0.2s ease" }}>
                        <div className="field-label">
                          <span>Select Date & Time</span>
                          <button 
                            className="mode-switch"
                            onClick={() => setScheduleMode(scheduleMode === "calendar" ? "manual" : "calendar")}
                            title="Switch input method"
                          >
                            {scheduleMode === "calendar" ? "✍️ Type Manually" : "📅 Use Calendar"}
                          </button>
                        </div>
                        
                        {scheduleMode === "calendar" ? (
                          <input 
                            type="datetime-local" 
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)} 
                          />
                        ) : (
                          <input 
                            type="text" 
                            placeholder="YYYY-MM-DD HH:MM (e.g. 2026-03-30 14:30)"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {sending && (
                    <div className="progress-wrap">
                      <div className="progress-bar" style={{ width: `${progress}%`, background: isAborting ? "#ef5350" : (isScheduling ? "#ab47bc" : "") }} />
                    </div>
                  )}

                  <div className="btn-group">
                    {sending ? (
                      <>
                        <button className={`send-btn ${isScheduling ? 'schedule-btn' : ''}`} disabled style={{ flex: 2 }}>
                          <span className="spinner" /> {isScheduling ? "SCHEDULING..." : (isAborting ? "ABORTING..." : "BROADCASTING...")}
                        </button>
                        {!isScheduling && (
                          <button className="send-btn abort-btn" onClick={handleAbort} disabled={isAborting} style={{ flex: 1 }}>🛑 ABORT</button>
                        )}
                      </>
                    ) : (
                      <button 
                        className={`send-btn ${isScheduling ? 'schedule-btn' : ''}`} 
                        onClick={handleSend} 
                        disabled={contactCount === 0 || (!file && !message.trim()) || (isScheduling && !scheduleTime)}
                      >
                        {isScheduling ? "📅 SCHEDULE BROADCAST" : "✈️ INITIATE BROADCAST"}
                      </button>
                    )}
                  </div>
                </>
              )}

              {view === "history" && (
                <div className="history-list">
                  {isLoadingHistory ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}><span className="spinner" /></div>
                  ) : historyData.length === 0 ? (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "40px 0" }}>No broadcasts found.</div>
                  ) : (
                    <>
                      {historyData.map((record) => (
                        <div key={record.id} className="history-item">
                          <div className="history-header">
                            <div className="history-date">🕒 {formatDate(record.sent_at)}</div>
                            <div className="history-stats">
                              <div className="stat-pill success">✓ {record.success_count}</div>
                              {record.fail_count > 0 && <div className="stat-pill error">✕ {record.fail_count}</div>}
                            </div>
                          </div>
                          <div className="history-message">
                            {record.message === "[File Only - No Caption]" ? (
                              <span style={{ fontStyle: "italic", opacity: 0.5 }}>{record.message}</span>
                            ) : record.message.startsWith("[ABORTED]") ? (
                              <span style={{ color: "#ef5350", fontWeight: 600 }}>{record.message}</span>
                            ) : (record.message)}
                          </div>
                          {record.file_path && (
                            <div className="history-file">📁 {record.file_path.split(/\\|\//).pop()}</div>
                          )}
                        </div>
                      ))}
                      {totalPages > 1 && (
                        <div className="pagination-controls">
                          <button className="page-btn" disabled={currentPage === 1 || isLoadingHistory} onClick={() => loadHistory(currentPage - 1)}>← Prev</button>
                          <div className="page-info">Page {currentPage} of {totalPages}</div>
                          <button className="page-btn" disabled={currentPage === totalPages || isLoadingHistory} onClick={() => loadHistory(currentPage + 1)}>Next →</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {view === "broadcast" && (
            <div className="preview-phone">
              <div className="phone-header">
                <div className="phone-avatar">🤖</div>
                <div>
                  <div className="phone-title">Broadcast Bot</div>
                  <div className="phone-subtitle">bot</div>
                </div>
              </div>
              <div className="phone-body">
                {(!file && !message.trim()) ? (
                  <div className="placeholder-msg">Your message preview will appear here...</div>
                ) : (
                  <div className="chat-bubble">
                    {file && (
                      <div className="bubble-file">
                        <div className="bubble-file-icon">{getFileIcon(file.name)}</div>
                        <div>
                          <div className="bubble-file-name">{file.name}</div>
                          <div className="bubble-file-size">{formatBytes(file.size)}</div>
                        </div>
                      </div>
                    )}
                    {message.trim() && <div className="bubble-text">{message}</div>}
                    <div className="bubble-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.text}</div>}
    </>
  );
}