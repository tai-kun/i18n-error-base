import getMessageMap from "./_get-message-map.js";
import type { default as I18nErrorBase, ErrorMeta } from "./i18n-error-base.js";

/**
 * エラーのコンストラクターです。
 */
export interface I18nErrorBaseConstructor {
  new(...args: any): I18nErrorBase<ErrorMeta | undefined>;
}

/**
 * エラーに特定の言語でエラーメッセージを設定します。
 *
 * @template TReference エラーコンストラクターの型です。
 * @param reference エラーコンストラクターです。
 * @param message エラーメッセージです。
 * @param lang 言語です。
 * @example
 * ```ts
 * setErrorMessage(
 *   TypeError,
 *   ({ meta }) => `${meta.expected} を期待しましたが、${meta.actual} を得ました`,
 *   "ja",
 * );
 * ```
 */
export default function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: (error: InstanceType<TReference>) => string,
  lang: string,
): void {
  const msg = getMessageMap();
  let store = msg.get(reference);
  if (store === undefined) {
    store = new Map();
    msg.set(reference, store);
  }

  store.set(lang, message);
}
