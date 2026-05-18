# 博客外网访问指南

## 当前状态
✅ 你的博客已经在本地运行：http://10.36.53.110:8000

## 快速外网访问方案

### 方案一：使用内网穿透工具（推荐）

#### 方法1：使用 LocalXpose（最简单）
1. 下载安装：https://github.com/localtunnel/localxpose/releases
2. 运行命令：
   ```bash
   lxpe http --port=8000
   ```
3. 会自动生成公网访问地址

#### 方法2：使用 frp（需要服务器）
如果你有云服务器，可以配置 frp 客户端：
```bash
./frp -c frpc.ini
```

#### 方法3：使用花生壳内网穿透
1. 注册花生贝账号：https://hsk.oray.com
2. 下载花生壳客户端
3. 映射本地8000端口

### 方案二：部署到 GitHub Pages（永久免费）

#### 自动部署脚本
我已经创建了 `deploy-to-github.bat`，双击运行即可！

手动步骤：
```bash
cd C:\Users\谭志豪\Desktop\personal-blog

# 初始化Git
git init

# 添加GitHub仓库（替换你的信息）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 提交代码
git add .
git commit -m "Initial blog"
git branch -M main
git push -u origin main

# 然后在GitHub仓库的Settings → Pages中启用
```

### 方案三：使用现成的静态网站托管平台

#### Netlify（拖拽即可部署）
1. 访问 https://app.netlify.com
2. 拖拽整个博客文件夹到上传区域
3. 自动获得公网地址

#### GitHub Pages（推荐）
1. 将代码推送到GitHub
2. 自动获得 https://用户名.github.io/仓库名

## 立即可用的临时解决方案

如果你想立即让朋友访问，可以：

1. **让朋友连入你的WiFi** - 这样他们就可以通过 http://10.36.53.110:8000 访问

2. **使用微信/QQ分享屏幕** - 实时展示博客内容

3. **录屏制作视频** - 分享视频链接

## 最佳推荐

对于长期使用，**推荐部署到 GitHub Pages**：
- 完全免费
- 全球访问
- HTTPS加密
- 自动备份

## 注意事项

1. 内网穿透工具的地址会经常变化
2. 部署到GitHub后，记得修改代码中的图片路径
3. 博客数据存储在浏览器本地，不同用户看到的独立数据

## 下一步建议

1. 首先尝试双击运行 `deploy-to-github.bat` 进行GitHub部署
2. 如果需要快速临时访问，可以先用内网穿透工具

需要我协助你完成部署吗？