// Papildo app.json. EXPO_BASE_URL nustatomas tik kuriant svetainę GitHub Pages
// (pvz. „/emsi-app“), todėl vietinis `npx expo start` jo neturi.
module.exports = ({ config }) => ({
  ...config,
  web: { ...config.web, output: 'single' },
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
