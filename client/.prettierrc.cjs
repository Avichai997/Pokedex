module.exports = {
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  jsxSingleQuote: true,
  bracketSpacing: true,
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindFunctions: ['clsx', 'cn', 'twMerge', 'cva', 'twJoin'],
};




