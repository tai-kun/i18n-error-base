import { setGlobalConfig } from "valibot";
import { test } from "vitest";
import {
  type ErrorOptions,
  I18nErrorBase,
  initErrorMessage,
  setErrorMessage,
} from "../src/index.js";

/**
 * テスト用の具象エラークラス
 */
class BusinessRuleError extends I18nErrorBase<{ code: string; limit: number }> {
  public constructor(options: ErrorOptions | undefined, meta: { code: string; limit: number }) {
    super(options, meta);
    initErrorMessage(this, ({ meta }) => `Limit: ${meta.limit}`);
  }
}

test("valibot のグローバル設定から取得した言語を用いて、適切なエラーメッセージが生成される", ({ expect }) => {
  // Arrange: valibot の言語設定を "ja" にし、対応するメッセージを登録する
  setGlobalConfig({ lang: "ja" });
  const meta = { code: "LIMIT_EXCEEDED", limit: 100 };

  setErrorMessage(
    BusinessRuleError,
    ({ meta }) => `エラー: ${meta.code} (上限: ${meta.limit})`,
    "ja",
  );

  // Act: 設定された言語を動的に参照してメッセージを取得する
  const error = new BusinessRuleError(undefined, meta);

  // Assert
  expect(error.message).toBe("エラー: LIMIT_EXCEEDED (上限: 100)");
});

test("valibot の言語設定を切り替えたとき、取得されるメッセージも切り替わる", ({ expect }) => {
  // Arrange: "ja" と "en" 両方のメッセージを準備する
  setErrorMessage(BusinessRuleError, ({ meta }) => `制限超え: ${meta.limit}`, "ja");

  // Act & Assert (ja)
  setGlobalConfig({ lang: "ja" });
  expect(new BusinessRuleError(undefined, { code: "ERR", limit: 50 }).message)
    .toBe("制限超え: 50");

  // Act & Assert (en)
  setGlobalConfig({ lang: "en" });
  expect(new BusinessRuleError(undefined, { code: "ERR", limit: 50 }).message)
    .toBe("Limit: 50");
});
