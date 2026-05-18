# GitHub Pages 设置指南

## 如果无法点击 "Save" 按钮

### 情况1：提示需要权限

1. 确保你登录的 GitHub 账户有仓库的管理权限
2. 如果是别人的仓库，你需要联系仓库所有者

### 情况2：提示需要 Action 权限

我已经添加了 GitHub Actions 配置，但还需要：

1. 点击 **Settings** → **Actions** → **General**
2. 在 "Workflow permissions" 部分：
   - 勾选 **Allow GitHub Actions to create and approve pull requests**
   - 勾选 **Allow read and write permissions**
3. 点击 **Save**

### 情况3：仓库设置问题

如果你看到 Node.js 相关的设置：

1. 检查仓库根目录是否有 `.github/workflows/deploy.yml`（已添加）
2. 如果仍有问题，可以尝试删除 `package.json` 文件

## 等待部署完成

1. 提交后，点击仓库的 **Actions** 标签页
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待显示绿色 ✓

## 访问地址

成功后，你的博客将在：
```
https://chuan32.github.io/my-blog
```

## 注意事项

- GitHub Pages 免费版只能托管公开仓库
- 首次部署可能需要 5-10 分钟
- 每次推送新代码会自动重新部署