/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{ts,js,json,mjs}': ['prettier --write', 'eslint'],
  '*.md': ['prettier --write'],
}
