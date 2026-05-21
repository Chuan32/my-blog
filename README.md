# My Blog - 个人博客系统

一个功能完整的个人博客系统，支持 Markdown 编辑、图片上传、用户认证、文章搜索和评论点赞功能。

## 功能特性

- **Markdown 编辑器**：使用 SimpleMDE 编辑器，支持工具栏快捷操作
- **图片上传**：支持拖拽上传，自动插入文章
- **用户系统**：注册、登录、JWT 认证，个人主页
- **文章管理**：发布、编辑、删除，支持标签分类
- **互动功能**：点赞、评论、浏览计数
- **搜索分页**：关键词搜索 + 标签过滤 + 分页
- **暗色主题**：支持明暗主题切换
- **响应式设计**：适配桌面和移动设备

## 技术栈

- **后端**：Node.js + Express
- **前端**：HTML5, CSS3, Vanilla JavaScript
- **数据库**：JSON 文件存储
- **认证**：JWT (jsonwebtoken)
- **Markdown 解析**：Marked.js + Highlight.js
- **编辑器**：SimpleMDE (CodeMirror)

## 快速部署

### 部署到 Zeabur（推荐，国内可访问，无需信用卡）

1. 打开 https://zeabur.com ，用 GitHub 账号登录
2. 点击 **新建项目** → 输入项目名（如 `my-blog`）
3. 点击 **添加服务** → 选择 **GitHub**
4. 授权后选择仓库 `Chuan32/my-blog`，分支 `main`
5. Zeabur 会自动检测 Node.js，开始部署
6. 在服务页面添加**环境变量**：`JWT_SECRET` → 值点 **生成随机值**
7. 部署完成后，点击 **生成域名** 获得公网访问链接

### 本地运行

```bash
npm install
node server.js
```

访问 http://localhost:8000

### 使用 .bat 脚本

直接双击 `start-server.bat` 即可启动服务器。

## 访问地址

- **首页**：`/` 或 `index.html`
- **文章详情**：`/post.html?id=xxx`
- **管理后台**：`/admin.html`
- **个人主页**：`/profile.html`
- **关于页面**：`/about.html`

## 在线演示

部署后可访问：
- https://chuan32.github.io/my-blog/（静态版，仅前端展示）
- Zeabur 分配的域名（完整功能版）
