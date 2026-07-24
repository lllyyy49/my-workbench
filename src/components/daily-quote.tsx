'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 激励名言库
const QUOTES = [
  { text: '成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。', author: '佚名' },
  { text: '每一个你不满意的现在，都有一个你没有努力的曾经。', author: '佚名' },
  { text: '把每一天当作生命的最后一天来过，总有一天你会发现自己是对的。', author: '史蒂夫·乔布斯' },
  { text: '不要等待机会，而要创造机会。', author: '佚名' },
  { text: '行动是治愈恐惧的良药，而犹豫和拖延将不断滋养恐惧。', author: '佚名' },
  { text: '今天很残酷，明天更残酷，后天很美好，但大多数人死在明天晚上。', author: '马云' },
  { text: '你的时间有限，不要浪费在过别人的生活上。', author: '史蒂夫·乔布斯' },
  { text: '世上没有绝望的处境，只有对处境绝望的人。', author: '佚名' },
  { text: '成功的秘诀在于永不改变既定的目标。', author: '卢梭' },
  { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', author: '维维安·格林' },
  { text: '你若要喜爱你自己的价值，你就得给世界创造价值。', author: '歌德' },
  { text: '伟大的事业不是靠力气、速度和身体的敏捷完成的，而是靠性格、意志和知识的力量完成的。', author: '塞缪尔·约翰逊' },
  { text: '人生最大的敌人是自己。', author: '柏拉图' },
  { text: '不怕路长，只怕志短。', author: '佚名' },
  { text: '所有的胜利，与征服自己的胜利比起来，都是微不足道的。', author: '佚名' },
  { text: '努力不一定成功，但放弃一定失败。', author: '佚名' },
  { text: '人生就像骑自行车，想保持平衡就得往前走。', author: '爱因斯坦' },
  { text: '世上无难事，只怕有心人。', author: '佚名' },
  { text: '一个人的价值，在于他贡献了什么，而不在于他能取得什么。', author: '爱因斯坦' },
  { text: '只有不断找寻机会的人，才会及时抓住机会。', author: '萧伯纳' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: '天行健，君子以自强不息。', author: '《周易》' },
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
  { text: '博观而约取，厚积而薄发。', author: '苏轼' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
  { text: '莫等闲，白了少年头，空悲切。', author: '岳飞' },
  { text: '有志者事竟成。', author: '范晔' },
];

function getTodayQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function DailyQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setQuote(getTodayQuote());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setTimeout(() => {
      setQuote(QUOTES[randomIndex]);
      setIsRefreshing(false);
    }, 300);
  };

  if (!quote) return null;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50 shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">每日一句</span>
            </div>
            <blockquote className="text-base md:text-lg text-foreground leading-relaxed font-medium">
              "{quote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            title="换一句"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
