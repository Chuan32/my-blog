const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'my-blog-secret-key-2026';
const DB_DIR = path.join(__dirname, 'db');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'images');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ----- JSON Database helpers -----
function readDb(name) {
  const file = path.join(DB_DIR, name + '.json');
  if (!fs.existsSync(file)) return name === 'likes' || name === 'views' ? {} : [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return name === 'likes' || name === 'views' ? {} : []; }
}

function writeDb(name, data) {
  fs.writeFileSync(path.join(DB_DIR, name + '.json'), JSON.stringify(data, null, 2));
}

// ----- Request logging -----
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// ----- Security & parsing -----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ----- Rate limiting -----
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: '登录/注册请求过于频繁，请稍后再试' }
});
app.use('/api/users/', authLimiter);

// ----- Static files -----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname)));

// ----- Multer image upload config -----
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('仅支持 jpg/png/gif/webp/svg 格式'));
    }
    cb(null, true);
  }
});

// ----- Auth middleware -----
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// ============================
//  IMAGE UPLOAD API
// ============================

app.post('/api/images/upload', authenticate, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: '图片大小不能超过5MB' });
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: '请选择图片' });

    const url = `/uploads/images/${req.file.filename}`;
    res.json({ ok: true, url, filename: req.file.filename });
  });
});

// ============================
//  USER API
// ============================

const PASSWORD_MIN_LENGTH = 6;

app.post('/api/users/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写完整信息' });
    if (username.length < 2) return res.status(400).json({ error: '用户名至少2个字符' });
    if (username.length > 20) return res.status(400).json({ error: '用户名不能超过20个字符' });
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) return res.status(400).json({ error: '用户名只能包含字母、数字、下划线和中文' });
    if (password.length < PASSWORD_MIN_LENGTH) return res.status(400).json({ error: `密码至少${PASSWORD_MIN_LENGTH}个字符` });
    if (password.length > 100) return res.status(400).json({ error: '密码不能超过100个字符' });

    const users = readDb('users');
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      username,
      password: hashed,
      created: new Date().toISOString().slice(0, 10)
    };
    users.push(user);
    writeDb('users', users);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, msg: '注册成功', token, username: user.username });
  } catch (err) { next(err); }
});

app.post('/api/users/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写完整信息' });

    const users = readDb('users');
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).json({ error: '用户不存在' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: '密码错误' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, msg: '登录成功', token, username: user.username });
  } catch (err) { next(err); }
});

app.get('/api/users/me', authenticate, (req, res) => {
  const users = readDb('users');
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user: { id: user.id, username: user.username, created: user.created } });
});

// ============================
//  POSTS API
// ============================

app.get('/api/posts', (req, res) => {
  const posts = readDb('posts');
  const likes = readDb('likes');
  const views = readDb('views');
  const comments = readDb('comments');

  let data = posts.map(p => ({
    ...p,
    likeCount: (likes[p.id] || []).length,
    commentCount: (comments.filter(c => c.postId === p.id)).length,
    viewCount: views[p.id] || 0
  }));

  // Tag filtering
  const tag = req.query.tag;
  if (tag && tag !== '全部') {
    data = data.filter(p => p.tag === tag);
  }

  res.json({ posts: data });
});

app.get('/api/posts/:id', (req, res) => {
  const posts = readDb('posts');
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: '文章不存在' });
  res.json({ post });
});

app.post('/api/posts', authenticate, (req, res) => {
  const { title, tag, content } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: '标题不能为空' });
  if (!content || !content.trim()) return res.status(400).json({ error: '内容不能为空' });
  if (title.length > 200) return res.status(400).json({ error: '标题不能超过200个字符' });

  const posts = readDb('posts');
  const post = {
    id: uuidv4(),
    title: title.trim(),
    tag: tag || '其他',
    content: content.trim(),
    author: req.user.username,
    date: new Date().toISOString().slice(0, 10),
    excerpt: content.replace(/<[^>]*>/g, '').replace(/[#*`[\]()!]/g, '').slice(0, 150) + (content.length > 150 ? '...' : '')
  };
  posts.unshift(post);
  writeDb('posts', posts);

  const activities = readDb('activities');
  activities.unshift({
    id: uuidv4(), username: req.user.username, type: 'publish',
    targetId: post.id, detail: post.title,
    date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
  });
  writeDb('activities', activities);

  res.json({ post });
});

