(function () {
  // ===== Theme =====
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var savedTheme = localStorage.getItem('theme') || 'light';
    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    setTheme(savedTheme);
    themeToggle.addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ===== Utility =====
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ===== Auth =====
  var Auth = {
    getToken: function () { return localStorage.getItem('token'); },
    getUsername: function () { return localStorage.getItem('username'); },
    isLoggedIn: function () { return !!this.getToken(); },
    setAuth: function (token, username) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
    },
    clearAuth: function () {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    },
    login: async function (username, password) {
      var data = await API.post('/api/users/login', { username, password });
      this.setAuth(data.token, data.username);
      return data;
    },
    register: async function (username, password) {
      var data = await API.post('/api/users/register', { username, password });
      this.setAuth(data.token, data.username);
      return data;
    }
  };

  // ===== Nav profile link =====
  var navProfile = document.getElementById('navProfile');
  if (navProfile) {
    if (Auth.isLoggedIn()) {
      navProfile.style.display = 'inline';
    }
  }

  // ===== Homepage =====
  var postList = document.getElementById('postList');
  if (postList) {
    renderPosts();

    async function renderPosts() {
      try {
        var data = await API.get('/api/posts');
        var posts = data.posts || [];
        if (posts.length === 0) {
          postList.innerHTML = '<p class="empty-state">还没有文章，<a href="admin.html">去发布第一篇</a></p>';
          return;
        }
        var html = '';
        for (var i = 0; i < posts.length; i++) {
          var p = posts[i];
          html += '<article class="post-card">'
            + '<div class="post-meta">'
            + '<time datetime="' + p.date + '">' + p.date + '</time>'
            + '<span class="post-tag">' + escapeHtml(p.tag) + '</span>'
            + '<span class="post-author">' + escapeHtml(p.author || '') + '</span>'
            + '</div>'
            + '<h2 class="post-title"><a href="post.html?id=' + p.id + '">' + escapeHtml(p.title) + '</a></h2>'
            + '<p class="post-excerpt">' + escapeHtml(p.excerpt) + '</p>'
            + '<div class="post-footer">'
            + '<a href="post.html?id=' + p.id + '" class="read-more">阅读更多 →</a>'
            + '<span class="post-stats">'
            + '<span class="stat-view">👁 ' + (p.viewCount || 0) + '</span>'
            + '<span class="stat-like">♡ ' + (p.likeCount || 0) + '</span>'
            + '<span class="stat-comment">💬 ' + (p.commentCount || 0) + '</span>'
            + '</span>'
            + '</div>'
            + '</article>';
        }
        postList.innerHTML = html;
      } catch (e) {
        postList.innerHTML = '<p class="empty-state">加载失败：' + escapeHtml(e.message) + '</p>';
      }
    }
  }

  // ===== Post detail =====
  var postContent = document.getElementById('postContent');
  if (postContent) {
    var currentPostId = null;

    renderPost();

    async function renderPost() {
      var params = new URLSearchParams(window.location.search);
      var id = params.get('id');
      if (!id) {
        postContent.innerHTML = '<p class="empty-state">文章不存在</p>';
        return;
      }
      currentPostId = id;

      try {
        var postData = await API.get('/api/posts/' + id);
        var post = postData.post;
        if (!post) {
          postContent.innerHTML = '<p class="empty-state">文章不存在或已被删除</p>';
          return;
        }

        // Count view
        var viewData = await API.post('/api/posts/' + id + '/view');

        var html = '<header class="post-full-header">'
          + '<h1>' + escapeHtml(post.title) + '</h1>'
          + '<div class="post-meta-bar">'
          + '<div class="post-meta">'
          + '<time datetime="' + post.date + '">' + post.date + '</time>'
          + '<span class="post-tag">' + escapeHtml(post.tag) + '</span>'
          + '<span>' + escapeHtml(post.author || '') + '</span>'
          + '</div>'
          + '<div class="post-meta-extra">'
          + '<span class="stat-view">👁 ' + viewData.count + ' 次阅读</span>'
          + '</div>'
          + '</div>'
          + '</header>'
          + '<div class="post-full-body">' + post.content.replace(/\n/g, '<br>') + '</div>';
        postContent.innerHTML = html;
        document.title = post.title + ' - 我的博客';

        renderLike(id);
        renderComments(id);
      } catch (e) {
        postContent.innerHTML = '<p class="empty-state">加载失败：' + escapeHtml(e.message) + '</p>';
      }
    }

    // ----- Like -----
    async function renderLike(postId) {
      var likeBtn = document.getElementById('likeBtn');
      var likeIcon = document.getElementById('likeIcon');
      var likeCount = document.getElementById('likeCount');
      if (!likeBtn) return;

      try {
        var data = await API.get('/api/posts/' + postId + '/like');
        likeCount.textContent = data.count;

        if (Auth.isLoggedIn()) {
          var postData = await API.get('/api/posts/' + postId);
          // We need to check if current user liked - use the like check
          var likeData = await API.get('/api/posts/' + postId + '/like');
          // Actually need a way to check if user liked. Let me add that to the response.
          // For now, we'll track locally
          var liked = localStorage.getItem('liked_' + postId) === 'true';
          if (liked) {
            likeIcon.textContent = '♥';
            likeBtn.classList.add('liked');
          } else {
            likeIcon.textContent = '♡';
            likeBtn.classList.remove('liked');
          }
          likeBtn.disabled = false;
          likeBtn.title = '点赞';
        } else {
          likeIcon.textContent = '♡';
          likeBtn.classList.remove('liked');
          likeBtn.disabled = true;
          likeBtn.title = '请先登录后点赞';
        }
      } catch (e) { /* ignore */ }
    }

    var likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
      likeBtn.addEventListener('click', async function () {
        if (!Auth.isLoggedIn()) { alert('请先登录'); return; }
        try {
          var data = await API.post('/api/posts/' + currentPostId + '/like');
          localStorage.setItem('liked_' + currentPostId, data.liked ? 'true' : 'false');
          renderLike(currentPostId);
        } catch (e) { alert(e.message); }
      });
    }

    // ----- Comments -----
    async function renderComments(postId) {
      var formArea = document.getElementById('commentFormArea');
      var listEl = document.getElementById('commentList');

      var user = Auth.getUsername();
      if (user) {
        formArea.innerHTML = '<form class="comment-form" id="commentForm">'
          + '<textarea id="commentInput" rows="3" placeholder="写下你的评论..."></textarea>'
          + '<button type="submit" class="btn btn-primary btn-sm">发表评论</button>'
          + '</form>';
        document.getElementById('commentForm').addEventListener('submit', async function (e) {
          e.preventDefault();
          var input = document.getElementById('commentInput');
          var text = input.value.trim();
          if (!text) { alert('评论不能为空'); return; }
          try {
            await API.post('/api/posts/' + postId + '/comments', { content: text });
            input.value = '';
            renderComments(postId);
          } catch (e) { alert(e.message); }
        });
      } else {
        formArea.innerHTML = '<p class="comment-login-hint"><a href="admin.html">登录</a>后即可发表评论</p>';
      }

      try {
        var data = await API.get('/api/posts/' + postId + '/comments');
        var comments = data.comments || [];
        if (comments.length === 0) {
          listEl.innerHTML = '<p class="empty-state">暂无评论</p>';
          return;
        }
        var html = '';
        for (var i = 0; i < comments.length; i++) {
          var c = comments[i];
          html += '<div class="comment-item">'
            + '<div class="comment-header">'
            + '<strong>' + escapeHtml(c.author) + '</strong>'
            + '<time>' + c.date + '</time>'
            + '</div>'
            + '<p class="comment-body">' + escapeHtml(c.content) + '</p>'
            + '</div>';
        }
        listEl.innerHTML = html;
      } catch (e) {
        listEl.innerHTML = '<p class="empty-state">加载评论失败</p>';
      }
    }
  }

  // ===== Admin page =====
  var loginForm = document.getElementById('loginForm');
  var adminPanel = document.getElementById('adminPanel');
  if (loginForm && adminPanel) {
    (function () {
      function showLogin() {
        loginForm.style.display = 'flex';
        adminPanel.style.display = 'none';
      }

      function showAdmin() {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        var info = document.getElementById('userInfo');
        info.textContent = '当前用户：' + (Auth.getUsername() || '');
        renderManageList();
      }

      if (Auth.isLoggedIn()) {
        showAdmin();
      }

      // ----- Auth tabs -----
      var authTabs = document.querySelectorAll('.auth-tab');
      var authForms = {
        loginTab: document.getElementById('loginTab'),
        registerTab: document.getElementById('registerTab')
      };

      for (var t = 0; t < authTabs.length; t++) {
        authTabs[t].addEventListener('click', function () {
          for (var i = 0; i < authTabs.length; i++) {
            authTabs[i].classList.remove('active');
          }
          this.classList.add('active');
          var tab = this.getAttribute('data-tab');
          authForms.loginTab.style.display = 'none';
          authForms.registerTab.style.display = 'none';
          if (authForms[tab]) authForms[tab].style.display = 'block';
        });
      }

      // ----- Login -----
      document.getElementById('loginTab').addEventListener('submit', async function (e) {
        e.preventDefault();
        var username = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value;
        var hint = document.getElementById('loginHint');
        try {
          await Auth.login(username, password);
          showAdmin();
        } catch (err) {
          hint.textContent = err.message;
          hint.style.color = '#e74c3c';
        }
      });

      // ----- Register -----
      document.getElementById('registerTab').addEventListener('submit', async function (e) {
        e.preventDefault();
        var username = document.getElementById('regUsername').value.trim();
        var password = document.getElementById('regPassword').value;
        var confirm = document.getElementById('regConfirm').value;
        var hint = document.getElementById('registerHint');

        if (password !== confirm) {
          hint.textContent = '两次密码不一致';
          hint.style.color = '#e74c3c';
          return;
        }

        try {
          await Auth.register(username, password);
          hint.textContent = '注册成功！正在登录...';
          hint.style.color = '#27ae60';
          setTimeout(function () { showAdmin(); }, 500);
        } catch (err) {
          hint.textContent = err.message;
          hint.style.color = '#e74c3c';
        }
      });

      // ----- Logout -----
      document.getElementById('logoutBtn').addEventListener('click', function () {
        Auth.clearAuth();
        showLogin();
      });

      // ----- Post form -----
      var postForm = document.getElementById('postForm');
      var editIdInput = document.getElementById('editId');
      var submitBtn = document.getElementById('submitBtn');
      var cancelBtn = document.getElementById('cancelEditBtn');

      postForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var title = document.getElementById('postTitle').value.trim();
        var tag = document.getElementById('postTag').value;
        var content = document.getElementById('postContent').value.trim();
        if (!title || !content) { alert('请填写标题和内容'); return; }

        var editId = editIdInput.value;
        try {
          if (editId) {
            await API.put('/api/posts/' + editId, { title: title, tag: tag, content: content });
          } else {
            await API.post('/api/posts', { title: title, tag: tag, content: content });
          }
          postForm.reset();
          editIdInput.value = '';
          submitBtn.textContent = '发布文章';
          cancelBtn.style.display = 'none';
          renderManageList();
          alert(editId ? '文章已更新！' : '文章已发布！');
        } catch (err) { alert(err.message); }
      });

      cancelBtn.addEventListener('click', function () {
        postForm.reset();
        editIdInput.value = '';
        submitBtn.textContent = '发布文章';
        cancelBtn.style.display = 'none';
      });

      async function renderManageList() {
        var el = document.getElementById('manageList');
        try {
          var data = await API.get('/api/posts');
          var posts = data.posts || [];
          if (posts.length === 0) {
            el.innerHTML = '<p class="empty-state">暂无文章</p>';
            return;
          }
          var html = '';
          for (var i = 0; i < posts.length; i++) {
            var p = posts[i];
            html += '<div class="manage-item">'
              + '<div class="manage-item-info">'
              + '<strong>' + escapeHtml(p.title) + '</strong>'
              + '<span class="post-meta">' + p.date + ' · ' + escapeHtml(p.tag) + ' · ' + escapeHtml(p.author || '') + ' · 👁' + (p.viewCount || 0) + ' · ♡' + (p.likeCount || 0) + ' · 💬' + (p.commentCount || 0) + '</span>'
              + '</div>'
              + '<div class="manage-item-actions">'
              + '<button class="btn btn-sm btn-outline" onclick="window.editPost(\'' + p.id + '\')">编辑</button>'
              + '<button class="btn btn-sm btn-danger" onclick="window.deletePost(\'' + p.id + '\')">删除</button>'
              + '</div>'
              + '</div>';
          }
          el.innerHTML = html;
        } catch (e) {
          el.innerHTML = '<p class="empty-state">加载失败</p>';
        }
      }

      window.editPost = async function (id) {
        try {
          var data = await API.get('/api/posts/' + id);
          var post = data.post;
          if (!post) return;
          document.getElementById('postTitle').value = post.title;
          document.getElementById('postTag').value = post.tag;
          document.getElementById('postContent').value = post.content;
          editIdInput.value = id;
          submitBtn.textContent = '更新文章';
          cancelBtn.style.display = 'inline-block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) { alert(e.message); }
      };

      window.deletePost = async function (id) {
        if (!confirm('确定删除此文章？')) return;
        try {
          await API.del('/api/posts/' + id);
          renderManageList();
        } catch (e) { alert(e.message); }
      };
    })();
  }

  // ===== Profile page =====
  var profilePage = document.getElementById('profilePage');
  if (profilePage) {
    if (!Auth.isLoggedIn()) {
      profilePage.innerHTML = '<div class="profile-login-required"><h1>需要登录</h1><p>请先 <a href="admin.html">登录</a> 后查看个人主页</p></div>';
    } else {
      renderProfile();
    }

    async function renderProfile() {
      var username = Auth.getUsername();
      try {
        var userData = await API.get('/api/users/me');
        var user = userData.user;
        var postsData = await API.get('/api/posts');
        var allPosts = postsData.posts || [];
        var myPosts = allPosts.filter(function (p) { return p.author === username; });

        var allComments = [];
        for (var i = 0; i < allPosts.length; i++) {
          try {
            var cd = await API.get('/api/posts/' + allPosts[i].id + '/comments');
            allComments = allComments.concat(cd.comments || []);
          } catch (e) { /* skip */ }
        }
        var myComments = allComments.filter(function (c) { return c.author === username; });

        var totalViews = 0;
        for (var i = 0; i < myPosts.length; i++) {
          totalViews += myPosts[i].viewCount || 0;
        }

        var totalLikes = 0;
        for (var i = 0; i < myPosts.length; i++) {
          totalLikes += myPosts[i].likeCount || 0;
        }

        var actData = await API.get('/api/activities/' + username);
        var activities = actData.activities || [];

        var html = '<div class="profile-card">'
          + '<div class="profile-avatar"><span class="avatar-placeholder-large">' + username.charAt(0).toUpperCase() + '</span></div>'
          + '<h1>' + escapeHtml(username) + '</h1>'
          + '<p class="profile-join">注册于 ' + (user.created || '') + '</p>'
          + '</div>'

          + '<div class="profile-stats">'
          + '<div class="stat-item"><strong>' + myPosts.length + '</strong><span>文章</span></div>'
          + '<div class="stat-item"><strong>' + totalViews + '</strong><span>浏览</span></div>'
          + '<div class="stat-item"><strong>' + myComments.length + '</strong><span>评论</span></div>'
          + '<div class="stat-item"><strong>' + totalLikes + '</strong><span>获赞</span></div>'
          + '</div>'

          + '<section class="profile-activity"><h2>我的动态</h2>';

        if (activities.length === 0) {
          html += '<p class="empty-state">暂无动态</p>';
        } else {
          html += '<div class="activity-list">';
          for (var i = 0; i < activities.length; i++) {
            var a = activities[i];
            var icon = a.type === 'publish' ? '📝' : (a.type === 'comment' ? '💬' : '♡');
            var actionText = a.type === 'publish' ? '发布了文章' : (a.type === 'comment' ? '评论了文章' : '赞了文章');
            var link = 'post.html?id=' + a.targetId;
            html += '<div class="activity-item">'
              + '<span class="activity-icon">' + icon + '</span>'
              + '<div class="activity-body">'
              + '<p><strong>' + escapeHtml(a.username) + '</strong> ' + actionText
              + ' <a href="' + link + '">' + escapeHtml(a.detail || '#') + '</a></p>'
              + '<time>' + a.date + '</time>'
              + '</div>'
              + '</div>';
          }
          html += '</div>';
        }

        html += '</section>';
        profilePage.innerHTML = html;
      } catch (e) {
        profilePage.innerHTML = '<p class="empty-state">加载失败：' + escapeHtml(e.message) + '</p>';
      }
    }
  }
})();
