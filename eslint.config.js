const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        location: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        hljs: 'readonly',
        SimpleMDE: 'readonly',
        marked: 'readonly',
        simplemde: 'readonly',
        API: 'readonly',
        MarkdownRenderer: 'readonly',
        ImageUploader: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-console': 'off',
      'no-undef': 'error',
      'semi': ['warn', 'always'],
      'eqeqeq': ['warn', 'always'],
      'no-empty': 'warn',
      'no-var': 'off'
    }
  },
  {
    ignores: ['node_modules/**', 'uploads/**']
  }
];
