import getMessageMap from "./_get-message-map.js";
import type { I18N_ERROR_BASE_SYMBOL } from "./_i18n-error-base-symbol.types.js";
import type { default as I18nErrorBase } from "./i18n-error-base.js";

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbaseconstructor)
 */
export interface I18nErrorBaseConstructor {
  /**
   * @internal
   */
  readonly [I18N_ERROR_BASE_SYMBOL]: never;

  new (...args: any): I18nErrorBase;
}

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#seterrormessage)
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
