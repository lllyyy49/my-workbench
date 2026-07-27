# 部署到 Vercel 指南

## 第一步：注册账号（免费）

1. 打开 https://github.com 注册 GitHub 账号（如果已有跳过）
2. 打开 https://vercel.com 点击 "Sign Up"
3. 选择 "Continue with GitHub" 授权登录

## 第二步：上传代码到 GitHub

### 方法 A：使用 GitHub 网页（推荐新手）

1. 登录 GitHub，点击右上角 "+" → "New repository"
2. 填写仓库名（如 `my-workbench`），选择 Public，点击 "Create repository"
3. 点击 "uploading an existing file"
4. 把项目文件拖拽上传（除了 node_modules 和 .next 文件夹）
5. 点击 "Commit changes"

### 方法 B：使用 Git 命令

```bash
# 在项目目录下执行
git init
git add .
git commit -m "初始版本"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

## 第三步：在 Vercel 部署

1. 登录 Vercel，点击 "Add New..." → "Project"
2. 选择刚才创建的 GitHub 仓库，点击 "Import"
3. 框架预设选择 "Next.js"（通常会自动识别）
4. 点击 "Deploy"
5. 等待 2-3 分钟，部署完成

## 第四步：获得永久域名

部署完成后，Vercel 会给你一个永久域名，格式如：
`https://my-workbench.vercel.app`

这个域名永久有效，可以随时访问！

## 可选：绑定自定义域名

如果你想用自己的域名（如 `www.你的域名.com`）：
1. 在 Vercel 项目设置中找到 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 解析

## 注意事项

- 数据存储在浏览器 localStorage，换设备或清浏览器会丢失
- 建议定期导出数据备份
- Vercel 免费套餐每月 100GB 流量，个人用足够
