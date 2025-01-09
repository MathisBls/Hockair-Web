import babelParser from '@babel/eslint-parser';
import pluginJs from '@eslint/js';
import cssModulesPlugin from 'eslint-plugin-css-modules';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Règles JavaScript recommandées
  pluginJs.configs.recommended,

  // Règles React recommandées
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [['@babel/preset-react', { runtime: 'automatic' }]],
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      prettier: pluginPrettier,
      react: pluginReact,
      import: pluginImport,
      'css-modules': cssModulesPlugin,
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'prettier/prettier': 'error', // Préférence pour Prettier
      'react/react-in-jsx-scope': 'off', // Plus nécessaire avec React 17+
      'no-unused-vars': 'warn', // Avertissements pour variables inutilisées
      'react/prop-types': 'off', // Désactivation des PropTypes
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['object', 'position', 'intensity', 'angle', 'penumbra'], // Propriétés spécifiques
        },
      ],
      'css-modules/no-unused-class': 'warn', // Avertit sur les classes CSS inutilisées
      'css-modules/no-undef-class': 'error', // Erreur pour les classes non définies
    },
    settings: {
      react: {
        version: 'detect', // Détection automatique de la version React
      },
    },
  },
];
