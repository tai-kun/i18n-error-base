import getMessageMap from "./_get-message-map.js";
import type { I18N_ERROR_BASE_SYMBOL } from "./_i18n-error-base-symbol.types.js";
import type { default as I18nErrorBase, ErrorMeta } from "./i18n-error-base.js";

/**
 * エラーのコンストラクターです。
 */
export interface I18nErrorBaseConstructor {
  readonly [I18N_ERROR_BASE_SYMBOL]: never;
  new (...args: any): I18nErrorBase<ErrorMeta | undefined>;
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
 *   meta => `${meta.expected} を期待しましたが、${meta.actual} を得ました`,
 *   "ja",
 * );
 * ```
 */
export default function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void {
  const map = getMessageMap();
  let store = map.get(reference);
  if (store === undefined) {
    store = new Map();
    map.set(reference, store);
  }

  if (typeof message !== "function") {
    const text = message;
    message = () => text;
  }

  if (typeof lang === "string") {
    store.set(lang, message);
  } else {
    for (const item of lang) {
      store.set(item, message);
    }
  }
}
