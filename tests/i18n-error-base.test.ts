import { test } from "vitest";

import I18nErrorBase from "../src/i18n-error-base.js";

/**
 * テスト用の具象エラークラス
 */
class TestError extends I18nErrorBase<{ code: string; value: number }> {}

test("インスタンス化したとき、渡したメタデータが保持されている", ({ expect }) => {
  // Arrange
  const meta = { code: "ERR_001", value: 100 };

  // Act
  const error = new TestError(meta, "message");

  // Assert
  expect(error.meta).toEqual(meta);
});

test("cause を含むオプションを渡したとき、 cause プロパティに原因が保持される", ({ expect }) => {
  // Arrange
  const cause = new Error("Original Error");
  const options: ErrorOptions = { cause };

  // Act
  const error = new TestError({ code: "ERR", value: 0 }, "message", options);

  // Assert
  expect(error.cause).toBe(cause);
});
