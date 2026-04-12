import { setGlobalConfig } from "valibot";
import { test } from "vitest";
import { type ErrorOptions, I18nErrorBase, setErrorMessage } from "../src/index.js";

/**
 * テスト用の具象エラークラス
 */
class BusinessRuleError extends I18nErrorBase<{ code: string; limit: number }> {
  public constructor(options: ErrorOptions | undefined, meta: { code: string; limit: number }) {
    super(meta, ({ code, limit }) => `Code: ${code}, Limit: ${limit}`, options);
  }
}

test("valibot の言語設定を切り替えたとき、取得されるメッセージも切り替わる", ({ expect }) => {
  // Arrange: "ja" と "en" 両方のメッセージを準備する
  setErrorMessage(BusinessRuleError, ({ code, limit }) => `コード: ${code}、制限: ${limit}`, "ja");
  const error = new BusinessRuleError(undefined, { code: "ERR", limit: 50 });

  // Act
  setGlobalConfig({ lang: "ja" });
  const jaMessage = error.message;
  setGlobalConfig({ lang: "en" });
  const enMessage = error.message;

  // Assert
  expect(jaMessage).toBe("コード: ERR、制限: 50");
  expect(enMessage).toBe("Code: ERR, Limit: 50");
});
