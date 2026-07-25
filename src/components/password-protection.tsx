'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const savedPassword = localStorage.getItem('site-password');
    if (savedPassword) {
      setHasPassword(true);
    }
  }, []);

  const handleSetPassword = () => {
    if (password.length < 4) {
      setError('密码至少需要4位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    localStorage.setItem('site-password', password);
    setHasPassword(true);
    setIsUnlocked(true);
    setError('');
  };

  const handleUnlock = () => {
    const savedPassword = localStorage.getItem('site-password');
    if (inputPassword === savedPassword) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('密码错误，请重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSettingPassword) {
        handleSetPassword();
      } else {
        handleUnlock();
      }
    }
  };

  // 已解锁，显示内容
  if (isUnlocked) {
    return <>{children}</>;
  }

  // 首次使用，设置密码
  if (!hasPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg mb-4">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">李月的工作台</h1>
            <p className="text-slate-500">首次使用，请设置密码保护</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  设置密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="请输入密码（至少4位）"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  确认密码
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请再次输入密码"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetPassword}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                设置密码并进入
              </button>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            密码仅存储在本地浏览器中，请妥善保管
          </p>
        </div>
      </div>
    );
  }

  // 已有密码，输入密码解锁
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg mb-4">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">李月的工作台</h1>
          <p className="text-slate-500">请输入密码解锁</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleUnlock}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              解锁
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('site-password');
                setHasPassword(false);
                setInputPassword('');
                setError('');
              }}
              className="w-full py-2 text-slate-500 text-sm hover:text-slate-700 transition-colors"
            >
              忘记密码？重置密码
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          密码仅存储在本地浏览器中
        </p>
      </div>
    </div>
  );
}
