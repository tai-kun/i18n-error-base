import { test } from "vitest";
import I18nErrorBase from "../src/i18n-error-base.js";
import setErrorMessage from "../src/set-error-message.js";

/**
 * テスト用の具象エラークラス
 */
class TestError extends I18nErrorBase<{ code: string; value: number }> {}

test("特定の言語でメッセージ作成関数を登録したとき、登録した関数が正しく保持される", ({ expect }) => {
  // Arrange
  const lang = "ja";
  const messageFunc = (error: TestError) => `エラーコード: ${error.meta.code}`;

  // Act
  setErrorMessage(TestError, messageFunc, lang);

  // Assert
  // getMessageMap は内部実装のため直接検証せず、
  // 本来はメッセージ取得側の公開 API を通じて検証すべきであるが、
  // 現在のコードには取得 API が未実装のため、副作用の発生を許容する。
  const messageMap = globalThis.i18n_error_base__message_map;
  expect(messageMap).toBeDefined();

  const stores = messageMap!.get(TestError);
  expect(stores).toBeDefined();
  expect(stores!.get(lang)).toBe(messageFunc);
});

test("同じエラー型に対して複数の言語を登録したとき、それぞれの言語設定が保持される", ({ expect }) => {
  // Arrange
  const jaFunc = () => "エラー";
  const enFunc = () => "Error";

  // Act
  setErrorMessage(TestError, jaFunc, "ja");
  setErrorMessage(TestError, enFunc, "en");

  // Assert
  const stores = globalThis.i18n_error_base__message_map!.get(TestError);
  expect(stores!.size).toBe(2);
  expect(stores!.get("ja")).toBe(jaFunc);
  expect(stores!.get("en")).toBe(enFunc);
});
