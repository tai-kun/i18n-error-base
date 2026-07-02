// @ts-check

import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { remarkHeadingId } from "remark-custom-heading-id";

import "./.settings";

// https://astro.build/config
export default defineConfig({
  site: "https://tai-kun.github.io",
  base: "/" + __REPOSITORY_NAME,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkHeadingId],
    }),
  },
  integrations: [
    starlight({
      title: __PAGE_TITLE,
      defaultLocale: "ja",
      locales: {
        ja: {
          label: "日本語",
        },
        en: {
          label: "English",
        },
        "zh-CN": {
          label: "简体中文",
        },
        "zh-TW": {
          label: "繁體中文",
        },
        ko: {
          label: "한국어",
        },
        es: {
          label: "Español",
        },
        de: {
          label: "Deutsch",
        },
        fr: {
          label: "Français",
        },
        it: {
          label: "Italiano",
        },
        ru: {
          label: "Русский",
        },
        hi: {
          label: "हिन्दी",
        },
        da: {
          label: "Dansk",
        },
        uk: {
          label: "Українська",
        },
        tr: {
          label: "Türkçe",
        },
        fa: {
          label: "فارسی",
        },
        pt: {
          label: "Português",
        },
        id: {
          label: "Bahasa Indonesia",
        },
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/tai-kun/" + __REPOSITORY_NAME,
        },
      ],
      sidebar: [
        {
          label: "はじめに",
          translations: {
            en: "Getting Started",
            "zh-CN": "开始",
            "zh-TW": "開始",
            ko: "시작하기",
            es: "Comenzando",
            de: "Erste Schritte",
            fr: "Pour commencer",
            it: "Per iniziare",
            ru: "Начало работы",
            hi: "आरंभ करना",
            da: "Kom godt i gang",
            uk: "Початок роботи",
            tr: "Başlarken",
            fa: "شروع کار",
            pt: "Começando",
            id: "Memulai",
          },
          items: [
            {
              label: "概要",
              translations: {
                en: "Overview",
                "zh-CN": "概述",
                "zh-TW": "概述",
                ko: "개요",
                es: "Resumen",
                de: "Übersicht",
                fr: "Aperçu",
                it: "Panoramica",
                ru: "Обзор",
                hi: "अवलोकन",
                da: "Oversigt",
                uk: "Огляд",
                tr: "Genel Bakış",
                fa: "نمای کلی",
                pt: "Visão geral",
                id: "Gambaran umum",
              },
              slug: `v${__LATEST_MAJOR_VERSION_NUMBER}`,
            },
          ],
        },
        {
          label: "リファレンス",
          translations: {
            en: "Reference",
            "zh-CN": "参考",
            "zh-TW": "參考",
            ko: "참조",
            es: "Referencia",
            de: "Referenz",
            fr: "Référence",
            it: "Riferimento",
            ru: "Справочник",
            hi: "संदर्भ",
            da: "Reference",
            uk: "Довідник",
            tr: "Başvuru",
            fa: "مرجع",
            pt: "Referência",
            id: "Referensi",
          },
          items: [
            {
              label: "API",
              slug: `v${__LATEST_MAJOR_VERSION_NUMBER}/api`,
            },
          ],
        },
      ],
    }),
  ],
});
