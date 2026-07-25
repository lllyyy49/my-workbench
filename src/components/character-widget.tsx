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
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-3 border-teal-300 bg-gradient-to-b from-sky-50 to-white shadow-lg">
            {/* Anime Girl SVG Character - Detailed */}
            <svg viewBox="0 0 120 120" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#FFF0E0" />
                  <stop offset="100%" stopColor="#FDE0C8" />
                </radialGradient>
                <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#6BB5E8" />
                  <stop offset="50%" stopColor="#3B82C4" />
                  <stop offset="100%" stopColor="#1E5FA0" />
                </radialGradient>
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B4B2A" />
                  <stop offset="50%" stopColor="#5C3317" />
                  <stop offset="100%" stopColor="#4A2810" />
                </linearGradient>
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A8DFF0" />
                  <stop offset="100%" stopColor="#7EC8E3" />
                </linearGradient>
              </defs>

              {/* Hair back - long flowing hair */}
              <path d="M20 50 Q15 30 30 15 Q50 5 70 10 Q90 15 100 35 Q105 50 100 70 Q98 85 95 100 Q90 110 85 115 L80 115 Q82 100 80 80 Q78 65 75 55 L75 55 Q70 50 60 48 Q50 50 45 55 Q42 65 40 80 Q38 100 40 115 L35 115 Q30 110 25 100 Q20 85 18 70 Q15 55 20 50 Z" fill="url(#hairGrad)" />

              {/* Hair sides - left */}
              <path d="M22 45 Q18 60 20 80 Q22 95 25 105 Q28 95 26 80 Q24 65 28 50 Z" fill="url(#hairGrad)" />
              {/* Hair sides - right */}
              <path d="M98 45 Q102 60 100 80 Q98 95 95 105 Q92 95 94 80 Q96 65 92 50 Z" fill="url(#hairGrad)" />

              {/* Face shape */}
              <path d="M35 40 Q35 25 50 20 Q65 18 80 22 Q90 28 90 45 Q90 65 82 75 Q75 82 60 85 Q45 82 38 75 Q32 65 32 50 Q32 42 35 40 Z" fill="url(#faceGrad)" />

              {/* Hair front / bangs - detailed */}
              <path d="M28 38 Q30 20 45 15 Q55 12 65 14 Q80 18 88 30 Q92 38 90 42 Q85 32 75 28 Q65 25 55 26 Q45 28 38 34 Q32 38 28 38 Z" fill="url(#hairGrad)" />
              {/* Bang strands */}
              <path d="M35 35 Q38 25 48 22 Q42 30 40 38 Z" fill="#6B3A1F" />
              <path d="M45 30 Q48 20 58 18 Q52 26 50 34 Z" fill="#6B3A1F" />
              <path d="M55 28 Q58 18 68 18 Q62 26 60 34 Z" fill="#6B3A1F" />
              <path d="M65 30 Q70 22 78 24 Q72 30 70 38 Z" fill="#6B3A1F" />
              <path d="M75 34 Q80 28 86 32 Q82 38 78 42 Z" fill="#6B3A1F" />

              {/* Ahoge (hair spike) */}
              <path d="M55 14 Q52 4 58 2 Q62 4 60 10 Q58 12 57 14 Z" fill="#6B3A1F" />
              <path d="M58 12 Q56 6 60 4 Q62 6 60 10 Z" fill="#7B4B2A" />

              {/* Eyes - large anime style */}
              {/* Left eye white */}
              <ellipse cx="47" cy="52" rx="10" ry="11" fill="white" />
              {/* Right eye white */}
              <ellipse cx="73" cy="52" rx="10" ry="11" fill="white" />

              {/* Left iris */}
              <ellipse cx={47 + eyeTrack.x} cy={52 + eyeTrack.y} rx="7" ry="8" fill="url(#eyeGrad)" />
              {/* Right iris */}
              <ellipse cx={73 + eyeTrack.x} cy={52 + eyeTrack.y} rx="7" ry="8" fill="url(#eyeGrad)" />

              {/* Left pupil */}
              <ellipse cx={47 + eyeTrack.x * 0.4} cy={52 + eyeTrack.y * 0.4} rx="3.5" ry="4.5" fill="#0D1B2A" />
              {/* Right pupil */}
              <ellipse cx={73 + eyeTrack.x * 0.4} cy={52 + eyeTrack.y * 0.4} rx="3.5" ry="4.5" fill="#0D1B2A" />

              {/* Eye highlights - main */}
              <circle cx={44 + eyeTrack.x * 0.2} cy={48 + eyeTrack.y * 0.2} r="3" fill="white" opacity="0.9" />
              <circle cx={70 + eyeTrack.x * 0.2} cy={48 + eyeTrack.y * 0.2} r="3" fill="white" opacity="0.9" />
              {/* Eye highlights - secondary */}
              <circle cx={50 + eyeTrack.x * 0.2} cy={55 + eyeTrack.y * 0.2} r="1.5" fill="white" opacity="0.6" />
              <circle cx={76 + eyeTrack.x * 0.2} cy={55 + eyeTrack.y * 0.2} r="1.5" fill="white" opacity="0.6" />

              {/* Upper eyelid line */}
              <path d="M37 48 Q42 44 47 45 Q52 44 57 48" stroke="#3A2010" strokeWidth="1.5" fill="none" />
              <path d="M63 48 Q68 44 73 45 Q78 44 83 48" stroke="#3A2010" strokeWidth="1.5" fill="none" />

              {/* Eyelashes */}
              <path d="M37 48 Q35 44 33 42" stroke="#3A2010" strokeWidth="1.2" fill="none" />
              <path d="M83 48 Q85 44 87 42" stroke="#3A2010" strokeWidth="1.2" fill="none" />

              {/* Eyebrows */}
              <path d="M39 40 Q44 37 52 39" stroke="#5C3317" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M81 40 Q76 37 68 39" stroke="#5C3317" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Nose - small dot */}
              <ellipse cx="60" cy="62" rx="1.5" ry="1" fill="#E8C4A0" />

              {/* Mouth */}
              {mood === "happy" || mood === "excited" ? (
                <>
                  <path d="M53 70 Q60 76 67 70" stroke="#E07070" strokeWidth="1.5" fill="#F0A0A0" />
                  <path d="M55 70 Q60 73 65 70" fill="white" opacity="0.5" />
                </>
              ) : mood === "eating" ? (
                <ellipse cx="60" cy="71" rx="5" ry="4" fill="#E07070" />
              ) : mood === "sleepy" ? (
                <path d="M55 70 Q60 72 65 70" stroke="#E07070" strokeWidth="1.2" fill="none" />
              ) : mood === "thinking" ? (
                <path d="M55 71 Q60 73 65 71" stroke="#E07070" strokeWidth="1.2" fill="none" />
              ) : (
                <path d="M55 70 Q60 73 65 70" stroke="#E07070" strokeWidth="1.2" fill="none" />
              )}

              {/* Blush */}
              <ellipse cx="40" cy="64" rx="5" ry="3" fill="#FFB0B0" opacity="0.4" />
              <ellipse cx="80" cy="64" rx="5" ry="3" fill="#FFB0B0" opacity="0.4" />

              {/* Neck */}
              <path d="M52 82 L52 90 Q52 92 54 92 L66 92 Q68 92 68 90 L68 82" fill="#FDE0C8" />

              {/* Shirt / top */}
              <path d="M40 92 Q50 88 60 88 Q70 88 80 92 L85 120 L35 120 Z" fill="url(#shirtGrad)" />
              {/* Collar detail */}
              <path d="M48 92 L60 98 L72 92" stroke="#5BB5D4" strokeWidth="1" fill="none" />
              {/* Bow tie */}
              <path d="M55 94 L60 90 L65 94 L60 98 Z" fill="#5BB5D4" />
              <circle cx="60" cy="94" r="2" fill="#4AA3C2" />

              {/* Sleepy ZZZ */}
              {mood === "sleepy" && (
                <g>
                  <text x="85" y="35" fontSize="7" fill="#9CA3AF" fontWeight="bold" fontFamily="sans-serif">z</text>
                  <text x="92" y="28" fontSize="9" fill="#9CA3AF" fontWeight="bold" fontFamily="sans-serif">z</text>
                  <text x="100" y="20" fontSize="11" fill="#9CA3AF" fontWeight="bold" fontFamily="sans-serif">z</text>
                </g>
              )}
              {/* Working sweat drop */}
              {mood === "working" && (
                <path d="M88 42 Q90 48 88 50 Q86 48 88 42 Z" fill="#60A5FA" opacity="0.8" />
              )}
              {/* Thinking question mark */}
              {mood === "thinking" && (
                <text x="85" y="30" fontSize="14" fill="#F59E0B" fontWeight="bold">?</text>
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
                猫露露
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
