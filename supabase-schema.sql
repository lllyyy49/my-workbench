-- 待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日程事件表
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 工作日志表
CREATE TABLE IF NOT EXISTS work_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 小红书笔记表
CREATE TABLE IF NOT EXISTS xiaohongshu_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'normal',
  title TEXT,
  content TEXT,
  images TEXT[],
  shop_id TEXT,
  product_name TEXT,
  product_link TEXT,
  publish_date TEXT,
  sales_amount FLOAT DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  promotion_cost FLOAT DEFAULT 0,
  real_views INTEGER DEFAULT 0,
  real_likes INTEGER DEFAULT 0,
  real_comments INTEGER DEFAULT 0,
  real_shares INTEGER DEFAULT 0,
  real_sales FLOAT DEFAULT 0,
  real_roi FLOAT DEFAULT 0,
  fake_views INTEGER DEFAULT 0,
  fake_likes INTEGER DEFAULT 0,
  fake_comments INTEGER DEFAULT 0,
  fake_shares INTEGER DEFAULT 0,
  fake_sales FLOAT DEFAULT 0,
  fake_sales_amount FLOAT DEFAULT 0,
  fake_sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评价模板表
CREATE TABLE IF NOT EXISTS review_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  product_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习分类表
CREATE TABLE IF NOT EXISTS learning_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习资源表
CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id UUID REFERENCES learning_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT,
  type TEXT DEFAULT 'link',
  notes TEXT,
  thoughts TEXT,
  practice_plan TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 爆文库表
CREATE TABLE IF NOT EXISTS viral_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  platform TEXT,
  likes INTEGER DEFAULT 0,
  collects INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 病症库表
CREATE TABLE IF NOT EXISTS disease_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT,
  season TEXT,
  months TEXT[],
  symptoms TEXT[],
  products TEXT[],
  custom_products JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS（行级安全）
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiaohongshu_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_trends ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（只允许用户访问自己的数据）
CREATE POLICY "用户只能访问自己的待办" ON todos FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的日程" ON calendar_events FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的笔记" ON notes FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的工作日志" ON work_logs FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的小红书笔记" ON xiaohongshu_notes FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的评价模板" ON review_templates FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的学习分类" ON learning_categories FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的学习资源" ON learning_resources FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的爆文" ON viral_articles FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "用户只能访问自己的病症" ON disease_trends FOR ALL USING (user_id = auth.uid()::text);
