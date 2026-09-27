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
        code: "ar",
        label: "العربية",
        dir: "rtl",
      },
      {
        code: "bg",
        label: "Български",
      },
      {
        code: "bn",
        label: "বাংলা",
      },
      {
        code: "ca",
        label: "Català",
      },
      {
        code: "cs",
        label: "Čeština",
      },
      {
        code: "da",
        label: "Dansk",
      },
      {
        code: "de",
        label: "Deutsch",
      },
      {
        code: "el",
        label: "Ελληνικά",
      },
      {
        code: "es",
        label: "Español",
      },
      {
        code: "fa",
        label: "فارسی",
        dir: "rtl",
      },
      {
        code: "fi",
        label: "Suomi",
      },
      {
        code: "fr",
        label: "Français",
      },
      {
        code: "he",
        label: "עברית",
        dir: "rtl",
      },
      {
        code: "hi",
        label: "हिन्दी",
      },
      {
        code: "hr",
        label: "Hrvatski",
      },
      {
        code: "hu",
        label: "Magyar",
      },
      {
        code: "id",
        label: "Bahasa Indonesia",
      },
      {
        code: "it",
        label: "Italiano",
      },
      {
        code: "ko",
        label: "한국어",
      },
      {
        code: "nl",
        label: "Nederlands",
      },
      {
        code: "no",
        label: "Norsk",
      },
      {
        code: "pl",
        label: "Polski",
      },
      {
        code: "pt",
        label: "Português",
      },
      {
        code: "pt-br",
        label: "Português (Brasil)",
      },
      {
        code: "ro",
        label: "Română",
      },
      {
        code: "ru",
        label: "Русский",
      },
      {
        code: "sk",
        label: "Slovenčina",
      },
      {
        code: "sr",
        label: "Српски",
      },
      {
        code: "sv",
        label: "Svenska",
      },
      {
        code: "th",
        label: "ไทย",
      },
      {
        code: "tr",
        label: "Türkçe",
      },
      {
        code: "uk",
        label: "Українська",
      },
      {
        code: "vi",
        label: "Tiếng Việt",
      },
      {
        code: "zh",
        label: "简体中文",
      },
      {
        code: "zh-tw",
        label: "繁體中文",
      },
      {
        code: " ",
        label: "",
      },
    ],
    defaultLocale: " ",
  },
});
