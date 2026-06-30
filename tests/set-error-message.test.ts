import { test, beforeEach } from "vitest";

import I18nErrorBase from "../src/i18n-error-base.js";
import setErrorMessage from "../src/set-error-message.js";

beforeEach(() => {
  globalThis.i18n_error_base__message_map = undefined;
});

/**
 * テスト用の具象エラークラス
 */
class TestError extends I18nErrorBase<{ code: string; value: number }> {}

test("特定の言語でメッセージ作成関数を登録したとき、登録した関数が正しく保持される", ({
  expect,
}) => {
  // 準備
  const lang = "ja";
  const messageFunc = (meta: TestError["meta"]) => `エラーコード: ${meta.code}`;

  // 実行
  setErrorMessage(TestError, messageFunc, lang);

  // 検証
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map).toBeDefined();
  expect(map!.get(lang)).toBe(messageFunc);
});

test("同じエラー型に対して複数の言語を登録したとき、それぞれの言語設定が保持される", ({
  expect,
}) => {
  // 準備
  const jaFunc = () => "エラー";
  const enFunc = () => "Error";

  // 実行
  setErrorMessage(TestError, jaFunc, "ja");
  setErrorMessage(TestError, enFunc, "en");

  // 検証
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map!.size).toBe(2);
  expect(map!.get("ja")).toBe(jaFunc);
  expect(map!.get("en")).toBe(enFunc);
});

test("複数の言語でメッセージを登録できる", ({ expect }) => {
  // 準備
  const lang1 = "ja";
  const lang2 = "ko";
  const lang3 = "zh";
  const messageFunc = (meta: TestError["meta"]) => `エラーコード: ${meta.code}`;

  // 実行
  setErrorMessage(TestError, messageFunc, [lang1, lang2, lang3]);

  // 検証
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map).toBeDefined();
  expect(map!.get(lang1)).toBe(messageFunc);
  expect(map!.get(lang2)).toBe(messageFunc);
  expect(map!.get(lang3)).toBe(messageFunc);
});

test("文字列のメッセージを登録したとき、関数に変換されて保持される", ({ expect }) => {
  // 準備
  const text = "something went wrong";

  // 実行
  setErrorMessage(TestError, text, "en");

  // 検証
  const messageMap = globalThis.i18n_error_base__message_map;
  const stored = messageMap!.get(TestError)!.get("en")!;
  expect(typeof stored).toBe("function");
  expect(stored({ code: "X", value: 1 })).toBe(text);
});
