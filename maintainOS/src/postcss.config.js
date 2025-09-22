module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'media-query-ranges': false, // transpile (width >= 40rem) → (min-width: 40rem)
      },
    },
  },
};