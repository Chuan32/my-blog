// Markdown renderer and image uploader
var MarkdownRenderer = {
    // 渲染Markdown为HTML
    render: function(markdown) {
        const marked = window.marked;
        if (!marked) {
            // 如果marked未加载，使用基本转换
            return this.basicMarkdownToHtml(markdown);
        }

        const renderer = new marked.Renderer();

        // 配置代码块高亮
        renderer.code = function(code, language) {
            const lang = language || 'plaintext';
            return `<pre><code class="hljs language-${lang}">${marked.escape(code)}</code></pre>`;
        };

        // 配置列表
        renderer.list = function(body, ordered) {
            const type = ordered ? 'ol' : 'ul';
            return `<${type}>\n${body}</${type}>\n`;
        };

        renderer.listitem = function(text) {
            return `<li>${text}</li>\n`;
        };

        // 配置链接
        renderer.link = function(href, title, text) {
            return `<a href="${href}" title="${title || ''}" target="_blank">${text}</a>`;
        };

        // 配置图片
        renderer.image = function(href, title, text) {
            return `<img src="${href}" alt="${text || ''}" title="${title || ''}" class="post-image">`;
        };

        marked.setOptions({
            renderer: renderer,
            gfm: true,
            breaks: true,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });

        return marked.parse(markdown);
    },

    // 基本的Markdown到HTML转换（备用）
    basicMarkdownToHtml: function(text) {
        return text
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // 行内代码
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // 代码块
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
            // 图片
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="post-image">')
            // 无序列表
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // 有序列表
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
            .replace(/<\/ul>\s*<ol>/g, '')
            .replace(/<\/ol>\s*<ul>/g, '')
            // 换行
            .replace(/\n/gim, '<br>');
    },

    // 生成文章摘要
    generateExcerpt: function(markdown, maxLength) {
        const plainText = markdown
            .replace(/[#*`[\]()!]/g, '')
            .replace(/\n/g, ' ')
            .trim();
        return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
    }
};

// 图片上传功能
var ImageUploader = {
    // 上传单个图片
    async uploadImage(file, type = 'post') {
        if (!file) throw new Error('请选择图片');

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            throw new Error('只能上传图片文件');
        }

        // 检查文件大小（5MB限制）
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('图片大小不能超过5MB');
        }

        // 创建FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('请先登录');
        }

        const response = await fetch('/api/images/upload', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || '上传失败');
        }

        return {
            url: result.url,
            filename: result.filename,
            size: file.size
        };
    },

    // 上传头像
    async uploadAvatar(file) {
        return this.uploadImage(file, 'avatar');
    },

    // 生成图片URL
    getImageUrl(filename) {
        return `/uploads/images/${filename}`;
    }

    // 注意：后端需要实现 /api/images/upload 路由来处理图片上传
};