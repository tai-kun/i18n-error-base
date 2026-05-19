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
  // Arrange
  const lang = "ja";
  const messageFunc = (meta: TestError["meta"]) => `エラーコード: ${meta.code}`;

  // Act
  setErrorMessage(TestError, messageFunc, lang);

  // Assert
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map).toBeDefined();
  expect(map!.get(lang)).toBe(messageFunc);
});

test("同じエラー型に対して複数の言語を登録したとき、それぞれの言語設定が保持される", ({
  expect,
}) => {
  // Arrange
  const jaFunc = () => "エラー";
  const enFunc = () => "Error";

  // Act
  setErrorMessage(TestError, jaFunc, "ja");
  setErrorMessage(TestError, enFunc, "en");

  // Assert
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map!.size).toBe(2);
  expect(map!.get("ja")).toBe(jaFunc);
  expect(map!.get("en")).toBe(enFunc);
});

test("複数の言語でメッセージを登録できる", ({ expect }) => {
  // Arrange
  const lang1 = "ja";
  const lang2 = "jp";
  const lang3 = "jpn";
  const messageFunc = (meta: TestError["meta"]) => `エラーコード: ${meta.code}`;

  // Act
  setErrorMessage(TestError, messageFunc, [lang1, lang2, lang3]);

  // Assert
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const map = messageMap!.get(TestError);
  expect(map).toBeDefined();
  expect(map!.get(lang1)).toBe(messageFunc);
  expect(map!.get(lang2)).toBe(messageFunc);
  expect(map!.get(lang3)).toBe(messageFunc);
});
