import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __dirname = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'src/app/(payload)/**', 'src/payload-types.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // A leading underscore marks a value that is deliberately unused (e.g. removed from an object with a rest spread).
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
]

export default eslintConfig
