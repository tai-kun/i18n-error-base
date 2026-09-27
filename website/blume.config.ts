import { defineConfig } from "blume";

export default defineConfig({
  content: {
    root: "content",
  },

  title: "i18n-error-base",
  description: "Documentation for i18n-error-base",
  deployment: {
    site: "https://tai-kun.github.io",
    base: "/i18n-error-base",
  },
  navigation: {
    repo: "https://github.com/tai-kun/i18n-error-base",
  },
  // 空のロケールを設定し、それをデフォルト値にしないと、トップレベルのページが無いコンテンツのルーティングができません。
  // 空のロケールの選択肢は theme.css で消しています。
  i18n: {
    locales: [
      {
        code: "ja",
        label: "日本語",
      },
      {
        code: "en",
        label: "English",
      },
      {
        code: " ",
        label: "",
      },
    ],
    defaultLocale: " ",
  },
});
