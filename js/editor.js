// Markdown Editor and Image Uploader

var simplemde = null;
var uploadedImages = [];

// 初始化编辑器
function initEditor() {
  const textarea = document.getElementById('postContent');
  if (!textarea) return;

  // 初始化SimpleMDE
  simplemde = new SimpleMDE({
    element: textarea,
    placeholder: '在此撰写文章内容（支持 Markdown 格式）...',
    spellChecker: false,
    toolbar: false,
    status: false,
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true
    },
    insertTexts: [
      ['**', '**'], // 粗体
      ['*', '*'], // 斜体
      ['`', '`'], // 行内代码
      ['\n\n## ', ''], // 标题
      ['\n\n> ', ''], // 引用
      ['\n\n- ', ''], // 无序列表
      ['\n\n1. ', ''], // 有序列表
      ['\n\n```\n', '\n```'], // 代码块
    ]
  });

  // 自定义工具栏
  setupCustomToolbar();

  // 图片上传
  setupImageUpload();

  // 预览功能
  setupPreview();
}

// 设置自定义工具栏
function setupCustomToolbar() {
  const toolbar = document.getElementById('editorToolbar');
  if (!toolbar) return;

  toolbar.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.command) {
      e.preventDefault();
      const command = e.target.dataset.command;

      switch(command) {
        case 'bold':
          insertMarkdownText('**', '**');
          break;
        case 'italic':
          insertMarkdownText('*', '*');
          break;
        case 'heading-smaller':
          insertMarkdownText('\n\n## ', '');
          break;
        case 'quote':
          insertMarkdownText('\n\n> ', '');
          break;
        case 'unordered-list':
          insertMarkdownText('\n\n- ', '');
          break;
        case 'ordered-list':
          insertMarkdownText('\n\n1. ', '');
          break;
        case 'code':
          insertMarkdownText('\n\n```\n', '\n```');
          break;
        case 'image':
          document.getElementById('imageInput').click();
          break;
        case 'preview':
          togglePreview();
          break;
      }
    }
  });
}

// 插入Markdown文本
function insertMarkdownText(before, after) {
  const cm = simplemde.codemirror;
  const doc = cm.getDoc();
  const cursor = doc.getCursor();
  const text = doc.getSelection() || '';

  const insertText = before + text + after;
  doc.replaceRange(insertText, cursor);

  // 移动光标到合适位置
  if (text) {
    doc.setCursor({
      line: cursor.line,
      ch: cursor.ch + before.length
    });
  }
}

// 设置图片上传
function setupImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');

  if (!uploadArea || !imageInput) return;

  // 点击上传
  uploadArea.addEventListener('click', function(e) {
    if (e.target === uploadArea || e.target.tagName === 'P') {
      imageInput.click();
    }
  });

  // 文件选择
  imageInput.addEventListener('change', function(e) {
    handleImageUpload(e.target.files);
  });

  // 拖拽上传
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleImageUpload(e.dataTransfer.files);
  });

  // 移除图片
  imagePreview.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
      const imageItem = e.target.closest('.image-item');
      if (imageItem) {
        const filename = imageItem.dataset.filename;
        uploadedImages = uploadedImages.filter(img => img.filename !== filename);
        imageItem.remove();
      }
    }
  });
}

// 处理图片上传
async function handleImageUpload(files) {
  if (!files.length) return;

  const uploadArea = document.getElementById('imageUploadArea');
  const imagePreview = document.getElementById('imagePreview');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      const result = await ImageUploader.uploadImage(file);
      uploadedImages.push(result);

      // 显示预览
      const imageItem = document.createElement('div');
      imageItem.className = 'image-item';
      imageItem.dataset.filename = result.filename;

      const img = document.createElement('img');
      img.src = ImageUploader.getImageUrl(result.filename);
      img.alt = result.filename;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '×';

      imageItem.appendChild(img);
      imageItem.appendChild(removeBtn);
      imagePreview.appendChild(imageItem);

      // 插入到编辑器
      insertMarkdownText(`![${file.name}](${ImageUploader.getImageUrl(result.filename)})`, '');
    } catch (error) {
      alert('图片上传失败：' + error.message);
    }
  }
}

// 切换预览
function togglePreview() {
  const previewBtn = document.getElementById('previewBtn');
  const container = document.querySelector('.editor-container');

  if (container.querySelector('.markdown-preview')) {
    // 关闭预览
    const preview = container.querySelector('.markdown-preview');
    preview.remove();
    previewBtn.classList.remove('active');
    simplemde.codemirror.style.display = 'block';
  } else {
    // 显示预览
    const preview = document.createElement('div');
    preview.className = 'markdown-preview';

    const content = simplemde.value();
    const html = MarkdownRenderer.render(content);
    preview.innerHTML = html;

    container.appendChild(preview);
    previewBtn.classList.add('active');
    simplemde.codemirror.style.display = 'none';

    // 滚动到预览区域
    preview.scrollIntoView({ behavior: 'smooth' });
  }
}

// 设置预览按钮状态
function setupPreview() {
  const previewBtn = document.getElementById('previewBtn');
  if (previewBtn && simplemde) {
    previewBtn.addEventListener('click', togglePreview);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initEditor();

  // 如果正在编辑文章，加载现有内容
  const editId = document.getElementById('editId')?.value;
  if (editId) {
    // 编辑模式
    setTimeout(() => {
      const cm = simplemde.codemirror;
      cm.focus();
      cm.setCursor({ line: 0, ch: 0 });
    }, 100);
  }
});

// 监听表单提交
document.addEventListener('DOMContentLoaded', function() {
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', function(e) {
      // 获取Markdown内容并转换为HTML
      const content = simplemde ? simplemde.value() : document.getElementById('postContent').value;
      document.getElementById('postContent').value = content;
    });
  }
});