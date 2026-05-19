import { getGlobalConfig } from "valibot";

import getMessageMap from "./_get-message-map.js";

export type ErrorOptions =
  ConstructorParameters<typeof Error> extends [
    message?: unknown,
    options?: (infer TOptions) | undefined,
  ]
    ? TOptions
    : { readonly cause?: unknown };

export type ErrorMeta = {
  readonly [prop: string]: unknown;
};

export type I18nErrorBaseParams<TMeta extends ErrorMeta | undefined> = [TMeta] extends [undefined]
  ? [message: string | ((meta: TMeta) => string), options?: ErrorOptions | undefined]
  : [meta: TMeta, message: string | ((meta: TMeta) => string), options?: ErrorOptions | undefined];

export default class I18nErrorBase<
  TMeta extends ErrorMeta | undefined = ErrorMeta | undefined,
> extends Error {
  public override get message(): string {
    const { lang = "en" } = getGlobalConfig();
    return getMessageMap().get(this.constructor)?.get(lang)?.(this.meta) ?? super.message;
  }

  public override set message(message: string) {
    super.message = message;
  }

  public meta: TMeta;

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

    super("", options);

    // ポリフィルです。
    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }

    this.meta = meta;

    const defaultMessage = typeof message === "function" ? message(meta) : message;
    Object.defineProperty(this, "message", {
      get: () => {
        const { lang = "en" } = getGlobalConfig();
        return getMessageMap().get(this.constructor)?.get(lang)?.(this.meta) ?? defaultMessage;
      },
      set: (newMessage) => {
        super.message = String(newMessage);
      },
      enumerable: true,
    });
  }
}
