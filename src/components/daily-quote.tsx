'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 激励名言库
const QUOTES = [
  // ===== 奋斗与行动 =====
  { text: '成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。', author: '佚名' },
  { text: '每一个你不满意的现在，都有一个你没有努力的曾经。', author: '佚名' },
  { text: '不要等待机会，而要创造机会。', author: '佚名' },
  { text: '行动是治愈恐惧的良药，而犹豫和拖延将不断滋养恐惧。', author: '佚名' },
  { text: '世上没有绝望的处境，只有对处境绝望的人。', author: '佚名' },
  { text: '努力不一定成功，但放弃一定失败。', author: '佚名' },
  { text: '只有不断找寻机会的人，才会及时抓住机会。', author: '萧伯纳' },
  { text: '有志者事竟成。', author: '范晔' },
  { text: '不怕路长，只怕志短。', author: '佚名' },
  { text: '行动胜于空谈，实践出真知。', author: '佚名' },
  { text: '做你害怕做的事，害怕自然就会消失。', author: '拉尔夫·沃尔多·爱默生' },
  { text: '世界上最快乐的事，莫过于为理想而奋斗。', author: '苏格拉底' },
  { text: '与其临渊羡鱼，不如退而结网。', author: '《汉书》' },
  { text: '少壮不努力，老大徒伤悲。', author: '《长歌行》' },
  { text: '一寸光阴一寸金，寸金难买寸光阴。', author: '《增广贤文》' },

  // ===== 坚持与毅力 =====
  { text: '今天很残酷，明天更残酷，后天很美好，但大多数人死在明天晚上。', author: '马云' },
  { text: '成功的秘诀在于永不改变既定的目标。', author: '卢梭' },
  { text: '所有的胜利，与征服自己的胜利比起来，都是微不足道的。', author: '佚名' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
  { text: '莫等闲，白了少年头，空悲切。', author: '岳飞' },
  { text: '锲而舍之，朽木不折；锲而不舍，金石可镂。', author: '荀子' },
  { text: '绳锯木断，水滴石穿。', author: '班固' },
  { text: '千磨万击还坚劲，任尔东西南北风。', author: '郑板桥' },
  { text: '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。', author: '苏轼' },
  { text: '坚持就是胜利，坚持到底就是胜利中的胜利。', author: '佚名' },
  { text: '逆水行舟用力撑，一篙松劲退千寻。', author: '董必武' },
  { text: '世上无难事，只怕有心人。', author: '佚名' },

  // ===== 智慧与学习 =====
  { text: '把每一天当作生命的最后一天来过，总有一天你会发现自己是对的。', author: '史蒂夫·乔布斯' },
  { text: '你的时间有限，不要浪费在过别人的生活上。', author: '史蒂夫·乔布斯' },
  { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', author: '维维安·格林' },
  { text: '你若要喜爱你自己的价值，你就得给世界创造价值。', author: '歌德' },
  { text: '人生就像骑自行车，想保持平衡就得往前走。', author: '爱因斯坦' },
  { text: '一个人的价值，在于他贡献了什么，而不在于他能取得什么。', author: '爱因斯坦' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: '天行健，君子以自强不息。', author: '《周易》' },
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
  { text: '博观而约取，厚积而薄发。', author: '苏轼' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
  { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
  { text: '知之为知之，不知为不知，是知也。', author: '孔子' },
  { text: '三人行，必有我师焉。择其善者而从之，其不善者而改之。', author: '孔子' },
  { text: '温故而知新，可以为师矣。', author: '孔子' },
  { text: '吾生也有涯，而知也无涯。', author: '庄子' },
  { text: '读书破万卷，下笔如有神。', author: '杜甫' },
  { text: '活到老，学到老，还有三分学不到。', author: '佚名' },

  // ===== 人生态度 =====
  { text: '伟大的事业不是靠力气、速度和身体的敏捷完成的，而是靠性格、意志和知识的力量完成的。', author: '塞缪尔·约翰逊' },
  { text: '人生最大的敌人是自己。', author: '柏拉图' },
  { text: '己所不欲，勿施于人。', author: '孔子' },
  { text: '人无远虑，必有近忧。', author: '孔子' },
  { text: '不以物喜，不以己悲。', author: '范仲淹' },
  { text: '先天下之忧而忧，后天下之乐而乐。', author: '范仲淹' },
  { text: '人生自古谁无死，留取丹心照汗青。', author: '文天祥' },
  { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
  { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡' },
  { text: '海纳百川，有容乃大；壁立千仞，无欲则刚。', author: '林则徐' },
  { text: '穷则独善其身，达则兼济天下。', author: '孟子' },
  { text: '生于忧患，死于安乐。', author: '孟子' },
  { text: '天将降大任于斯人也，必先苦其心志，劳其筋骨。', author: '孟子' },

  // ===== 创新与突破 =====
  { text: '创新是区分领导者和跟随者的标志。', author: '史蒂夫·乔布斯' },
  { text: '想象力比知识更重要，因为知识是有限的，而想象力概括着世界上的一切。', author: '爱因斯坦' },
  { text: '不要问国家能为你做什么，要问你能为国家做什么。', author: '肯尼迪' },
  { text: '真正的发现之旅不在于寻找新的风景，而在于拥有新的眼光。', author: '普鲁斯特' },
  { text: '简单是终极的复杂。', author: '达·芬奇' },
  { text: '完成比完美更重要。', author: '谢丽尔·桑德伯格' },
  { text: '不要追求做一个成功的人，而要追求做一个有价值的人。', author: '爱因斯坦' },
  { text: '我思故我在。', author: '笛卡尔' },
  { text: '人不是因为没有信念而失败，而是因为不能把信念化成行动。', author: '巴顿将军' },
  { text: '当你穿过暴风雨，你就不再是原来那个人了。', author: '村上春树' },
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
