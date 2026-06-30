import { setGlobalConfig } from "valibot";
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

test("インスタンス化したとき、渡したメタデータが保持されている", ({ expect }) => {
  // 準備
  const meta = { code: "ERR_001", value: 100 };

  // 実行
  const error = new TestError(meta, "message");

  // 検証
  expect(error.meta).toStrictEqual(meta);
});

test("cause を含むオプションを渡したとき、 cause プロパティに原因が保持される", ({ expect }) => {
  // 準備
  const cause = new Error("Original Error");
  const options: ErrorOptions = { cause };

  // 実行
  const error = new TestError({ code: "ERR", value: 0 }, "message", options);

  // 検証
  expect(error.cause).toBe(cause);
});

test("message プロパティにアクセスしたとき、コンストラクターに渡した文字列が取得できる", ({
  expect,
}) => {
  // 準備
  const error = new TestError({ code: "ERR", value: 0 }, "an error occurred");

  // 実行
  const { message } = error;

  // 検証
  expect(message).toBe("an error occurred");
});

test("message を関数で渡したとき、 meta がその関数に渡される", ({ expect }) => {
  // 準備
  const meta = { code: "ERR_001", value: 42 };
  const error = new TestError(meta, (m) => `[${m.code}] value is ${m.value}`);

  // 実行
  const { message } = error;

  // 検証
  expect(message).toBe("[ERR_001] value is 42");
});

test("Error および I18nErrorBase のインスタンスである", ({ expect }) => {
  // 準備
  const error = new TestError({ code: "ERR", value: 0 }, "message");

  // 実行と検証
  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(I18nErrorBase);
  expect(error).toBeInstanceOf(TestError);
});

test("prefix が設定されていないとき、メッセージに接頭辞が付かない", ({ expect }) => {
  // 準備
  const error = new TestError({ code: "ERR", value: 0 }, "something went wrong");

  // 実行
  const { message } = error;

  // 検証
  expect(message).toBe("something went wrong");
});

test("prefix が設定されているとき、メッセージの先頭に接頭辞が付く", ({ expect }) => {
  // 準備
  class PrefixedError extends I18nErrorBase<{ code: string }> {
    static override prefix = "[PrefixedError] ";
  }
  const error = new PrefixedError({ code: "ERR" }, "something went wrong");

  // 実行
  const { message } = error;

  // 検証
  expect(message).toBe("[PrefixedError] something went wrong");
});

test("prefix と setErrorMessage の両方が設定されているとき、 prefix が先頭に付く", ({ expect }) => {
  // 準備
  class PrefixedError extends I18nErrorBase<{ code: string }> {
    static override prefix = "[ERROR] ";
  }
  setErrorMessage(PrefixedError, ({ code }) => `code is ${code}`, "ja");
  const error = new PrefixedError({ code: "ERR" }, "fallback");

  // 実行
  setGlobalConfig({ lang: "ja" });
  const jaMessage = error.message;
  setGlobalConfig({ lang: "en" });
  const enMessage = error.message;

  // 検証
  expect(jaMessage).toBe("[ERROR] code is ERR");
  expect(enMessage).toBe("[ERROR] fallback");
});
