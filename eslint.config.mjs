import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  globalIgnores(['dist']),
  eslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', '*.json', '*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
)
