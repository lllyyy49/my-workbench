'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Globe, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// 预设的病症数据模板 - 丰富版
const DISEASE_TEMPLATES = [
  // ===== 骨科 =====
  {
    department: '骨科',
    diseaseName: '颈椎病',
    targetGroup: '上班族、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '颈部疼痛、僵硬、头晕、手臂麻木',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 8500,
    productSuggestions: '颈椎牵引器、护颈枕、远红外膏药',
  },
  {
    department: '骨科',
    diseaseName: '腰椎间盘突出',
    targetGroup: '中老年人、体力劳动者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '腰部疼痛、下肢放射痛、活动受限',
    treatmentTypes: ['膏药', '敷贴', '口服液'],
    xiaohongshuHeat: 7200,
    productSuggestions: '腰托、热敷包、活血膏药',
  },
  {
    department: '骨科',
    diseaseName: '肩周炎',
    targetGroup: '中老年人、长期伏案工作者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '肩部疼痛、活动受限、夜间加重',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 6500,
    productSuggestions: '肩周炎贴、热敷袋、护肩',
  },
  {
    department: '骨科',
    diseaseName: '关节炎',
    targetGroup: '中老年人',
    season: ['冬季', '春季', '秋季'],
    months: [1, 2, 3, 9, 10, 11, 12],
    symptoms: '关节疼痛、肿胀、僵硬、活动受限',
    treatmentTypes: ['膏药', '凝胶', '口服液'],
    xiaohongshuHeat: 9800,
    productSuggestions: '关节贴、护膝、氨糖软骨素',
  },
  {
    department: '骨科',
    diseaseName: '骨质增生',
    targetGroup: '中老年人',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '骨刺疼痛、关节僵硬、活动受限',
    treatmentTypes: ['膏药', '贴剂', '口服液'],
    xiaohongshuHeat: 5200,
    productSuggestions: '骨刺贴、钙片、护具',
  },
  {
    department: '骨科',
    diseaseName: '腱鞘炎',
    targetGroup: '上班族、手工劳动者、宝妈',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '手腕疼痛、手指僵硬、活动受限',
    treatmentTypes: ['膏药', '凝胶', '贴剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '腱鞘炎贴、护腕、鼠标垫',
  },
  {
    department: '骨科',
    diseaseName: '足跟痛',
    targetGroup: '中老年人、长期站立工作者',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '足跟疼痛、晨起加重、行走困难',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 4500,
    productSuggestions: '足跟痛贴、足弓垫、软底鞋',
  },

  // ===== 皮肤科 =====
  {
    department: '皮肤科',
    diseaseName: '湿疹',
    targetGroup: '儿童、过敏体质人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6],
    symptoms: '皮肤红斑、丘疹、瘙痒、渗出',
    treatmentTypes: ['软膏', '凝胶', '口服液'],
    xiaohongshuHeat: 9200,
    productSuggestions: '保湿霜、抗过敏药、中药膏',
  },
  {
    department: '皮肤科',
    diseaseName: '荨麻疹',
    targetGroup: '过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '风团、瘙痒、皮肤红肿',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '抗组胺药、维生素C、中药调理',
  },
  {
    department: '皮肤科',
    diseaseName: '银屑病',
    targetGroup: '青壮年、有家族史人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '红斑、鳞屑、瘙痒、皮肤干燥',
    treatmentTypes: ['软膏', '凝胶', '口服液'],
    xiaohongshuHeat: 5800,
    productSuggestions: '银屑病膏、保湿霜、中药调理',
  },
  {
    department: '皮肤科',
    diseaseName: '痤疮',
    targetGroup: '青少年、油性皮肤人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '粉刺、丘疹、脓疱、皮肤油腻',
    treatmentTypes: ['凝胶', '软膏', '口服液'],
    xiaohongshuHeat: 12000,
    productSuggestions: '祛痘膏、洁面乳、控油产品',
  },
  {
    department: '皮肤科',
    diseaseName: '脚气',
    targetGroup: '男性、运动人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '脚趾间瘙痒、脱皮、水疱、异味',
    treatmentTypes: ['软膏', '喷剂', '粉剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '脚气膏、抗真菌喷剂、透气鞋',
  },
  {
    department: '皮肤科',
    diseaseName: '灰指甲',
    targetGroup: '中老年人、运动人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '指甲变厚、变色、变形、易碎',
    treatmentTypes: ['口服液', '外用液', '软膏'],
    xiaohongshuHeat: 7200,
    productSuggestions: '灰指甲液、抗真菌药、修甲工具',
  },
  {
    department: '皮肤科',
    diseaseName: '白癜风',
    targetGroup: '青壮年、有家族史人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '皮肤白斑、边界清晰、无自觉症状',
    treatmentTypes: ['软膏', '口服液', '光疗'],
    xiaohongshuHeat: 4800,
    productSuggestions: '白癜风膏、光疗仪、中药调理',
  },

  // ===== 呼吸内科 =====
  {
    department: '呼吸内科',
    diseaseName: '感冒',
    targetGroup: '全人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '流涕、咳嗽、发热、头痛',
    treatmentTypes: ['口服液', '胶囊', '片剂', '喷剂'],
    xiaohongshuHeat: 15000,
    productSuggestions: '感冒灵、维C银翘片、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '过敏性鼻炎',
    targetGroup: '过敏体质人群、儿童',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '鼻塞、流涕、打喷嚏、鼻痒',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 8900,
    productSuggestions: '鼻喷剂、空气净化器、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '慢性咽炎',
    targetGroup: '教师、歌手、吸烟人群',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '咽部异物感、干燥、灼热、微痛',
    treatmentTypes: ['含片', '口服液', '喷剂'],
    xiaohongshuHeat: 9500,
    productSuggestions: '咽炎含片、润喉糖、胖大海',
  },
  {
    department: '呼吸内科',
    diseaseName: '支气管炎',
    targetGroup: '中老年人、吸烟人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咳嗽、咳痰、喘息、胸闷',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '止咳糖浆、支气管炎丸、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '哮喘',
    targetGroup: '儿童、过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '喘息、气促、胸闷、咳嗽',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 6200,
    productSuggestions: '哮喘喷剂、雾化器、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '肺炎',
    targetGroup: '儿童、中老年人、免疫力低下人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '发热、咳嗽、咳痰、胸痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '抗生素、止咳药、口罩',
  },

  // ===== 消化内科 =====
  {
    department: '消化内科',
    diseaseName: '胃炎',
    targetGroup: '上班族、饮食不规律人群',
    season: ['冬季', '夏季'],
    months: [1, 2, 7, 8, 12],
    symptoms: '胃痛、胃胀、反酸、恶心',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7500,
    productSuggestions: '养胃茶、益生菌、胃药',
  },
  {
    department: '消化内科',
    diseaseName: '便秘',
    targetGroup: '上班族、老年人、饮食不规律人群',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '排便困难、大便干结、腹胀',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '益生菌、膳食纤维、通便茶',
  },
  {
    department: '消化内科',
    diseaseName: '腹泻',
    targetGroup: '儿童、旅行者、饮食不洁人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '大便次数增多、稀便、腹痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8200,
    productSuggestions: '止泻药、益生菌、口服补液盐',
  },
  {
    department: '消化内科',
    diseaseName: '胃溃疡',
    targetGroup: '上班族、压力大人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '胃痛、反酸、气、恶心',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 6800,
    productSuggestions: '胃药、养胃茶、益生菌',
  },
  {
    department: '消化内科',
    diseaseName: '胆囊炎',
    targetGroup: '中老年人、肥胖人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '右上腹疼痛、恶心、呕吐、发热',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 5500,
    productSuggestions: '利胆药、消炎药、低脂饮食',
  },

  // ===== 妇科 =====
  {
    department: '妇科',
    diseaseName: '痛经',
    targetGroup: '年轻女性',
    season: ['冬季', '秋季'],
    months: [1, 2, 9, 10, 11, 12],
    symptoms: '下腹疼痛、腰酸、恶心',
    treatmentTypes: ['口服液', '胶囊', '贴剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '暖宫贴、红糖姜茶、止痛药',
  },
  {
    department: '妇科',
    diseaseName: '阴道炎',
    targetGroup: '成年女性',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '外阴瘙痒、白带异常、异味',
    treatmentTypes: ['栓剂', '洗液', '口服液'],
    xiaohongshuHeat: 9800,
    productSuggestions: '妇科洗液、栓剂、护垫',
  },
  {
    department: '妇科',
    diseaseName: '子宫肌瘤',
    targetGroup: '30-50岁女性',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '月经量多、经期延长、下腹坠胀',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '中药调理、保健品、护垫',
  },
  {
    department: '妇科',
    diseaseName: '乳腺增生',
    targetGroup: '25-45岁女性',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '乳房胀痛、肿块、月经前加重',
    treatmentTypes: ['口服液', '胶囊', '贴剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '乳腺贴、中药调理、文胸',
  },
  {
    department: '妇科',
    diseaseName: '月经不调',
    targetGroup: '年轻女性、压力大人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '月经周期不规律、经量异常',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10200,
    productSuggestions: '调经药、红糖姜茶、保健品',
  },

  // ===== 儿科 =====
  {
    department: '儿科',
    diseaseName: '小儿感冒',
    targetGroup: '儿童',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '发热、流涕、咳嗽、鼻塞',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 12000,
    productSuggestions: '小儿感冒药、退热贴、体温计',
  },
  {
    department: '儿科',
    diseaseName: '小儿腹泻',
    targetGroup: '婴幼儿',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '大便次数增多、稀便、呕吐',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '益生菌、口服补液盐、腹泻贴',
  },
  {
    department: '儿科',
    diseaseName: '小儿湿疹',
    targetGroup: '婴幼儿',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '皮肤红斑、丘疹、瘙痒',
    treatmentTypes: ['软膏', '凝胶', '乳液'],
    xiaohongshuHeat: 9500,
    productSuggestions: '婴儿保湿霜、湿疹膏、纯棉衣物',
  },
  {
    department: '儿科',
    diseaseName: '小儿积食',
    targetGroup: '婴幼儿、儿童',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '食欲不振、腹胀、口臭、大便异常',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '消食片、益生菌、小儿推拿',
  },
  {
    department: '儿科',
    diseaseName: '小儿咳嗽',
    targetGroup: '儿童',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咳嗽、咳痰、夜间加重',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '止咳糖浆、小儿咳嗽贴、雾化器',
  },

  // ===== 眼科 =====
  {
    department: '眼科',
    diseaseName: '干眼症',
    targetGroup: '上班族、长期用电脑人群',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '眼睛干涩、疲劳、异物感',
    treatmentTypes: ['滴眼液', '凝胶', '热敷贴'],
    xiaohongshuHeat: 8500,
    productSuggestions: '人工泪液、眼贴、护眼仪',
  },
  {
    department: '眼科',
    diseaseName: '近视',
    targetGroup: '学生、长期用眼人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '视力模糊、眼疲劳',
    treatmentTypes: ['滴眼液', '眼镜', '隐形眼镜'],
    xiaohongshuHeat: 15000,
    productSuggestions: '护眼贴、叶黄素、防蓝光眼镜',
  },
  {
    department: '眼科',
    diseaseName: '结膜炎',
    targetGroup: '儿童、佩戴隐形眼镜人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '眼睛红肿、分泌物增多、异物感',
    treatmentTypes: ['滴眼液', '眼膏'],
    xiaohongshuHeat: 6200,
    productSuggestions: '消炎眼药水、人工泪液、护目镜',
  },

  // ===== 耳鼻喉科 =====
  {
    department: '耳鼻喉科',
    diseaseName: '中耳炎',
    targetGroup: '儿童、游泳人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '耳痛、听力下降、耳流脓',
    treatmentTypes: ['滴耳液', '口服液', '片剂'],
    xiaohongshuHeat: 5800,
    productSuggestions: '消炎滴耳液、棉签、耳塞',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '鼻窦炎',
    targetGroup: '成年人、过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '鼻塞、流脓涕、头痛、嗅觉减退',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '鼻喷剂、洗鼻器、口罩',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '扁桃体炎',
    targetGroup: '儿童、青少年',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咽痛、发热、吞咽困难',
    treatmentTypes: ['含片', '口服液', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '消炎含片、润喉糖、体温计',
  },

  // ===== 口腔科 =====
  {
    department: '口腔科',
    diseaseName: '口腔溃疡',
    targetGroup: '全人群、压力大人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '口腔黏膜溃疡、疼痛、影响进食',
    treatmentTypes: ['喷剂', '贴片', '含片'],
    xiaohongshuHeat: 9200,
    productSuggestions: '口腔溃疡贴、西瓜霜、维生素B',
  },
  {
    department: '口腔科',
    diseaseName: '牙周炎',
    targetGroup: '中老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '牙龈出血、肿痛、牙齿松动',
    treatmentTypes: ['牙膏', '漱口水', '凝胶'],
    xiaohongshuHeat: 7500,
    productSuggestions: '牙周牙膏、漱口水、牙线',
  },

  // ===== 中医科 =====
  {
    department: '中医科',
    diseaseName: '肾虚',
    targetGroup: '中老年人、过度劳累人群',
    season: ['冬季', '秋季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '腰膝酸软、头晕耳鸣、乏力',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '补肾保健品、枸杞、黑芝麻',
  },
  {
    department: '中医科',
    diseaseName: '气血不足',
    targetGroup: '女性、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '面色苍白、乏力、头晕、心悸',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 9800,
    productSuggestions: '阿胶、红枣、当归',
  },
  {
    department: '中医科',
    diseaseName: '湿气重',
    targetGroup: '全人群、南方地区人群',
    season: ['夏季', '长夏'],
    months: [6, 7, 8, 9],
    symptoms: '身体沉重、乏力、大便粘腻',
    treatmentTypes: ['口服液', '胶囊', '茶饮'],
    xiaohongshuHeat: 13000,
    productSuggestions: '祛湿茶、薏米、赤小豆',
  },

  // ===== 精神心理科 =====
  {
    department: '精神心理科',
    diseaseName: '失眠',
    targetGroup: '上班族、压力大人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '入睡困难、易醒、早醒、睡眠质量差',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 14000,
    productSuggestions: '褪黑素、安神茶、助眠香薰',
  },
  {
    department: '精神心理科',
    diseaseName: '焦虑症',
    targetGroup: '上班族、学生',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '紧张、担忧、心悸、出汗',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '安神保健品、减压玩具、香薰',
  },
  {
    department: '精神心理科',
    diseaseName: '抑郁症',
    targetGroup: '全人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '情绪低落、兴趣减退、乏力',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 12000,
    productSuggestions: '保健品、心理咨询、运动器材',
  },

  // ===== 泌尿科 =====
  {
    department: '泌尿科',
    diseaseName: '前列腺炎',
    targetGroup: '中老年男性',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '尿频、尿急、尿痛、会阴部不适',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 8500,
    productSuggestions: '前列腺保健品、坐垫、护具',
  },
  {
    department: '泌尿科',
    diseaseName: '尿路感染',
    targetGroup: '女性、老年人',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '尿频、尿急、尿痛、血尿',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7200,
    productSuggestions: '消炎药、蔓越莓保健品、护垫',
  },

  // ===== 心血管内科 =====
  {
    department: '心血管内科',
    diseaseName: '高血压',
    targetGroup: '中老年人、肥胖人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '头晕、头痛、心悸、胸闷',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 12000,
    productSuggestions: '降压药、血压计、低盐食品',
  },
  {
    department: '心血管内科',
    diseaseName: '冠心病',
    targetGroup: '中老年人',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '胸痛、胸闷、心悸、气短',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 9500,
    productSuggestions: '速效救心丸、血压计、保健品',
  },

  // ===== 内分泌科 =====
  {
    department: '内分泌科',
    diseaseName: '糖尿病',
    targetGroup: '中老年人、肥胖人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '多饮、多食、多尿、体重下降',
    treatmentTypes: ['片剂', '胶囊', '注射液'],
    xiaohongshuHeat: 11000,
    productSuggestions: '血糖仪、无糖食品、保健品',
  },
  {
    department: '内分泌科',
    diseaseName: '甲状腺结节',
    targetGroup: '女性、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '颈部肿块、吞咽困难',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '保健品、碘盐、体检套餐',
  },
];

interface DataImportServiceProps {
  onImport: (data: any[]) => void;
}

export function DataImportService({ onImport }: DataImportServiceProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // 从 Excel/CSV 文件导入
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const results: ImportResult = { success: 0, failed: 0, errors: [] };
      const importedData: any[] = [];

      jsonData.forEach((row: any, index) => {
        try {
          // 映射字段
          const item = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            department: row['科室'] || row['department'] || '',
            diseaseName: row['病症名称'] || row['diseaseName'] || row['病症'] || '',
            targetGroup: row['好发人群'] || row['targetGroup'] || '',
            season: parseArrayField(row['好发季节'] || row['season']),
            months: parseNumberArrayField(row['好发月份'] || row['months']),
            symptoms: row['症状'] || row['symptoms'] || '',
            treatmentTypes: parseArrayField(row['药物类型'] || row['treatmentTypes'] || row['对症药物']),
            xiaohongshuHeat: parseInt(row['小红书热度'] || row['xiaohongshuHeat'] || row['热度'] || '0'),
            productSuggestions: row['商品建议'] || row['productSuggestions'] || '',
            notes: row['备注'] || row['notes'] || '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (item.diseaseName && item.department) {
            importedData.push(item);
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`第${index + 1}行：缺少病症名称或科室`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`第${index + 1}行：解析错误`);
        }
      });

      onImport(importedData);
      setImportResult(results);
    } catch (error) {
      console.error('文件导入错误:', error);
      setImportResult({ success: 0, failed: 0, errors: ['文件解析失败，请检查文件格式'] });
    }

    e.target.value = '';
  };

  // 从剪贴板粘贴导入
  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('剪贴板为空');
        return;
      }

      // 尝试解析为 JSON
      try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
          onImport(jsonData);
          setImportResult({ success: jsonData.length, failed: 0, errors: [] });
          return;
        }
      } catch {
        // 不是 JSON，尝试解析为 TSV（制表符分隔）
      }

      // 解析 TSV 格式
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        alert('数据格式不正确，至少需要标题行和一行数据');
        return;
      }

      const headers = lines[0].split('\t').map(h => h.trim());
      const results: ImportResult = { success: 0, failed: 0, errors: [] };
      const importedData: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        try {
          const item = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            department: row['科室'] || '',
            diseaseName: row['病症名称'] || row['病症'] || '',
            targetGroup: row['好发人群'] || '',
            season: parseArrayField(row['好发季节']),
            months: parseNumberArrayField(row['好发月份']),
            symptoms: row['症状'] || '',
            treatmentTypes: parseArrayField(row['药物类型'] || row['对症药物']),
            xiaohongshuHeat: parseInt(row['小红书热度'] || row['热度'] || '0'),
            productSuggestions: row['商品建议'] || '',
            notes: row['备注'] || '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          if (item.diseaseName && item.department) {
            importedData.push(item);
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`第${i}行：缺少病症名称或科室`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`第${i}行：解析错误`);
        }
      }

      onImport(importedData);
      setImportResult(results);
    } catch (error) {
      console.error('粘贴导入错误:', error);
      alert('无法读取剪贴板内容');
    }
  };

  // 使用预设模板快速添加
  const handleTemplateImport = () => {
    const templates = DISEASE_TEMPLATES.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    onImport(templates);
    setImportResult({ success: templates.length, failed: 0, errors: [] });
  };

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        '科室': '骨科',
        '病症名称': '颈椎病',
        '好发人群': '上班族、中老年人',
        '好发季节': '春季,秋季',
        '好发月份': '3,4,9,10',
        '症状': '颈部疼痛、僵硬、头晕',
        '药物类型': '膏药,贴剂,凝胶',
        '小红书热度': '8500',
        '商品建议': '颈椎牵引器、护颈枕',
        '备注': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '病症趋势模板');
    XLSX.writeFile(wb, '病症趋势导入模板.xlsx');
  };

  return (
    <>
      <button
        onClick={() => { setShowImportModal(true); setImportResult(null); }}
        className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm font-medium flex items-center gap-1.5"
      >
        <Upload className="h-4 w-4" />
        数据导入
      </button>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border w-full max-w-lg space-y-4 my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">数据导入</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {importResult && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${importResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  {importResult.failed === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">
                      导入完成：成功 {importResult.success} 条，失败 {importResult.failed} 条
                    </p>
                    {importResult.errors.length > 0 && (
                      <ul className="mt-1 text-xs list-disc list-inside">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">方式一：从文件导入</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span className="text-sm">选择 Excel/CSV 文件</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors text-sm flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      下载模板
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">方式二：从剪贴板粘贴</label>
                  <button
                    onClick={handlePasteImport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">粘贴数据（支持 JSON/TSV 格式）</span>
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">方式三：使用预设模板</label>
                  <button
                    onClick={handleTemplateImport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm">快速添加 8 个常见病症模板</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  提示：支持从 Excel、CSV、JSON、TSV 等多种格式导入数据。
                  也可以从其他平台复制数据后粘贴导入。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 辅助函数：解析数组字段
function parseArrayField(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(/[,，、]/).map(s => s.trim()).filter(s => s);
}

// 辅助函数：解析数字数组字段
function parseNumberArrayField(value: any): number[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(/[,，、]/).map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}
