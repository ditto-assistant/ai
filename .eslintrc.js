module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-ditto-assistant-ai`
  extends: ['vercel-ai'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
};
