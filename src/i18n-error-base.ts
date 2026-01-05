/**
 * エラーのオプションです。
 */
export type ErrorOptions = Readonly<{
  /**
   * エラーの原因です。
   */
  cause?: unknown;
}>;

/**
 * エラーに紐づくメタデータです。
 */
export type ErrorMeta = {
  readonly [prop: string]: unknown;
};

/**
 * 国際化対応されたエラーの基底クラスです。
 *
 * @template TMeta エラーに紐づくメタデータの型です。
 */
export default class I18nErrorBase<TMeta extends ErrorMeta | undefined = undefined> extends Error {
  /**
   * エラーのメタデータです。
   */
  public meta: TMeta;

  /**
   * インスタンスを初期化します。
   *
   * @param options エラーのオプションパラメーターです。
   * @param meta エラーに関連付けるメタデータです。
   */
  public constructor(options: ErrorOptions | undefined, meta: TMeta) {
    super("", options);

    // ポリフィルです。
    if (!("cause" in this) && options && "cause" in options) {
      this.cause = options.cause;
    }

    this.meta = meta;
  }
}
