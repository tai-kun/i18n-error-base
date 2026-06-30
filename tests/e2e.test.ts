import { setGlobalConfig } from "valibot";
import { beforeEach, test } from "vitest";

import { type ErrorOptions, I18nErrorBase, setErrorMessage } from "../src/index.js";

beforeEach(() => {
  globalThis.i18n_error_base__message_map = undefined;
});

/**
 * テスト用の具象エラークラス
 */
class BusinessRuleError extends I18nErrorBase<{ code: string; limit: number }> {
  public constructor(meta: { code: string; limit: number }, options?: ErrorOptions) {
    super(meta, ({ code, limit }) => `Code: ${code}, Limit: ${limit}`, options);
  }
}

test("valibot の言語設定を切り替えたとき、取得されるメッセージも切り替わる", ({ expect }) => {
  // 準備: "ja" と "en" 両方のメッセージを準備する
  setErrorMessage(BusinessRuleError, ({ code, limit }) => `コード: ${code}、制限: ${limit}`, "ja");
  const error = new BusinessRuleError({ code: "ERR", limit: 50 });

  // 実行
  setGlobalConfig({ lang: "ja" });
  const jaMessage = error.message;
  setGlobalConfig({ lang: "en" });
  const enMessage = error.message;

  // 検証
  expect(jaMessage).toBe("コード: ERR、制限: 50");
  expect(enMessage).toBe("Code: ERR, Limit: 50");
});

test("登録されていない言語を要求したとき、コンストラクターのデフォルトメッセージにフォールバックする", ({
  expect,
}) => {
  // 準備: "ja" のみ登録
  setErrorMessage(BusinessRuleError, () => "日本語メッセージ", "ja");
  const error = new BusinessRuleError({ code: "ERR", limit: 50 });

  // 実行
  setGlobalConfig({ lang: "fr" });
  const message = error.message;

  // 検証: "fr" のメッセージは登録されていないので、コンストラクターのデフォルトが返る
  expect(message).toBe("Code: ERR, Limit: 50");
});

test("setErrorMessage で何も登録しなかったとき、コンストラクターのデフォルトメッセージが返る", ({
  expect,
}) => {
  // 準備
  const error = new BusinessRuleError({ code: "ERR", limit: 50 });

  // 実行
  const message = error.message;

  // 検証
  expect(message).toBe("Code: ERR, Limit: 50");
});
