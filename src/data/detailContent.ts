export interface ArchiveEntry {
  mark: string;
  title: string;
  meta: string;
  years: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  orientation?: 'landscape' | 'portrait';
}

export interface SocialLink {
  id: 'linkedin' | 'xiaohongshu' | 'x' | 'email';
  label: string;
  meta: string;
  href: string;
  isPlaceholder: boolean;
}

export interface DetailContent {
  ledger: string;
  archiveTitle: string;
  archiveLabel: string;
  lines: string[];
  archives: ArchiveEntry[];
  gallery?: GalleryImage[];
  socialLinks?: SocialLink[];
  revealMode?: 'typed' | 'scroll';
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    meta: '职业履历 / 海外经历',
    href: '#linkedin',
    isPlaceholder: true,
  },
  {
    id: 'xiaohongshu',
    label: '小红书',
    meta: '生活碎片 / 图文记录',
    href: '#xiaohongshu',
    isPlaceholder: true,
  },
  {
    id: 'x',
    label: 'X',
    meta: '观点更新 / 快速想法',
    href: '#x',
    isPlaceholder: true,
  },
  {
    id: 'email',
    label: 'Email',
    meta: '直接联系 / 合作沟通',
    href: '#email',
    isPlaceholder: true,
  },
];

export const DETAIL_CONTENT: Record<string, DetailContent> = {
  我的学业: {
    ledger: 'Education Ledger',
    archiveTitle: 'Archive',
    archiveLabel: 'Studies',
    lines: [
      '教育背景',
      '经济学硕士 | 乌克兰哈尔科夫国立师范大学',
      '工商管理本科 | 宁波大学科学与技术学院',
      '金融大类专科 | 宁波城市职业技术学院',
      '从金融、管理到经济学研究',
      '再进入 AI 招聘与个人项目实践',
      '把学习当作一套持续更新的观察系统。',
    ],
    archives: [
      {
        mark: 'M.A.',
        title: '经济学硕士',
        meta: '哈尔科夫国立师范大学',
        years: '2022.06 - 2024.01',
      },
      {
        mark: 'B.B.A.',
        title: '工商管理本科',
        meta: '宁波大学科学与技术学院',
        years: '2018.09 - 2020.06',
      },
      {
        mark: 'FIN.',
        title: '投资与理财专科',
        meta: '宁波城市职业技术学院',
        years: '2015.09 - 2018.06',
      },
    ],
  },
  我的履历: {
    ledger: 'Career Ledger',
    archiveTitle: 'Archive',
    archiveLabel: 'Career',
    revealMode: 'scroll',
    lines: [
      '履历档案',
      'AI 方向猎头 / 招聘顾问',
      '独立开拓 3 家 AI 企业客户',
      '聚焦算法研究员、AI 工程师、大模型岗位',
      '成功入职 50 万年薪级别 AI 算法研究员',
      '人才库储备 500+ 位 985 高校硕博人才',
      '也曾负责人事招聘、校招与银行综合柜业务。',
    ],
    archives: [
      {
        mark: 'AI',
        title: 'AI 方向猎头',
        meta: 'AI 企业客户开拓、算法与大模型岗位寻访',
        years: '2024.11 - 至今',
      },
      {
        mark: 'MAP',
        title: '人才 Mapping',
        meta: 'GitHub、LinkedIn、技术社群与招聘平台触达',
        years: '500+ 人才库',
      },
      {
        mark: 'HR',
        title: '人事与招聘',
        meta: '校招、中高层招聘、谈薪、入职与人才库建设',
        years: '2021.06 - 2024.06',
      },
    ],
  },
  日常生活: {
    ledger: 'Life Ledger',
    archiveTitle: 'Archive',
    archiveLabel: 'Life',
    lines: [
      '日常生活',
      '钓鱼、船上时间、湖边散步',
      '把户外的风、鱼线和水面光收进相册',
      '也记录和狗一起出门的安静片段',
      '生活不是旁支，是观察力的另一种训练',
      '下面放入几张最近的影像样本。',
    ],
    archives: [
      {
        mark: 'FISH',
        title: '户外钓行',
        meta: '水面、鱼线、船上时间与上鱼瞬间',
        years: 'Recent',
      },
      {
        mark: 'DOG',
        title: '陪伴片段',
        meta: '湖边散步、黄昏和狗一起出门的影像',
        years: 'Recent',
      },
      {
        mark: 'VIEW',
        title: '日常观察',
        meta: '把休息、行动和观看保存在照片里',
        years: 'Ongoing',
      },
    ],
    gallery: [
      { src: 'life-fishing-catch.jpg', alt: '钓鱼时展示鱼获', caption: '上鱼时刻' },
      { src: 'life-riverside-dog.jpg', alt: '狗在湖边黄昏中站立', caption: '湖边黄昏' },
      { src: 'life-dog-closeup.jpg', alt: '与狗在草地上的近距离照片', caption: '近距离陪伴', orientation: 'portrait' },
      { src: 'life-fishing-portrait.jpg', alt: '户外钓鱼人物照片', caption: '户外钓行' },
      { src: 'life-boat-fishing.jpg', alt: '船上钓鱼场景', caption: '船上水面' },
    ],
  },
  社交及项目: {
    ledger: 'Social Ledger',
    archiveTitle: 'Connect',
    archiveLabel: 'Social',
    lines: [
      '社交入口',
      '这里先保留平台入口的位置',
      'LinkedIn、小红书、X 与邮箱会作为后续跳转接口',
      '等真实链接补齐后',
      '这些按钮会直接跳转到对应平台或邮箱。',
    ],
    archives: [],
    socialLinks: SOCIAL_LINKS,
  },
};

export function getGalleryPages(images: GalleryImage[] = [], pageSize = 2) {
  const pages: GalleryImage[][] = [];

  for (let index = 0; index < images.length; index += pageSize) {
    pages.push(images.slice(index, index + pageSize));
  }

  return pages;
}
