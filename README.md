# My Blog - 个人博客系统

一个简洁的个人博客系统，支持 Markdown 编辑、图片上传、文章搜索和分页功能。

## 功能特性

### ✨ 已实现功能
- **Markdown 编辑器**：支持标题、加粗、斜体、代码块、列表等 Markdown 语法
- **图片上传**：支持文章配图和头像上传（拖拽上传）
- **文章搜索**：支持按标题和内容搜索文章
- **分页功能**：文章列表分页显示
- **响应式设计**：适配桌面和移动设备
- **暗色主题**：支持明暗主题切换

### 🛠 技术栈
- **前端**：HTML5, CSS3, Vanilla JavaScript
- **Markdown 解析**：Marked.js
- **代码高亮**：Highlight.js
- **编辑器**：SimpleMDE
- **图标**：Emoji

## 文件结构

```
personal-blog/
├── css/
│   └── style.css              # 主样式文件
├── js/
│   ├── api.js                 # API 请求封装
│   ├── main.js                # 主要业务逻辑
│   ├── markdown.js            # Markdown 渲染器
│   └── editor.js              # 编辑器功能
├── uploads/
│   └── images/                # 图片上传目录
├── index.html                 # 首页
├── post.html                  # 文章详情页
├── admin.html                 # 管理页面（登录/发布/编辑）
├── profile.html              # 个人主页
├── about.html                 # 关于页面
└── README.md                  # 项目说明
```

## 安装和运行

### 前端运行
1. 克隆或下载项目文件
2. 用浏览器打开 `index.html` 即可访问博客

### 后端支持（图片上传）
由于这是一个纯前端项目，图片上传功能需要后端支持。你需要实现以下 API 接口：

```javascript
// 图片上传接口
POST /api/images/upload
Content-Type: multipart/form-data

{
  "file": "图片文件",
  "type": "post|avatar"
}

// 返回示例
{
  "success": true,
  "url": "/uploads/images/filename.jpg",
  "filename": "filename.jpg"
}
```

## 使用说明

### 发表文章
1. 访问 `admin.html`
2. 登录或注册新账号
3. 点击"发布文章"
4. 使用 Markdown 编辑器撰写文章
5. 支持工具栏按钮快速插入格式
6. 可以上传图片作为文章配图
7. 点击预览按钮查看渲染效果
8. 填写标题和分类标签后发布

### 搜索文章
- 在首页搜索框中输入关键词
- 支持搜索文章标题和内容
- 搜索结果会实时显示

### 上传头像
- 访问 `profile.html`
- 点击头像右下角的相机图标
- 选择或拖拽图片上传

### Markdown 语法支持
- **粗体**：`**粗体文字**`
- *斜体*：`*斜体文字*`
- 标题：`# 一级标题`、`## 二级标题`
- 列表：
  ```markdown
  - 无序列表项
  - 另一个列表项
  
  1. 有序列表项
  2. 另一个列表项
  ```
- 引用：`> 引用内容`
- 代码：
  - 行内代码：`console.log('hello')`
  - 代码块：```javascript\nconsole.log('hello')\n```
- 链接：`[链接文字](URL)`
- 图片：`![图片描述](图片URL)`

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 自定义配置

### 修改分页数量
在 `js/main.js` 中修改 `postsPerPage` 常量：
```javascript
const postsPerPage = 10; // 每页显示文章数
```

### 修改主题颜色
在 `css/style.css` 中的 `:root` 部分修改 CSS 变量。

## 注意事项

1. 图片上传功能需要后端服务器支持
2. 所有数据存储在浏览器的 localStorage 中，清除浏览器数据会丢失
3. 建议部署到支持 Node.js 或 PHP 的服务器以获得完整功能

## 开发计划

- [ ] 添加标签分类页面
- [ ] 添加评论回复功能
- [ ] 添加文章导出功能（PDF/Markdown）
- [ ] 添加 RSS 订阅
- [ ] 添加后台管理功能

---

Made with ❤️ by My Blog