'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Globe, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// 预设的病症数据模板 - 超详细细分版
const DISEASE_TEMPLATES = [
  // ===== 骨科 =====
  {
    department: '骨科',
    diseaseName: '神经根型颈椎病',
    targetGroup: '上班族、长期低头人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '颈部疼痛放射至手臂、手指麻木、握力减弱',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 8500,
    productSuggestions: '颈椎牵引器、护颈枕、远红外膏药',
  },
  {
    department: '骨科',
    diseaseName: '脊髓型颈椎病',
    targetGroup: '中老年人、颈椎退变人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '下肢无力、行走不稳、胸腹部束带感',
    treatmentTypes: ['膏药', '口服液', '理疗'],
    xiaohongshuHeat: 6200,
    productSuggestions: '护颈枕、理疗仪、康复器材',
  },
  {
    department: '骨科',
    diseaseName: '椎动脉型颈椎病',
    targetGroup: '上班族、颈椎病患者',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '头晕、眩晕、猝倒、视力模糊',
    treatmentTypes: ['膏药', '贴剂', '口服液'],
    xiaohongshuHeat: 7800,
    productSuggestions: '颈椎枕、活血膏药、护颈',
  },
  {
    department: '骨科',
    diseaseName: '交感神经型颈椎病',
    targetGroup: '长期伏案工作者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '头痛、心悸、出汗异常、血压波动',
    treatmentTypes: ['膏药', '贴剂', '口服液'],
    xiaohongshuHeat: 5500,
    productSuggestions: '护颈枕、按摩仪、放松器材',
  },
  {
    department: '骨科',
    diseaseName: '混合型颈椎病',
    targetGroup: '中老年颈椎病患者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '多种症状混合、颈肩痛伴头晕手麻',
    treatmentTypes: ['膏药', '贴剂', '口服液', '理疗'],
    xiaohongshuHeat: 7200,
    productSuggestions: '综合护颈产品、理疗仪',
  },
  {
    department: '骨科',
    diseaseName: '腰椎间盘突出症',
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
    diseaseName: '腰椎管狭窄症',
    targetGroup: '中老年人',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '间歇性跛行、腰腿痛、下肢麻木',
    treatmentTypes: ['膏药', '口服液', '理疗'],
    xiaohongshuHeat: 5800,
    productSuggestions: '腰托、护腰、理疗仪',
  },
  {
    department: '骨科',
    diseaseName: '肩周炎（冻结肩）',
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
    diseaseName: '肩袖损伤',
    targetGroup: '运动人群、中老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '肩关节疼痛、无力、活动受限',
    treatmentTypes: ['膏药', '贴剂', '理疗'],
    xiaohongshuHeat: 5200,
    productSuggestions: '护肩、康复器材、理疗仪',
  },
  {
    department: '骨科',
    diseaseName: '骨关节炎（退行性）',
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
    diseaseName: '类风湿性关节炎',
    targetGroup: '女性、中年人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '对称性关节肿痛、晨僵、关节变形',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7500,
    productSuggestions: '护具、保暖用品、保健品',
  },
  {
    department: '骨科',
    diseaseName: '痛风性关节炎',
    targetGroup: '男性、高尿酸人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '关节红肿热痛、夜间发作、大脚趾多见',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8200,
    productSuggestions: '降尿酸保健品、护具、冷敷贴',
  },
  {
    department: '骨科',
    diseaseName: '骨质增生（骨刺）',
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
    diseaseName: '骨质疏松症',
    targetGroup: '绝经后女性、老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '腰背疼痛、身高缩短、易骨折',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '钙片、维生素D、骨密度仪',
  },
  {
    department: '骨科',
    diseaseName: '腱鞘炎（桡骨茎突）',
    targetGroup: '上班族、手工劳动者、宝妈',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '手腕疼痛、拇指活动受限、握力减弱',
    treatmentTypes: ['膏药', '凝胶', '贴剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '腱鞘炎贴、护腕、鼠标垫',
  },
  {
    department: '骨科',
    diseaseName: '扳机指（狭窄性腱鞘炎）',
    targetGroup: '手工劳动者、糖尿病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '手指屈伸弹响、卡顿、疼痛',
    treatmentTypes: ['膏药', '贴剂', '理疗'],
    xiaohongshuHeat: 4500,
    productSuggestions: '护指、理疗仪、康复器材',
  },
  {
    department: '骨科',
    diseaseName: '足底筋膜炎',
    targetGroup: '中老年人、长期站立工作者、跑步爱好者',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '足跟疼痛、晨起加重、行走困难',
    treatmentTypes: ['膏药', '贴剂', '凝胶'],
    xiaohongshuHeat: 4500,
    productSuggestions: '足跟痛贴、足弓垫、软底鞋',
  },
  {
    department: '骨科',
    diseaseName: '跟腱炎',
    targetGroup: '运动人群、跑步爱好者',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '跟腱疼痛、肿胀、活动后加重',
    treatmentTypes: ['膏药', '凝胶', '贴剂'],
    xiaohongshuHeat: 3800,
    productSuggestions: '护踝、足跟垫、运动护具',
  },

  // ===== 皮肤科 =====
  {
    department: '皮肤科',
    diseaseName: '急性湿疹',
    targetGroup: '过敏体质人群、儿童',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7],
    symptoms: '皮肤红斑、密集丘疹、水疱、渗出明显、剧烈瘙痒',
    treatmentTypes: ['软膏', '凝胶', '湿敷液'],
    xiaohongshuHeat: 8500,
    productSuggestions: '炉甘石洗剂、硼酸溶液、糖皮质激素软膏',
  },
  {
    department: '皮肤科',
    diseaseName: '慢性湿疹',
    targetGroup: '中老年人、长期过敏人群',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '皮肤增厚、粗糙、苔藓样变、色素沉着、干燥脱屑',
    treatmentTypes: ['软膏', '硬膏', '口服液'],
    xiaohongshuHeat: 7200,
    productSuggestions: '尿素软膏、水杨酸软膏、中药调理',
  },
  {
    department: '皮肤科',
    diseaseName: '特应性皮炎',
    targetGroup: '婴幼儿、有家族过敏史人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 4, 11, 12],
    symptoms: '皮肤干燥、剧烈瘙痒、反复发作、屈侧分布',
    treatmentTypes: ['软膏', '乳液', '生物制剂'],
    xiaohongshuHeat: 9800,
    productSuggestions: '保湿霜、钙调磷酸酶抑制剂、抗组胺药',
  },
  {
    department: '皮肤科',
    diseaseName: '接触性皮炎',
    targetGroup: '职业接触人群、女性（化妆品）',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '接触部位红斑、肿胀、水疱、边界清晰',
    treatmentTypes: ['软膏', '凝胶', '口服液'],
    xiaohongshuHeat: 6500,
    productSuggestions: '抗过敏软膏、屏障修复霜、防护手套',
  },
  {
    department: '皮肤科',
    diseaseName: '脂溢性湿疹',
    targetGroup: '油性皮肤人群、青少年',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '头皮油腻、红斑、黄色鳞屑、瘙痒',
    treatmentTypes: ['洗剂', '软膏', '口服液'],
    xiaohongshuHeat: 5800,
    productSuggestions: '二硫化硒洗剂、酮康唑洗剂、控油产品',
  },
  {
    department: '皮肤科',
    diseaseName: '手部湿疹',
    targetGroup: '家务人群、职业接触者',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '手部干燥、皲裂、水疱、脱皮、瘙痒',
    treatmentTypes: ['软膏', '手套', '护手霜'],
    xiaohongshuHeat: 7800,
    productSuggestions: '尿素护手霜、凡士林软膏、防护手套',
  },
  {
    department: '皮肤科',
    diseaseName: '钱币状湿疹',
    targetGroup: '中老年人、干燥皮肤人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 4, 11, 12],
    symptoms: '圆形或椭圆形红斑、边界清晰、渗出、结痂',
    treatmentTypes: ['软膏', '凝胶', '口服液'],
    xiaohongshuHeat: 4200,
    productSuggestions: '糖皮质激素软膏、保湿霜、抗组胺药',
  },
  {
    department: '皮肤科',
    diseaseName: '淤积性湿疹',
    targetGroup: '静脉曲张患者、中老年人',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '小腿下段红斑、肿胀、色素沉着、溃疡',
    treatmentTypes: ['软膏', '压力袜', '口服液'],
    xiaohongshuHeat: 3500,
    productSuggestions: '弹力袜、肝素软膏、改善循环药物',
  },
  {
    department: '皮肤科',
    diseaseName: '婴儿湿疹',
    targetGroup: '0-2岁婴幼儿',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 4, 11, 12],
    symptoms: '面颊红斑、丘疹、渗出、结痂、瘙痒哭闹',
    treatmentTypes: ['软膏', '乳液', '洗剂'],
    xiaohongshuHeat: 11500,
    productSuggestions: '婴儿保湿霜、氧化锌软膏、纯棉衣物',
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
    diseaseName: '风寒感冒',
    targetGroup: '全人群、受凉人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '恶寒重、发热轻、无汗、流清涕、痰白稀',
    treatmentTypes: ['口服液', '胶囊', '片剂', '颗粒剂'],
    xiaohongshuHeat: 15000,
    productSuggestions: '感冒清热颗粒、风寒感冒颗粒、姜茶',
  },
  {
    department: '呼吸内科',
    diseaseName: '风热感冒',
    targetGroup: '全人群、上火人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '发热重、恶寒轻、有汗、流黄涕、痰黄稠',
    treatmentTypes: ['口服液', '胶囊', '片剂', '颗粒剂'],
    xiaohongshuHeat: 13500,
    productSuggestions: '银翘解毒片、维C银翘片、板蓝根',
  },
  {
    department: '呼吸内科',
    diseaseName: '暑湿感冒',
    targetGroup: '夏季户外工作者',
    season: ['夏季'],
    months: [6, 7, 8],
    symptoms: '发热、头身困重、胸闷、恶心、腹泻',
    treatmentTypes: ['口服液', '胶囊', '颗粒剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '香正气水、十滴水、清凉油',
  },
  {
    department: '呼吸内科',
    diseaseName: '过敏性鼻炎（季节性）',
    targetGroup: '过敏体质人群、儿童',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '鼻塞、流清涕、打喷嚏、鼻痒、眼痒',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 8900,
    productSuggestions: '鼻喷剂、空气净化器、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '过敏性鼻炎（常年性）',
    targetGroup: '尘螨过敏人群、宠物过敏人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '持续鼻塞、流涕、打喷嚏、嗅觉减退',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '鼻喷剂、除螨仪、空气净化器',
  },
  {
    department: '呼吸内科',
    diseaseName: '慢性咽炎（单纯性）',
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
    diseaseName: '慢性咽炎（肥厚性）',
    targetGroup: '长期吸烟、饮酒人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '咽部增厚、异物感明显、咳痰困难',
    treatmentTypes: ['含片', '口服液', '喷剂', '理疗'],
    xiaohongshuHeat: 6800,
    productSuggestions: '咽炎片、雾化器、润喉产品',
  },
  {
    department: '呼吸内科',
    diseaseName: '急性支气管炎',
    targetGroup: '感冒后人群、吸烟人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咳嗽、咳痰、喘息、胸闷、发热',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '止咳糖浆、支气管炎丸、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '慢性支气管炎',
    targetGroup: '中老年人、长期吸烟人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '长期咳嗽、咳痰、每年持续3个月以上',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6500,
    productSuggestions: '慢支丸、止咳化痰药、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '支气管哮喘',
    targetGroup: '儿童、过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '喘息、气促、胸闷、咳嗽、夜间加重',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 6200,
    productSuggestions: '哮喘喷剂、雾化器、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '咳嗽变异性哮喘',
    targetGroup: '儿童、过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '慢性咳嗽、干咳为主、夜间加重、无喘息',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 5500,
    productSuggestions: '止咳药、雾化器、抗过敏药',
  },
  {
    department: '呼吸内科',
    diseaseName: '细菌性肺炎',
    targetGroup: '儿童、中老年人、免疫力低下人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '高热、咳嗽、咳铁锈色痰、胸痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '抗生素、止咳药、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '病毒性肺炎',
    targetGroup: '儿童、年轻人',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '发热、干咳、乏力、肌肉酸痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 9200,
    productSuggestions: '抗病毒药、退烧药、口罩',
  },
  {
    department: '呼吸内科',
    diseaseName: '支原体肺炎',
    targetGroup: '儿童、青少年',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '顽固性干咳、发热、头痛、咽痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7500,
    productSuggestions: '阿奇霉素、止咳药、口罩',
  },

  // ===== 消化内科 =====
  {
    department: '消化内科',
    diseaseName: '急性胃炎',
    targetGroup: '饮食不洁人群、饮酒人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '突发胃痛、恶心、呕吐、腹泻',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7500,
    productSuggestions: '胃药、止吐药、养胃茶',
  },
  {
    department: '消化内科',
    diseaseName: '慢性胃炎（浅表性）',
    targetGroup: '上班族、饮食不规律人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '胃胀、嗳气、反酸、食欲减退',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 8200,
    productSuggestions: '养胃茶、益生菌、胃药',
  },
  {
    department: '消化内科',
    diseaseName: '慢性胃炎（萎缩性）',
    targetGroup: '中老年人、长期胃病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '胃痛、消化不良、贫血、体重下降',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 6500,
    productSuggestions: '胃药、维生素B12、保健品',
  },
  {
    department: '消化内科',
    diseaseName: '功能性便秘',
    targetGroup: '上班族、老年人、饮食不规律人群',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '排便困难、大便干结、腹胀、排便次数减少',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '益生菌、膳食纤维、通便茶',
  },
  {
    department: '消化内科',
    diseaseName: '肠易激综合征（便秘型）',
    targetGroup: '压力大人群、年轻女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '腹痛、腹胀、便秘、排便后缓解',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '益生菌、解痉药、膳食纤维',
  },
  {
    department: '消化内科',
    diseaseName: '肠易激综合征（腹泻型）',
    targetGroup: '压力大人群、年轻人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '腹痛、腹泻、排便急迫、排便后缓解',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '止泻药、益生菌、解痉药',
  },
  {
    department: '消化内科',
    diseaseName: '急性腹泻（感染性）',
    targetGroup: '儿童、旅行者、饮食不洁人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '大便次数增多、稀便、腹痛、发热',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8200,
    productSuggestions: '止泻药、益生菌、口服补液盐',
  },
  {
    department: '消化内科',
    diseaseName: '慢性腹泻',
    targetGroup: '中老年人、肠道疾病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '长期腹泻、大便不成形、腹痛',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6500,
    productSuggestions: '益生菌、止泻药、保健品',
  },
  {
    department: '消化内科',
    diseaseName: '胃溃疡',
    targetGroup: '上班族、压力大人群、幽门螺杆菌感染者',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '胃痛、反酸、气、恶心、餐后痛',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 6800,
    productSuggestions: '胃药、养胃茶、益生菌',
  },
  {
    department: '消化内科',
    diseaseName: '十二指肠溃疡',
    targetGroup: '青壮年男性、压力大人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '空腹痛、夜间痛、反酸、嗳气',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 5800,
    productSuggestions: '胃药、抑酸药、养胃茶',
  },
  {
    department: '消化内科',
    diseaseName: '反流性食管炎',
    targetGroup: '肥胖人群、上班族',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '反酸、烧心、胸骨后疼痛、吞咽困难',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7500,
    productSuggestions: '抑酸药、胃药、抬高床头垫',
  },
  {
    department: '消化内科',
    diseaseName: '急性胆囊炎',
    targetGroup: '中老年人、肥胖人群、胆石症患者',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '右上腹剧痛、恶心、呕吐、发热',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 5500,
    productSuggestions: '利胆药、消炎药、低脂饮食',
  },
  {
    department: '消化内科',
    diseaseName: '慢性胆囊炎',
    targetGroup: '中老年人、胆石症患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '右上腹隐痛、腹胀、消化不良',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 4800,
    productSuggestions: '利胆药、保健品、低脂饮食',
  },
  {
    department: '消化内科',
    diseaseName: '脂肪肝',
    targetGroup: '肥胖人群、饮酒人群、糖尿病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '乏力、右上腹不适、肝区隐痛',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 6200,
    productSuggestions: '保肝药、保健品、低脂饮食',
  },

  // ===== 妇科 =====
  {
    department: '妇科',
    diseaseName: '原发性痛经',
    targetGroup: '年轻女性、未婚女性',
    season: ['冬季', '秋季'],
    months: [1, 2, 9, 10, 11, 12],
    symptoms: '下腹痉挛性疼痛、腰酸、恶心、无器质性病变',
    treatmentTypes: ['口服液', '胶囊', '贴剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '暖宫贴、红糖姜茶、止痛药',
  },
  {
    department: '妇科',
    diseaseName: '继发性痛经',
    targetGroup: '已婚女性、有妇科疾病史',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '进行性加重痛经、盆腔疼痛、月经异常',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '止痛药、暖宫贴、保健品',
  },
  {
    department: '妇科',
    diseaseName: '霉菌性阴道炎',
    targetGroup: '成年女性、糖尿病患者',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '外阴瘙痒、豆腐渣样白带、灼痛',
    treatmentTypes: ['栓剂', '洗液', '口服液'],
    xiaohongshuHeat: 9800,
    productSuggestions: '妇科洗液、栓剂、护垫',
  },
  {
    department: '妇科',
    diseaseName: '滴虫性阴道炎',
    targetGroup: '成年女性',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '外阴瘙痒、泡沫状白带、异味',
    treatmentTypes: ['栓剂', '洗液', '口服液'],
    xiaohongshuHeat: 7500,
    productSuggestions: '妇科洗液、栓剂、护垫',
  },
  {
    department: '妇科',
    diseaseName: '细菌性阴道病',
    targetGroup: '成年女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '白带增多、鱼腥味、外阴瘙痒',
    treatmentTypes: ['栓剂', '洗液', '口服液'],
    xiaohongshuHeat: 6800,
    productSuggestions: '妇科洗液、栓剂、护垫',
  },
  {
    department: '妇科',
    diseaseName: '子宫肌瘤（肌壁间）',
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
    diseaseName: '子宫肌瘤（浆膜下）',
    targetGroup: '30-50岁女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '下腹包块、压迫症状、尿频',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 5500,
    productSuggestions: '中药调理、保健品',
  },
  {
    department: '妇科',
    diseaseName: '乳腺增生（单纯性）',
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
    diseaseName: '乳腺增生（囊性）',
    targetGroup: '35-50岁女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '乳房肿块、疼痛、乳头溢液',
    treatmentTypes: ['口服液', '胶囊', '贴剂'],
    xiaohongshuHeat: 6200,
    productSuggestions: '乳腺贴、中药调理、保健品',
  },
  {
    department: '妇科',
    diseaseName: '月经先期（提前）',
    targetGroup: '年轻女性、压力大人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '月经周期提前7天以上、经量多、色红',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7500,
    productSuggestions: '调经药、保健品、红糖姜茶',
  },
  {
    department: '妇科',
    diseaseName: '月经后期（推迟）',
    targetGroup: '年轻女性、体寒人群',
    season: ['冬季', '秋季'],
    months: [1, 2, 9, 10, 11, 12],
    symptoms: '月经周期推迟7天以上、经量少、色暗',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8200,
    productSuggestions: '调经药、暖宫贴、红糖姜茶',
  },
  {
    department: '妇科',
    diseaseName: '月经过少',
    targetGroup: '年轻女性、卵巢功能减退人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '经量明显减少、经期缩短',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '调经药、保健品、红枣',
  },
  {
    department: '妇科',
    diseaseName: '月经过多',
    targetGroup: '子宫肌瘤患者、内分泌失调人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '经量明显增多、经期延长、贫血',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '止血药、补铁剂、护垫',
  },

  // ===== 儿科 =====
  {
    department: '儿科',
    diseaseName: '小儿风寒感冒',
    targetGroup: '儿童',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '发热轻、恶寒重、流清涕、痰白稀',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 12000,
    productSuggestions: '小儿感冒颗粒、退热贴、体温计',
  },
  {
    department: '儿科',
    diseaseName: '小儿风热感冒',
    targetGroup: '儿童',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '发热重、流黄涕、咽痛、痰黄稠',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 11500,
    productSuggestions: '小儿翘清热颗粒、退热贴、体温计',
  },
  {
    department: '儿科',
    diseaseName: '小儿轮状病毒腹泻',
    targetGroup: '婴幼儿',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '水样便、发热、呕吐、脱水',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '益生菌、口服补液盐、腹泻贴',
  },
  {
    department: '儿科',
    diseaseName: '小儿细菌性腹泻',
    targetGroup: '儿童',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '黏液便、脓血便、腹痛、发热',
    treatmentTypes: ['口服液', '颗粒剂', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '抗生素、益生菌、口服补液盐',
  },
  {
    department: '儿科',
    diseaseName: '婴儿湿疹（脂溢型）',
    targetGroup: '0-6个月婴幼儿',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '头皮油腻、黄色痂皮、红斑',
    treatmentTypes: ['软膏', '凝胶', '乳液'],
    xiaohongshuHeat: 9500,
    productSuggestions: '婴儿保湿霜、湿疹膏、纯棉衣物',
  },
  {
    department: '儿科',
    diseaseName: '婴儿湿疹（渗出型）',
    targetGroup: '0-2岁婴幼儿',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '面颊红斑、水疱、渗出、结痂',
    treatmentTypes: ['软膏', '凝胶', '湿敷液'],
    xiaohongshuHeat: 8800,
    productSuggestions: '炉甘石洗剂、湿疹膏、纯棉衣物',
  },
  {
    department: '儿科',
    diseaseName: '婴儿湿疹（干燥型）',
    targetGroup: '6个月-2岁婴幼儿',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '皮肤干燥、脱屑、皲裂、瘙痒',
    treatmentTypes: ['软膏', '乳液', '保湿霜'],
    xiaohongshuHeat: 8200,
    productSuggestions: '婴儿保湿霜、凡士林、纯棉衣物',
  },
  {
    department: '儿科',
    diseaseName: '小儿积食（乳食内积）',
    targetGroup: '婴幼儿',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '食欲不振、腹胀、口臭、大便酸臭',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 7800,
    productSuggestions: '消食片、益生菌、小儿推拿',
  },
  {
    department: '儿科',
    diseaseName: '小儿积食（脾虚夹积）',
    targetGroup: '体弱儿童',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '面色萎黄、形体消瘦、大便溏薄',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 6500,
    productSuggestions: '健脾药、益生菌、小儿推拿',
  },
  {
    department: '儿科',
    diseaseName: '小儿风寒咳嗽',
    targetGroup: '儿童',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咳嗽、痰白稀、鼻塞流清涕',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '止咳糖浆、小儿咳嗽贴、雾化器',
  },
  {
    department: '儿科',
    diseaseName: '小儿风热咳嗽',
    targetGroup: '儿童',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '咳嗽、痰黄稠、咽痛、发热',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 9800,
    productSuggestions: '小儿肺热咳喘口服液、止咳贴',
  },
  {
    department: '儿科',
    diseaseName: '小儿积痰咳嗽',
    targetGroup: '儿童',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '咳嗽痰多、喉间痰鸣、胸闷',
    treatmentTypes: ['口服液', '颗粒剂', '贴剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '化痰药、止咳贴、雾化器',
  },
  {
    department: '儿科',
    diseaseName: '小儿手足口病',
    targetGroup: '5岁以下儿童',
    season: ['夏季', '秋季'],
    months: [4, 5, 6, 7, 8, 9],
    symptoms: '手、足、口腔疱疹、发热',
    treatmentTypes: ['口服液', '颗粒剂', '喷剂'],
    xiaohongshuHeat: 9200,
    productSuggestions: '抗病毒药、退热药、口腔喷剂',
  },
  {
    department: '儿科',
    diseaseName: '小儿水痘',
    targetGroup: '儿童',
    season: ['春季', '冬季'],
    months: [1, 2, 3, 4, 11, 12],
    symptoms: '全身疱疹、发热、瘙痒',
    treatmentTypes: ['口服液', '颗粒剂', '外用液'],
    xiaohongshuHeat: 7800,
    productSuggestions: '抗病毒药、炉甘石洗剂、退热药',
  },

  // ===== 眼科 =====
  {
    department: '眼科',
    diseaseName: '干眼症（水液缺乏型）',
    targetGroup: '上班族、长期用电脑人群、老年人',
    season: ['秋季', '冬季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '眼睛干涩、疲劳、异物感、泪液减少',
    treatmentTypes: ['滴眼液', '凝胶', '热敷贴'],
    xiaohongshuHeat: 8500,
    productSuggestions: '人工泪液、眼贴、护眼仪',
  },
  {
    department: '眼科',
    diseaseName: '干眼症（蒸发过强型）',
    targetGroup: '睑板腺功能障碍人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '眼睛干涩、烧灼感、视力波动',
    treatmentTypes: ['滴眼液', '凝胶', '热敷贴'],
    xiaohongshuHeat: 7200,
    productSuggestions: '人工泪液、睑板腺按摩仪、眼贴',
  },
  {
    department: '眼科',
    diseaseName: '假性近视',
    targetGroup: '学生、长期用眼人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '视力模糊、眼疲劳、可恢复',
    treatmentTypes: ['滴眼液', '眼镜', '理疗'],
    xiaohongshuHeat: 15000,
    productSuggestions: '护眼贴、叶黄素、防蓝光眼镜',
  },
  {
    department: '眼科',
    diseaseName: '真性近视',
    targetGroup: '学生、长期用眼人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '视力模糊、不可恢复、需配镜',
    treatmentTypes: ['滴眼液', '眼镜', '隐形眼镜'],
    xiaohongshuHeat: 13500,
    productSuggestions: '眼镜、隐形眼镜、护眼产品',
  },
  {
    department: '眼科',
    diseaseName: '细菌性结膜炎',
    targetGroup: '儿童、佩戴隐形眼镜人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '眼睛红肿、脓性分泌物、异物感',
    treatmentTypes: ['滴眼液', '眼膏'],
    xiaohongshuHeat: 6200,
    productSuggestions: '消炎眼药水、人工泪液、护目镜',
  },
  {
    department: '眼科',
    diseaseName: '过敏性结膜炎',
    targetGroup: '过敏体质人群、儿童',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '眼睛奇痒、流泪、充血、水样分泌物',
    treatmentTypes: ['滴眼液', '口服液'],
    xiaohongshuHeat: 7800,
    productSuggestions: '抗过敏眼药水、人工泪液、护目镜',
  },
  {
    department: '眼科',
    diseaseName: '病毒性结膜炎',
    targetGroup: '儿童、免疫力低下人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '眼睛红肿、水样分泌物、耳前淋巴结肿大',
    treatmentTypes: ['滴眼液', '眼膏'],
    xiaohongshuHeat: 5500,
    productSuggestions: '抗病毒眼药水、人工泪液、护目镜',
  },

  // ===== 耳鼻喉科 =====
  {
    department: '耳鼻喉科',
    diseaseName: '急性中耳炎',
    targetGroup: '儿童、感冒后人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '耳痛、发热、听力下降',
    treatmentTypes: ['滴耳液', '口服液', '片剂'],
    xiaohongshuHeat: 5800,
    productSuggestions: '消炎滴耳液、退烧药、棉签',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '分泌性中耳炎',
    targetGroup: '儿童、腺样体肥大人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '听力下降、耳闷、耳鸣',
    treatmentTypes: ['滴耳液', '口服液', '片剂'],
    xiaohongshuHeat: 4500,
    productSuggestions: '促排药、鼻喷剂、听力辅助',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '急性鼻窦炎',
    targetGroup: '感冒后人群、过敏体质人群',
    season: ['春季', '秋季'],
    months: [3, 4, 5, 9, 10],
    symptoms: '鼻塞、流脓涕、头痛、嗅觉减退',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 7200,
    productSuggestions: '鼻喷剂、洗鼻器、口罩',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '慢性鼻窦炎',
    targetGroup: '成年人、过敏体质人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '长期鼻塞、流脓涕、头痛、嗅觉减退',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 6500,
    productSuggestions: '鼻喷剂、洗鼻器、口罩',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '急性扁桃体炎',
    targetGroup: '儿童、青少年',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '咽痛、发热、吞咽困难、扁桃体红肿',
    treatmentTypes: ['含片', '口服液', '片剂'],
    xiaohongshuHeat: 6800,
    productSuggestions: '消炎含片、润喉糖、体温计',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '慢性扁桃体炎',
    targetGroup: '反复发作人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '咽部不适、异物感、口臭',
    treatmentTypes: ['含片', '口服液', '片剂'],
    xiaohongshuHeat: 5200,
    productSuggestions: '润喉糖、含片、保健品',
  },
  {
    department: '耳鼻喉科',
    diseaseName: '腺样体肥大',
    targetGroup: '儿童',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '鼻塞、打鼾、张口呼吸、听力下降',
    treatmentTypes: ['喷剂', '口服液', '片剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '鼻喷剂、止鼾器、保健品',
  },

  // ===== 口腔科 =====
  {
    department: '口腔科',
    diseaseName: '复发性口腔溃疡',
    targetGroup: '全人群、压力大人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '口腔黏膜溃疡、疼痛、反复发作',
    treatmentTypes: ['喷剂', '贴片', '含片'],
    xiaohongshuHeat: 9200,
    productSuggestions: '口腔溃疡贴、西瓜霜、维生素B',
  },
  {
    department: '口腔科',
    diseaseName: '创伤性口腔溃疡',
    targetGroup: '全人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '口腔黏膜溃疡、疼痛、有创伤史',
    treatmentTypes: ['喷剂', '贴片', '含片'],
    xiaohongshuHeat: 6500,
    productSuggestions: '口腔溃疡贴、西瓜霜、消炎药',
  },
  {
    department: '口腔科',
    diseaseName: '牙龈炎',
    targetGroup: '全人群、口腔卫生不良人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '牙龈出血、红肿、刷牙时加重',
    treatmentTypes: ['牙膏', '漱口水', '凝胶'],
    xiaohongshuHeat: 7500,
    productSuggestions: '牙周牙膏、漱口水、牙线',
  },
  {
    department: '口腔科',
    diseaseName: '牙周炎',
    targetGroup: '中老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '牙龈出血、肿痛、牙齿松动、牙周袋形成',
    treatmentTypes: ['牙膏', '漱口水', '凝胶'],
    xiaohongshuHeat: 6800,
    productSuggestions: '牙周牙膏、漱口水、牙线',
  },
  {
    department: '口腔科',
    diseaseName: '龋齿（浅龋）',
    targetGroup: '儿童、青少年',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '牙齿表面白斑或黑点、无明显症状',
    treatmentTypes: ['牙膏', '涂氟', '充填'],
    xiaohongshuHeat: 8500,
    productSuggestions: '含氟牙膏、牙线、儿童牙刷',
  },
  {
    department: '口腔科',
    diseaseName: '齿（深龋）',
    targetGroup: '全人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '牙齿龋洞、冷热刺激痛、食物嵌塞痛',
    treatmentTypes: ['牙膏', '充填', '根管治疗'],
    xiaohongshuHeat: 7200,
    productSuggestions: '含氟牙膏、牙线、脱敏牙膏',
  },

  // ===== 中医科 =====
  {
    department: '中医科',
    diseaseName: '肾阴虚',
    targetGroup: '中老年人、过度劳累人群、熬夜人群',
    season: ['冬季', '秋季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '腰膝酸软、头晕耳鸣、五心烦热、盗汗',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '六味地黄丸、枸杞、黑芝麻',
  },
  {
    department: '中医科',
    diseaseName: '肾阳虚',
    targetGroup: '中老年人、体寒人群',
    season: ['冬季', '秋季'],
    months: [9, 10, 11, 12, 1, 2],
    symptoms: '腰膝酸软、畏寒肢冷、夜尿频多',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '金匮肾气丸、鹿茸、核桃',
  },
  {
    department: '中医科',
    diseaseName: '气虚',
    targetGroup: '体弱人群、术后人群',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '乏力、气短、自汗、易感冒',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 9800,
    productSuggestions: '补气保健品、黄芪、人参',
  },
  {
    department: '中医科',
    diseaseName: '血虚',
    targetGroup: '女性、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '面色苍白、头晕、心悸、失眠',
    treatmentTypes: ['口服液', '胶囊', '丸剂'],
    xiaohongshuHeat: 9200,
    productSuggestions: '阿胶、红枣、当归',
  },
  {
    department: '中医科',
    diseaseName: '寒湿重',
    targetGroup: '全人群、南方地区人群',
    season: ['夏季', '长夏'],
    months: [6, 7, 8, 9],
    symptoms: '身体沉重、畏寒、大便粘腻、舌苔白腻',
    treatmentTypes: ['口服液', '胶囊', '茶饮'],
    xiaohongshuHeat: 13000,
    productSuggestions: '祛湿茶、薏米、赤小豆',
  },
  {
    department: '中医科',
    diseaseName: '湿热重',
    targetGroup: '全人群、嗜食辛辣人群',
    season: ['夏季', '长夏'],
    months: [6, 7, 8, 9],
    symptoms: '身体沉重、口苦、大便粘腻、舌苔黄腻',
    treatmentTypes: ['口服液', '胶囊', '茶饮'],
    xiaohongshuHeat: 11500,
    productSuggestions: '清热祛湿茶、绿豆、冬瓜',
  },

  // ===== 精神心理科 =====
  {
    department: '精神心理科',
    diseaseName: '入睡困难型失眠',
    targetGroup: '上班族、压力大人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '入睡时间超过30分钟、辗转反侧',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 14000,
    productSuggestions: '褪黑素、安神茶、助眠香薰',
  },
  {
    department: '精神心理科',
    diseaseName: '易醒型失眠',
    targetGroup: '中老年人、焦虑人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '夜间易醒、醒后难以入睡',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 12500,
    productSuggestions: '安神保健品、助眠香薰、眼罩',
  },
  {
    department: '精神心理科',
    diseaseName: '早醒型失眠',
    targetGroup: '抑郁症人群、老年人',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '早醒、醒后无法再入睡',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 11000,
    productSuggestions: '安神保健品、心理咨询、运动器材',
  },
  {
    department: '精神心理科',
    diseaseName: '广泛性焦虑症',
    targetGroup: '上班族、学生',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '持续紧张、担忧、心悸、出汗',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '安神保健品、减压玩具、香薰',
  },
  {
    department: '精神心理科',
    diseaseName: '惊恐障碍',
    targetGroup: '成年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '突然发作的强烈恐惧、心悸、出汗',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8500,
    productSuggestions: '安神保健品、心理咨询、减压玩具',
  },
  {
    department: '精神心理科',
    diseaseName: '轻度抑郁症',
    targetGroup: '全人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '情绪低落、兴趣减退、乏力',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 12000,
    productSuggestions: '保健品、心理咨询、运动器材',
  },
  {
    department: '精神心理科',
    diseaseName: '中度抑郁症',
    targetGroup: '全人群',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '情绪低落、兴趣减退、乏力、自责',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '保健品、心理咨询、运动器材',
  },

  // ===== 泌尿科 =====
  {
    department: '泌尿科',
    diseaseName: '急性前列腺炎',
    targetGroup: '中青年男性',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '尿频、尿急、尿痛、发热、会阴部疼痛',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 8500,
    productSuggestions: '消炎药、前列腺保健品、坐垫',
  },
  {
    department: '泌尿科',
    diseaseName: '慢性前列腺炎',
    targetGroup: '中老年男性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '尿频、尿急、会阴部不适、性功能下降',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 9500,
    productSuggestions: '前列腺保健品、坐垫、护具',
  },
  {
    department: '泌尿科',
    diseaseName: '急性尿路感染',
    targetGroup: '女性、老年人',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '尿频、尿急、尿痛、血尿',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 7200,
    productSuggestions: '消炎药、蔓越莓保健品、护垫',
  },
  {
    department: '泌尿科',
    diseaseName: '慢性尿路感染',
    targetGroup: '女性、老年人、免疫力低下人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '反复发作尿频、尿急、尿痛',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 6500,
    productSuggestions: '消炎药、蔓越莓保健品、护垫',
  },
  {
    department: '泌尿科',
    diseaseName: '肾结石',
    targetGroup: '男性、久坐人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '腰痛、血尿、恶心、呕吐',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 8800,
    productSuggestions: '排石药、多喝水、运动器材',
  },
  {
    department: '泌尿科',
    diseaseName: '膀胱结石',
    targetGroup: '男性、前列腺增生人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '排尿困难、尿痛、血尿',
    treatmentTypes: ['胶囊', '片剂', '口服液'],
    xiaohongshuHeat: 5500,
    productSuggestions: '排石药、多喝水、保健品',
  },

  // ===== 心血管内科 =====
  {
    department: '心血管内科',
    diseaseName: '原发性高血压',
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
    diseaseName: '继发性高血压',
    targetGroup: '肾病患者、内分泌疾病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '头晕、头痛、心悸、原发病症状',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 8500,
    productSuggestions: '降压药、血压计、保健品',
  },
  {
    department: '心血管内科',
    diseaseName: '稳定性心绞痛',
    targetGroup: '中老年人、冠心病患者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '胸痛、胸闷、劳累后加重',
    treatmentTypes: ['片剂', '胶囊', '喷剂'],
    xiaohongshuHeat: 10500,
    productSuggestions: '硝酸甘油、速效救心丸、血压计',
  },
  {
    department: '心血管内科',
    diseaseName: '不稳定性心绞痛',
    targetGroup: '冠心病患者',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '胸痛、胸闷、休息时也可发作',
    treatmentTypes: ['片剂', '胶囊', '喷剂'],
    xiaohongshuHeat: 9200,
    productSuggestions: '硝酸甘油、速效救心丸、血压计',
  },
  {
    department: '心血管内科',
    diseaseName: '急性心肌梗死',
    targetGroup: '中老年人、冠心病患者',
    season: ['冬季', '春季'],
    months: [1, 2, 3, 11, 12],
    symptoms: '剧烈胸痛、大汗、恶心、呕吐',
    treatmentTypes: ['片剂', '胶囊', '注射剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '急救药、血压计、保健品',
  },
  {
    department: '心血管内科',
    diseaseName: '慢性心力衰竭',
    targetGroup: '心脏病患者、老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '呼吸困难、乏力、水肿',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 9500,
    productSuggestions: '强心药、利尿剂、血压计',
  },

  // ===== 内分泌科 =====
  {
    department: '内分泌科',
    diseaseName: '1型糖尿病',
    targetGroup: '青少年、儿童',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '多饮、多食、多尿、体重下降、依赖胰岛素',
    treatmentTypes: ['注射液', '片剂', '胶囊'],
    xiaohongshuHeat: 11000,
    productSuggestions: '胰岛素、血糖仪、无糖食品',
  },
  {
    department: '内分泌科',
    diseaseName: '2型糖尿病',
    targetGroup: '中老年人、肥胖人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '多饮、多食、多尿、体重下降',
    treatmentTypes: ['片剂', '胶囊', '注射液'],
    xiaohongshuHeat: 13500,
    productSuggestions: '降糖药、血糖仪、无糖食品',
  },
  {
    department: '内分泌科',
    diseaseName: '糖尿病前期',
    targetGroup: '肥胖人群、有家族史人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '血糖偏高、无明显症状',
    treatmentTypes: ['片剂', '胶囊', '保健品'],
    xiaohongshuHeat: 9500,
    productSuggestions: '保健品、血糖仪、运动器材',
  },
  {
    department: '内分泌科',
    diseaseName: '甲状腺功能亢进',
    targetGroup: '女性、中青年人群',
    season: ['春季', '夏季'],
    months: [3, 4, 5, 6, 7, 8],
    symptoms: '心悸、手抖、多汗、体重下降、易怒',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 10500,
    productSuggestions: '抗甲状腺药、保健品、体检套餐',
  },
  {
    department: '内分泌科',
    diseaseName: '甲状腺功能减退',
    targetGroup: '女性、中老年人',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '乏力、畏寒、体重增加、记忆力减退',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 9800,
    productSuggestions: '甲状腺素片、保健品、体检套餐',
  },
  {
    department: '内分泌科',
    diseaseName: '甲状腺结节（良性）',
    targetGroup: '女性、中老年人',
    season: ['春季', '秋季'],
    months: [3, 4, 9, 10],
    symptoms: '颈部肿块、吞咽困难、多数无症状',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 8800,
    productSuggestions: '保健品、碘盐、体检套餐',
  },
  {
    department: '内分泌科',
    diseaseName: '甲状腺结节（恶性）',
    targetGroup: '有家族史人群、放射线暴露人群',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '颈部肿块、声音嘶哑、吞咽困难',
    treatmentTypes: ['口服液', '胶囊', '片剂'],
    xiaohongshuHeat: 7500,
    productSuggestions: '保健品、体检套餐、术后护理',
  },
  {
    department: '内分泌科',
    diseaseName: '高尿酸血症',
    targetGroup: '男性、嗜酒人群、肥胖人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '关节疼痛、红肿、血尿酸升高',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 9200,
    productSuggestions: '降尿酸药、保健品、低嘌呤食品',
  },
  {
    department: '内分泌科',
    diseaseName: '痛风',
    targetGroup: '男性、嗜酒人群、肥胖人群',
    season: ['夏季', '秋季'],
    months: [6, 7, 8, 9, 10],
    symptoms: '关节剧烈疼痛、红肿、发热',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 10500,
    productSuggestions: '止痛药、降尿酸药、保健品',
  },
  {
    department: '内分泌科',
    diseaseName: '骨质疏松症',
    targetGroup: '老年人、绝经后女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '腰背疼痛、身高变矮、易骨折',
    treatmentTypes: ['片剂', '胶囊', '注射液'],
    xiaohongshuHeat: 8500,
    productSuggestions: '钙片、维生素D、保健品',
  },
  {
    department: '内分泌科',
    diseaseName: '多囊卵巢综合征',
    targetGroup: '育龄女性',
    season: ['全年'],
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    symptoms: '月经不规律、多毛、痤疮、肥胖',
    treatmentTypes: ['片剂', '胶囊', '口服液'],
    xiaohongshuHeat: 9800,
    productSuggestions: '调节激素药、保健品、运动器材',
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
          <div className="bg-card rounded-xl border border-border w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto">
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
