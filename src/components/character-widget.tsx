"use client";

import { useState, useRef, useEffect } from "react";

interface Reminder {
  id: string;
  text: string;
  time: string;
  done: boolean;
}

export default function CharacterWidget() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPanel, setShowPanel] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderText, setNewReminderText] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [mood, setMood] = useState("idle");
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Load saved data
  useEffect(() => {
    const savedPos = localStorage.getItem("character-position");
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch {
        setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 160 });
      }
    } else {
      setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 160 });
    }

    const savedReminders = localStorage.getItem("character-reminders");
    if (savedReminders) {
      try {
        setReminders(JSON.parse(savedReminders));
      } catch {}
    }

    const savedImage = localStorage.getItem("character-image");
    if (savedImage) {
      setCharacterImage(savedImage);
    }
  }, []);

  // Save position
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem("character-position", JSON.stringify(position));
    }
  }, [position]);

  // Save reminders
  useEffect(() => {
    localStorage.setItem("character-reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Auto mood based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) setMood("sleepy");
    else if (hour >= 12 && hour < 14) setMood("eating");
    else if (hour >= 9 && hour < 12) setMood("working");
    else setMood("idle");
  }, []);

  // Check reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      reminders.forEach((r) => {
        if (r.time === currentTime && !r.done) {
          setBubbleText(`提醒：${r.text}`);
          setShowBubble(true);
          setTimeout(() => setShowBubble(false), 5000);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Click to show bubble
  const handleClick = () => {
    if (!isDragging) {
      const messages = ["今天也要加油哦！", "有什么需要帮忙的吗？", "记得按时吃饭～", "工作辛苦啦！", "休息一下吧～"];
      setBubbleText(messages[Math.floor(Math.random() * messages.length)]);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 3000);
    }
  };

  // Add reminder
  const addReminder = () => {
    if (!newReminderText.trim()) return;
    const newReminder: Reminder = {
      id: Date.now().toString(),
      text: newReminderText,
      time: newReminderTime || "09:00",
      done: false,
    };
    setReminders([...reminders, newReminder]);
    setNewReminderText("");
    setNewReminderTime("");
  };

  // Toggle reminder done
  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  };

  // Delete reminder
  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCharacterImage(result);
        localStorage.setItem("character-image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const pendingCount = reminders.filter((r) => !r.done).length;

  return (
    <>
      {/* Character Widget */}
      <div
        ref={widgetRef}
        className="fixed z-50 select-none"
        style={{ left: position.x, top: position.y, cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Speech Bubble */}
        {showBubble && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-4 py-2 text-sm text-gray-700 shadow-lg border border-gray-100 animate-bounce">
            {bubbleText}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
          </div>
        )}

        {/* Character Body */}
        <div
          className="relative w-20 h-20 rounded-full shadow-lg border-2 border-white flex items-center justify-center transition-transform hover:scale-110 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100"
          onClick={handleClick}
        >
          {characterImage ? (
            <img src={characterImage} alt="角色" className="w-full h-full object-cover" />
          ) : (
            <div className="text-3xl">
              {mood === "sleepy" && ""}
              {mood === "eating" && "😋"}
              {mood === "working" && ""}
              {mood === "idle" && "🐱"}
            </div>
          )}

          {/* Notification badge */}
          {pendingCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow">
              {pendingCount}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        {/* Menu Button */}
        <button
          className="absolute -top-2 -right-2 w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-teal-600 transition-colors text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setShowPanel(!showPanel);
          }}
        >
          
        </button>

        {/* Upload Button */}
        <button
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-md hover:bg-amber-500 transition-colors text-xs"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          title="更换形象"
        >
          📷
        </button>
      </div>

      {/* Memo Panel */}
      {showPanel && (
        <div className="fixed z-50 right-4 top-4 w-80 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg">备忘录</h3>
            <button onClick={() => setShowPanel(false)} className="text-white/80 hover:text-white text-xl">
              ×
            </button>
          </div>

          {/* Add Reminder Form */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="输入备忘内容..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                onKeyDown={(e) => e.key === "Enter" && addReminder()}
              />
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={addReminder}
              className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
            >
              添加备忘
            </button>
          </div>

          {/* Reminder List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {reminders.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-sm">暂无备忘事项</p>
              </div>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    r.done ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => toggleReminder(r.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      r.done ? "bg-teal-500 border-teal-500 text-white" : "border-gray-300 hover:border-teal-500"
                    }`}
                  >
                    {r.done && "✓"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${r.done ? "line-through text-gray-400" : "text-gray-700"}`}>{r.text}</p>
                    <p className="text-xs text-gray-400 mt-1">⏰ {r.time}</p>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Stats */}
          {reminders.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>共 {reminders.length} 项</span>
              <span>待完成 {pendingCount} 项</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
