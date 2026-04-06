module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    'prefer-const': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'jsx-a11y/alt-text': 'off',
    '@next/next/no-img-element': 'off'
  }
}