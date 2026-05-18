const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'my-blog-secret-key-2026';
const DB_DIR = path.join(__dirname, 'db');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// ----- JSON Database helper -----
function readDb(name) {
  const file = path.join(DB_DIR, name + '.json');
  if (!fs.existsSync(file)) return name === 'likes' || name === 'views' ? {} : [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return name === 'likes' || name === 'views' ? {} : []; }
}

function writeDb(name, data) {
  fs.writeFileSync(path.join(DB_DIR, name + '.json'), JSON.stringify(data, null, 2));
}

// ----- Middleware -----
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve static files

// Auth middleware
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
//  USER API
// ============================

app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请填写完整信息' });
  if (username.length < 2) return res.status(400).json({ error: '用户名至少2个字符' });
  if (password.length < 4) return res.status(400).json({ error: '密码至少4个字符' });

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
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请填写完整信息' });

  const users = readDb('users');
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: '用户不存在' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: '密码错误' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, msg: '登录成功', token, username: user.username });
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

  const data = posts.map(p => ({
    ...p,
    likeCount: (likes[p.id] || []).length,
    commentCount: (comments.filter(c => c.postId === p.id)).length,
    viewCount: views[p.id] || 0
  }));
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
  if (!title || !content) return res.status(400).json({ error: '标题和内容不能为空' });

  const posts = readDb('posts');
  const post = {
    id: uuidv4(),
    title,
    tag: tag || '其他',
    content,
    author: req.user.username,
    date: new Date().toISOString().slice(0, 10),
    excerpt: content.replace(/<[^>]*>/g, '').slice(0, 150) + (content.length > 150 ? '...' : '')
  };
  posts.unshift(post);
  writeDb('posts', posts);

  // Activity
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
  if (title) posts[idx].title = title;
  if (tag) posts[idx].tag = tag;
  if (content) {
    posts[idx].content = content;
    posts[idx].excerpt = content.replace(/<[^>]*>/g, '').slice(0, 150) + (content.length > 150 ? '...' : '');
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

  // Clean related data
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
//  COMMENTS API
// ============================

app.get('/api/posts/:id/comments', (req, res) => {
  const comments = readDb('comments');
  res.json({ comments: comments.filter(c => c.postId === req.params.id) });
});

app.post('/api/posts/:id/comments', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '评论不能为空' });

  const comments = readDb('comments');
  const comment = {
    id: uuidv4(),
    postId: req.params.id,
    author: req.user.username,
    content,
    date: new Date().toISOString().slice(0, 10) + ' ' + new Date().toTimeString().slice(0, 5)
  };
  comments.push(comment);
  writeDb('comments', comments);

  // Activity
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
    // Activity
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
    // Remove activity
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
//  START
// ============================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Blog server running at http://0.0.0.0:${PORT}`);
});
