// 浏览器通知工具

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string, tag?: string): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag: tag || 'default',
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // 5秒后自动关闭
  setTimeout(() => notification.close(), 5000);
}

export function checkReminders(): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const reminders = JSON.parse(localStorage.getItem('memo-reminders') || '[]');
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    reminders.forEach((reminder: {
      id?: string;
      content?: string;
      time?: string;
      date?: string;
      repeat?: string;
      notified?: boolean;
    }) => {
      if (!reminder.time || !reminder.content) return;

      let shouldNotify = false;

      // 检查日期匹配
      if (reminder.date) {
        if (reminder.date !== currentDate) return;
      }

      // 检查时间匹配
      if (reminder.time === currentTime) {
        shouldNotify = true;
      }

      // 检查重复
      if (reminder.repeat === 'daily') {
        if (reminder.time === currentTime) {
          shouldNotify = true;
        }
      } else if (reminder.repeat === 'weekly') {
        const dayOfWeek = now.getDay(); // 0=Sunday
        if (reminder.time === currentTime) {
          shouldNotify = true;
        }
      }

      if (shouldNotify && !reminder.notified) {
        sendNotification('⏰ 备忘录提醒', reminder.content, reminder.id);

        // 标记已通知（非重复的）
        if (!reminder.repeat) {
          reminder.notified = true;
          const updated = reminders.map((r: { id?: string }) =>
            r.id === reminder.id ? reminder : r
          );
          localStorage.setItem('memo-reminders', JSON.stringify(updated));
        }
      }
    });
  } catch {}
}

// 每分钟检查一次提醒
export function startReminderChecker(): () => void {
  checkReminders(); // 立即检查一次
  const interval = setInterval(checkReminders, 60000); // 每分钟检查
  return () => clearInterval(interval);
}
