"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type CharacterMood = "idle" | "happy" | "thinking" | "excited" | "sleepy" | "working" | "eating" | "waving";

interface CharacterWidgetProps {
  reminders: { id: string; text: string; time: string; done: boolean }[];
}

export default function CharacterWidget({ reminders }: CharacterWidgetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mood, setMood] = useState<CharacterMood>("idle");
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [eyeTrack, setEyeTrack] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Initialize position to bottom-right
  useEffect(() => {
    const saved = localStorage.getItem("character-position");
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch {
        setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
      }
    } else {
      setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
    }
  }, []);

  // Save position
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem("character-position", JSON.stringify(position));
    }
  }, [position]);

  // Auto mood based on time and reminders
  useEffect(() => {
    const hour = new Date().getHours();
    const pendingReminders = reminders.filter((r) => !r.done).length;

    if (hour >= 0 && hour < 6) setMood("sleepy");
    else if (hour >= 6 && hour < 9) setMood("eating");
    else if (hour >= 9 && hour < 12) setMood("working");
    else if (hour >= 12 && hour < 14) setMood("eating");
    else if (hour >= 14 && hour < 18) setMood("working");
    else if (hour >= 18 && hour < 22) setMood("happy");
    else setMood("sleepy");

    if (pendingReminders > 0) {
      setMood("thinking");
    }
  }, [reminders]);

  // Random idle animations
  useEffect(() => {
    const interval = setInterval(() => {
      if (mood === "idle" && !isDragging) {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 600);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [mood, isDragging]);

  // Mouse tracking for eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!widgetRef.current) return;
      const rect = widgetRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / window.innerWidth;
      const dy = (e.clientY - centerY) / window.innerHeight;
      setEyeTrack({ x: dx * 4, y: dy * 4 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".character-menu")) return;
      setIsDragging(true);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
      setMood("excited");
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y)),
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setTimeout(() => setMood("happy"), 300);
      setTimeout(() => setMood("idle"), 2000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest(".character-menu")) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setDragOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      setMood("excited");
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 100, touch.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, touch.clientY - dragOffset.y)),
      });
    };
    const handleTouchEnd = () => {
      setIsDragging(false);
      setTimeout(() => setMood("happy"), 300);
      setTimeout(() => setMood("idle"), 2000);
    };
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  // Click interaction
  const handleClick = () => {
    if (isDragging) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    const reactions = [
      "你好呀~",
      "今天也要加油哦！",
      "有什么我可以帮你的吗？",
      "工作辛苦啦~",
      "休息一下吧！",
      "你今天真好看！",
      "一起努力吧~",
      "记得喝水哦~",
    ];

    if (newCount >= 5) {
      setBubbleText("别戳啦，好痒~");
      setMood("excited");
      setClickCount(0);
    } else {
      setBubbleText(reactions[Math.floor(Math.random() * reactions.length)]);
      setMood("happy");
    }
    setShowBubble(true);
    setTimeout(() => {
      setShowBubble(false);
      setMood("idle");
    }, 3000);
  };

  // Double click for menu
  const handleDoubleClick = () => {
    setShowMenu(!showMenu);
  };

  const getMoodEmoji = () => {
    switch (mood) {
      case "happy":
        return "😊";
      case "thinking":
        return "🤔";
      case "excited":
        return "";
      case "sleepy":
        return "😴";
      case "working":
        return "💪";
      case "eating":
        return "🍜";
      case "waving":
        return "👋";
      default:
        return "✨";
    }
  };

  const getMoodText = () => {
    switch (mood) {
      case "happy":
        return "开心";
      case "thinking":
        return "思考中";
      case "excited":
        return "兴奋";
      case "sleepy":
        return "困困";
      case "working":
        return "努力工作中";
      case "eating":
        return "干饭中";
      case "waving":
        return "打招呼";
      default:
        return "待命中";
    }
  };

  const pendingCount = reminders.filter((r) => !r.done).length;

  return (
    <>
      {/* Character Widget */}
      <div
        ref={widgetRef}
        className={`fixed z-50 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          left: position.x,
          top: position.y,
          transition: isDragging ? "none" : "left 0.1s ease-out, top 0.1s ease-out",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Speech Bubble */}
        {showBubble && !isMinimized && (
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg"
            style={{
              animation: "bubblePop 0.3s ease-out",
            }}
          >
            {bubbleText}
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
          </div>
        )}

        {/* Character Body */}
        <div
          className={`relative ${isBouncing && !isDragging ? "animate-bounce" : ""} ${
            isDragging ? "scale-110" : "scale-100"
          } transition-transform duration-200`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-teal-200/30 blur-xl" />

          {/* Character Image Container */}
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-3 border-teal-300 bg-gradient-to-b from-amber-50 to-white shadow-lg">
            {/* Anime Girl SVG Character */}
            <svg viewBox="0 0 100 100" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              {/* Hair back */}
              <ellipse cx="50" cy="42" rx="38" ry="40" fill="#5C3317" />
              {/* Hair sides */}
              <path d="M15 45 Q10 70 18 85 Q22 75 20 55 Z" fill="#5C3317" />
              <path d="M85 45 Q90 70 82 85 Q78 75 80 55 Z" fill="#5C3317" />
              {/* Face */}
              <ellipse cx="50" cy="48" rx="28" ry="30" fill="#FDE8D0" />
              {/* Hair front / bangs */}
              <path d="M22 35 Q25 15 50 12 Q75 15 78 35 Q70 25 50 22 Q30 25 22 35 Z" fill="#6B3A1F" />
              <path d="M25 38 Q30 28 40 30 Q35 35 30 40 Z" fill="#6B3A1F" />
              <path d="M75 38 Q70 28 60 30 Q65 35 70 40 Z" fill="#6B3A1F" />
              {/* Hair spike (ahoge) */}
              <path d="M48 12 Q45 2 52 5 Q50 8 50 12 Z" fill="#6B3A1F" />
              {/* Eyes */}
              <ellipse cx="38" cy="48" rx="7" ry="8" fill="white" />
              <ellipse cx="62" cy="48" rx="7" ry="8" fill="white" />
              {/* Iris */}
              <ellipse cx={38 + eyeTrack.x} cy={48 + eyeTrack.y} rx="4.5" ry="5.5" fill="#3B82C4" />
              <ellipse cx={62 + eyeTrack.x} cy={48 + eyeTrack.y} rx="4.5" ry="5.5" fill="#3B82C4" />
              {/* Pupil */}
              <ellipse cx={38 + eyeTrack.x * 0.5} cy={48 + eyeTrack.y * 0.5} rx="2" ry="2.5" fill="#1a1a2e" />
              <ellipse cx={62 + eyeTrack.x * 0.5} cy={48 + eyeTrack.y * 0.5} rx="2" ry="2.5" fill="#1a1a2e" />
              {/* Eye highlights */}
              <circle cx={36 + eyeTrack.x * 0.3} cy={45 + eyeTrack.y * 0.3} r="1.5" fill="white" />
              <circle cx={60 + eyeTrack.x * 0.3} cy={45 + eyeTrack.y * 0.3} r="1.5" fill="white" />
              {/* Eyelashes */}
              <path d="M31 44 Q34 42 38 43" stroke="#3a2010" strokeWidth="1" fill="none" />
              <path d="M69 44 Q66 42 62 43" stroke="#3a2010" strokeWidth="1" fill="none" />
              {/* Eyebrows */}
              <path d="M32 38 Q38 35 44 37" stroke="#5C3317" strokeWidth="1.2" fill="none" />
              <path d="M68 38 Q62 35 56 37" stroke="#5C3317" strokeWidth="1.2" fill="none" />
              {/* Nose */}
              <path d="M49 53 Q50 55 51 53" stroke="#E8C4A0" strokeWidth="0.8" fill="none" />
              {/* Mouth */}
              {mood === "happy" || mood === "excited" ? (
                <path d="M44 60 Q50 65 56 60" stroke="#E8857A" strokeWidth="1.2" fill="#F4A0A0" />
              ) : mood === "eating" ? (
                <ellipse cx="50" cy="61" rx="4" ry="3" fill="#E8857A" />
              ) : mood === "sleepy" ? (
                <path d="M46 60 Q50 61 54 60" stroke="#E8857A" strokeWidth="1" fill="none" />
              ) : (
                <path d="M46 60 Q50 62 54 60" stroke="#E8857A" strokeWidth="1" fill="none" />
              )}
              {/* Blush */}
              <ellipse cx="33" cy="56" rx="4" ry="2.5" fill="#FFB5B5" opacity="0.5" />
              <ellipse cx="67" cy="56" rx="4" ry="2.5" fill="#FFB5B5" opacity="0.5" />
              {/* Neck */}
              <rect x="44" y="72" width="12" height="8" fill="#FDE8D0" rx="2" />
              {/* Shirt collar */}
              <path d="M35 80 Q50 75 65 80 L68 100 L32 100 Z" fill="#87CEEB" />
              {/* Bow */}
              <path d="M46 82 L50 79 L54 82 L50 85 Z" fill="#5BB5D4" />
              <circle cx="50" cy="82" r="2" fill="#5BB5D4" />
              {/* Sleepy ZZZ */}
              {mood === "sleepy" && (
                <text x="72" y="30" fontSize="8" fill="#9CA3AF" fontWeight="bold">
                  zzz
                </text>
              )}
              {/* Working sweat drop */}
              {mood === "working" && (
                <path d="M72 38 Q74 42 72 44 Q70 42 72 38 Z" fill="#60A5FA" opacity="0.7" />
              )}
            </svg>
            {/* Mood Indicator */}
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow-md">
              {getMoodEmoji()}
            </div>
          </div>

          {/* Name Tag */}
          {!isMinimized && (
            <div className="mt-1 text-center">
              <span className="rounded-full bg-teal-500/90 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                小蓝
              </span>
            </div>
          )}

          {/* Status Dot */}
          {!isMinimized && (
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
              <div className={`h-2.5 w-2.5 rounded-full border-2 border-white ${
                pendingCount > 0 ? "bg-amber-400 animate-pulse" : "bg-green-400"
              }`} />
            </div>
          )}
        </div>

        {/* Interaction Menu */}
        {showMenu && !isMinimized && (
          <div className="character-menu absolute -top-48 left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur-sm"
            style={{ animation: "menuSlide 0.2s ease-out" }}
          >
            <div className="mb-2 text-center text-xs font-medium text-gray-500">
              当前状态：{getMoodText()} {getMoodEmoji()}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { mood: "happy" as CharacterMood, emoji: "😊", label: "开心" },
                { mood: "thinking" as CharacterMood, emoji: "🤔", label: "思考" },
                { mood: "excited" as CharacterMood, emoji: "🤩", label: "兴奋" },
                { mood: "sleepy" as CharacterMood, emoji: "😴", label: "困困" },
                { mood: "working" as CharacterMood, emoji: "", label: "工作" },
                { mood: "eating" as CharacterMood, emoji: "🍜", label: "干饭" },
                { mood: "waving" as CharacterMood, emoji: "👋", label: "打招呼" },
                { mood: "idle" as CharacterMood, emoji: "✨", label: "待机" },
              ].map((item) => (
                <button
                  key={item.mood}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    mood === item.mood
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-50 text-gray-600 hover:bg-teal-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMood(item.mood);
                    setShowMenu(false);
                    setShowBubble(true);
                    setBubbleText(item.label + "!");
                    setTimeout(() => setShowBubble(false), 2000);
                  }}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <button
                className="flex-1 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                  setShowMenu(false);
                }}
              >
                收起
              </button>
              <button
                className="flex-1 rounded-xl bg-teal-100 px-3 py-1.5 text-xs font-medium text-teal-700 transition-all hover:bg-teal-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setPosition({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
                  setShowMenu(false);
                }}
              >
                归位
              </button>
            </div>
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <button
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs text-white shadow-md transition-all hover:scale-110"
            onClick={() => setIsMinimized(false)}
          >
            ↑
          </button>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bubblePop {
          0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
          70% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes menuSlide {
          0% { transform: translateX(-50%) translateY(10px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
