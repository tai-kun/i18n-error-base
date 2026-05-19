import { getGlobalConfig } from "valibot";

import getMessageMap from "./_get-message-map.js";
import type { I18N_ERROR_BASE_SYMBOL } from "./_i18n-error-base-symbol.types.js";

/**
 * Error クラスのコンストラクターが受け取るオプションの型です。
 */
export type ErrorOptions =
  ConstructorParameters<typeof Error> extends [
    message?: unknown,
    options?: (infer TOptions) | undefined,
  ]
    ? TOptions
    : { readonly cause?: unknown }; // ポリフィルです。

/**
 * エラーのメタデータのオブジェクト型です。
 */
export type ErrorMeta = {
  readonly [prop: string]: unknown;
};

/**
 * I18nErrorBase クラスのコンストラクターに渡すパラメーターのタプル型です。
 *
 * @template TMeta メタデータの型定義です。
 */
export type I18nErrorBaseParams<TMeta extends ErrorMeta | undefined> = [TMeta] extends [undefined]
  ? [message: string | ((meta: TMeta) => string), options?: ErrorOptions | undefined]
  : [meta: TMeta, message: string | ((meta: TMeta) => string), options?: ErrorOptions | undefined];

/**
 * Error クラスを継承するための内部的な基底クラスの型定義です。
 */
export interface _ErrorConstructor extends ErrorConstructor {
  /**
   * I18nErrorBase クラスのインスタンスを識別するシンボルです。
   *
   * このプロパティーは実際には定義されませんが、型定義に含めることにより、`setErrorMessage` 関数に I18nErrorBase を継承しないクラスが入力されることを防ぐ役割をします。
   */
  readonly [I18N_ERROR_BASE_SYMBOL]: never;
}

/**
 * 国際化対応されたエラーメッセージを提供するエラークラスの基底クラスです。
 *
 * @template TMeta エラーに付随するメタデータの型定義です。
 */
export default class I18nErrorBase<
  TMeta extends ErrorMeta | undefined = ErrorMeta | undefined,
> extends (Error as _ErrorConstructor) {
  /**
   * エラーメッセージです。
   *
   * ゲッターであるため、現在の設定言語に基づいて翻訳されたメッセージを取得できます。
   */
  public override message!: string;

  /**
   * エラーに付随するメタデータです。
   */
  public meta: TMeta;

  /**
   * I18nErrorBase クラスの新しいインスタンスを初期化します。
   *
   * @param params コンストラクターに渡されるパラメーターの配列です。最初の引数にメタデータが渡されるかどうかで構成が変化します。
   */
  public constructor(...params: I18nErrorBaseParams<TMeta>) {
    const [meta, message, options] = (
      typeof params[0] === "string" || typeof params[0] === "function"
        ? [undefined, ...params]
        : params
    ) as [
      meta: TMeta,
      message: string | ((meta: TMeta) => string),
      options?: ErrorOptions | undefined,
    ];

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

        return String(newMessage);
      },
      set: (newMessage) => {
        super.message = String(newMessage);
      },
      enumerable: true,
    });
  }
}
