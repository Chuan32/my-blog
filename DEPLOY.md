# 博客外网访问部署指南

## 方案一：使用 GitHub Pages（免费且简单）

### 步骤1：创建 GitHub 账户
1. 访问 https://github.com 注册账户
2. 验证邮箱

### 步骤2：创建新仓库
1. 登录 GitHub
2. 点击右上角的 "+" 号 → "New repository"
3. 填写仓库名称：`my-personal-blog`
4. 设置为 Public（公开）
5. 不要勾选 "Add a README file"
6. 点击 "Create repository"

### 步骤3：上传博客文件
1. 打开命令提示符，进入博客目录：
   ```bash
   cd C:\Users\谭志豪\Desktop\personal-blog
   ```

2. 初始化 git 仓库（如果还没初始化）：
   ```bash
   git init
   ```

3. 添加远程仓库（替换 `your-username` 为你的 GitHub 用户名）：
   ```bash
   git remote add origin https://github.com/your-username/my-personal-blog.git
   ```

4. 添加所有文件：
   ```bash
   git add .
   ```

5. 提交代码：
   ```bash
   git commit -m "Initial commit: Personal blog with Markdown editor"
   ```

6. 推送到 GitHub：
   ```bash
   git branch -M main
   git push -u origin main
   ```

### 步骤4：启用 GitHub Pages
1. 进入你的仓库页面
2. 点击 "Settings"
3. 找到左侧菜单的 "Pages"
4. 在 "Source" 下选择 "Deploy from a branch"
5. Branch 选择 "main"，目录选择 "/ (root)"
6. 点击 "Save"

### 步骤5：访问你的博客
几分钟后，你的博客将在以下地址可用：
```
https://your-username.github.io/my-personal-blog
```

## 方案二：使用 Netlify（更强大的功能）

### 步骤1：创建 Netlify 账户
1. 访问 https://app.netlify.com/signup
2. 注册账户（可以使用 GitHub 账户登录）

### 步骤2：部署到 Netlify
1. 登录 Netlify
2. 点击 "New site from Git"
3. 选择 GitHub（连接你的 GitHub 账户）
4. 选择 `my-personal-blog` 仓库
5. 设置构建设置：
   - Build command: 留空
   - Publish directory: 留空
6. 点击 "Deploy site"

### 步骤3：访问你的博客
部署完成后，Netlify 会提供一个随机的域名，你也可以在设置中自定义域名。

## 方案三：使用 Vercel（现代化部署）

### 步骤1：安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤2：登录并部署
```bash
# 进入博客目录
cd C:\Users\谭志豪\Desktop\personal-blog

# 登录 Vercel
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 方案四：使用 Cloudflare Pages（免费CDN加速）

### 步骤1：导入 GitHub 仓库
1. 登录 https://dash.cloudflare.com
2. 进入 "Pages" → "Create a project"
3. 连接 GitHub 并选择 `my-personal-blog` 仓库

### 步骤2：配置构建设置
框架预设：选择 "Static HTML"
构建设令：留空

### 步骤3：部署
点击 "Deploy site" 完成部署

## 最终效果

完成部署后，任何人都可以通过以下方式访问你的博客：

1. **GitHub Pages**: `https://your-username.github.io/my-personal-blog`
2. **Netlify**: `https://random-name.netlify.app`
3. **Vercel**: `https://your-project-name.vercel.app`
4. **Cloudflare Pages**: `https://your-project-name.pages.dev`

## 注意事项

1. **域名解析**：如果你想使用自己的域名，需要在域名提供商处添加 CNAME 记录
2. **HTTPS**：所有平台都提供免费的 HTTPS 证书
3. **图片上传**：目前部署的静态博客不支持图片上传，需要额外的后端支持
4. **数据存储**：博客数据存储在浏览器本地，不同用户看到的是各自的数据

## 推荐方案

对于新手用户，**推荐使用 GitHub Pages**，因为：
- 完全免费
- 部署简单
- 无需额外配置
- 适合静态网站

如果你想要更多功能（如自定义域名、统计分析等），可以使用 **Netlify** 或 **Vercel**。