app.put('/api/posts/:id', authenticate, (req, res) => {
  const posts = readDb('posts');
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '文章不存在' });
  if (posts[idx].author !== req.user.username) return res.status(403).json({ error: '无权编辑' });

  const { title, tag, content } = req.body;
  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ error: '标题不能为空' });
    posts[idx].title = title.trim();
  }
  if (tag !== undefined) posts[idx].tag = tag;
  if (content !== undefined) {
    if (!content.trim()) return res.status(400).json({ error: '内容不能为空' });
    posts[idx].content = content.trim();
    posts[idx].excerpt = content.replace(/<[^>]*>/g, '').replace(/[#*`[\]()!]/g, '').slice(0, 150) + (content.length > 150 ? '...' : '');
  }
  writeDb('posts', posts);
  res.json({ post: posts[idx] });
});

app.delete('/api/posts/:id', authenticate, (req, res) => {
  let posts = readDb('posts');
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '文章不存在' });
  if (posts[idx].author !== req.user.username) return res.status(403).json({ error: '无权删除' });

  posts.splice(idx, 1);
  writeDb('posts', posts);

  let likes = readDb('likes');
  delete likes[req.params.id];
  writeDb('likes', likes);

  let views = readDb('views');
  delete views[req.params.id];
  writeDb('views', views);

  let comments = readDb('comments');
  comments = comments.filter(c => c.postId !== req.params.id);
  writeDb('comments', comments);

  let activities = readDb('activities');
  activities = activities.filter(a => a.targetId !== req.params.id);
  writeDb('activities', activities);

  res.json({ ok: true });
});

// ============================
//  TAGS API
// ============================

app.get('/api/tags', (req, res) => {
  const posts = readDb('posts');
  const tags = [...new Set(posts.map(p => p.tag).filter(Boolean))];
  tags.sort();
  res.json({ tags });
});

// ============================
//  COMMENTS API
// ============================

app.get('/api/posts/:id/comments', (req, res) => {
  const comments = readDb('comments');
  res.json({ comments: comments.filter(c => c.postId === req.params.id) });
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: '评论不能为空' });
  if (content.length > 1000) return res.status(400).json({ error: '评论不能超过1000个字符' });

  const comments = readDb('comments');
  const comment = {
    id: uuidv4(),
    postId: req.params.id,
    author: req.user.username,
    content: content.trim(),
    date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
  };
  comments.push(comment);
  writeDb('comments', comments);

  const activities = readDb('activities');
  activities.unshift({
    id: uuidv4(), username: req.user.username, type: 'comment',
    targetId: req.params.id, detail: content.slice(0, 80),
    date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
  });
  writeDb('activities', activities);

  res.json({ comment });
});

// ============================
//  LIKES API
// ============================

app.get('/api/posts/:id/like', (req, res) => {
  const likes = readDb('likes');
  const likers = likes[req.params.id] || [];
  res.json({ count: likers.length, liked: false });
});

app.post('/api/posts/:id/like', authenticate, (req, res) => {
  const likes = readDb('likes');
  if (!likes[req.params.id]) likes[req.params.id] = [];

  const idx = likes[req.params.id].indexOf(req.user.username);
  let liked;
  if (idx === -1) {
    likes[req.params.id].push(req.user.username);
    liked = true;
    const activities = readDb('activities');
    activities.unshift({
      id: uuidv4(), username: req.user.username, type: 'like',
      targetId: req.params.id, detail: '',
      date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
    });
    writeDb('activities', activities);
  } else {
    likes[req.params.id].splice(idx, 1);
    liked = false;
    let activities = readDb('activities');
    activities = activities.filter(a =>
      !(a.username === req.user.username && a.type === 'like' && a.targetId === req.params.id)
    );
    writeDb('activities', activities);
  }
  writeDb('likes', likes);
  res.json({ liked, count: likes[req.params.id].length });
});

// ============================
//  VIEWS API
// ============================

app.post('/api/posts/:id/view', (req, res) => {
  const views = readDb('views');
  views[req.params.id] = (views[req.params.id] || 0) + 1;
  writeDb('views', views);
  res.json({ count: views[req.params.id] });
});

// ============================
//  ACTIVITIES API
// ============================

app.get('/api/activities/:username', (req, res) => {
  const activities = readDb('activities');
  res.json({ activities: activities.filter(a => a.username === req.params.username) });
});

// ============================
//  ROOT ROUTE
// ============================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================
//  ERROR HANDLING
// ============================

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
  res.status(err.status || 500).json({ error: err.message || '服务器内部错误' });
});

// ============================
//  START
// ============================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blog server running at http://0.0.0.0:${PORT}`);
});
