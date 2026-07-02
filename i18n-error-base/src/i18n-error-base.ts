import { getGlobalConfig } from "valibot";

import getMessageMap from "./_get-message-map.js";
import type { I18N_ERROR_BASE_SYMBOL } from "./_i18n-error-base-symbol.types.js";

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#erroroptions)
 */
export type ErrorOptions =
  ConstructorParameters<typeof Error> extends [
    message?: unknown,
    options?: (infer TOptions) | undefined,
  ]
    ? TOptions
    : { readonly cause?: unknown }; // ポリフィルです。

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#errormeta)
 */
export type ErrorMeta = {
  readonly [prop: string]: unknown;
};

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#messagefactory)
 */
export interface MessageFactory<TMeta extends ErrorMeta | undefined = ErrorMeta | undefined> {
  (meta: TMeta): string;
}

/**
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbaseparams)
 */
export type I18nErrorBaseParams<TMeta extends ErrorMeta | undefined = ErrorMeta | undefined> = [
  TMeta,
] extends [undefined]
  ?
      | [message: string | MessageFactory<TMeta>, options?: ErrorOptions | undefined]
      | [
          meta: undefined,
          message: string | MessageFactory<TMeta>,
          options?: ErrorOptions | undefined,
        ]
  : [meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions | undefined];

/**
 * Error クラスを継承するための内部的な基底クラスの型定義です。
 */
interface _ErrorConstructor extends ErrorConstructor {
  // I18nErrorBase クラスのインスタンスを識別するシンボルです。
  // このプロパティーは実際には定義されませんが、型定義に含めることにより、`setErrorMessage` 関数に I18nErrorBase を継承しないクラスが入力されることを防ぐ役割をします。
  /**
   * @internal
   */
  readonly [I18N_ERROR_BASE_SYMBOL]: never;
}

/**
 * [Document](https://tai-kun.github.io/i18n-error-base/)
 *
 * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbase)
 */
export default class I18nErrorBase<
  TMeta extends ErrorMeta | undefined = ErrorMeta | undefined,
> extends (Error as _ErrorConstructor) {
  /**
   * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbase-static-prefix)
   */
  static prefix?: string;

  /**
   * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbase-message)
   */
  public override readonly message!: string;

  /**
   * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbase-meta)
   */
  public meta: TMeta;

  /**
   * [API Reference](https://tai-kun.github.io/i18n-error-base/api/#i18nerrorbase-constructor)
   */
  public constructor(...params: I18nErrorBaseParams<TMeta>) {
    const [meta, message, options] = (
      typeof params[0] === "string" || typeof params[0] === "function"
        ? [undefined, ...params]
        : params
    ) as [meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions | undefined];

    // メッセージは Object.defineProperty にて再定義するため、ここでは空文字を渡します。
    super("", options);

    // 古い JavaScript 環境で cause プロパティーがサポートされていない場合のポリフィル処理です。
    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }

    this.meta = meta;

    // message プロパティーを動的に定義します。これにより、 message へのアクセス時に動的に翻訳ロジックが実行されます。
    let defaultMessage: string | undefined;
    Object.defineProperty(this, "message", {
      get: () => {
        // グローバルな設定から言語を取得します。デフォルトは英語です。
        const { lang = "en" } = getGlobalConfig();
        // 言語とクラスの種類に応じたメッセージマップを探索し、翻訳メッセージがあればそれを返します。デフォルトはコンストラクター作成時に設定されたメッセージです。
        const newMessage =
          getMessageMap().get(this.constructor)?.get(lang)?.(this.meta) ??
          (defaultMessage ??= typeof message === "function" ? message(meta) : message);

        const prefix = (this.constructor as typeof I18nErrorBase).prefix;

        return prefix ? `${prefix}${String(newMessage)}` : String(newMessage);
      },
      enumerable: true,
    });
  }
}
