declare global {
  /**
   * エラーコンストラクターと言語ごとのメッセージマップを保持するグローバルなストレージです。
   */
  var i18n_error_base__message_map: WeakMap<object, Map<string, (meta: any) => string>> | undefined;
}

/**
 * エラーコンストラクターと言語ごとのエラーメッセージ作成関数のマップを取得します。
 *
 * @returns エラーコンストラクターと言語ごとのエラーメッセージ作成関数のマップです。
 */
export default function getMessageMap() {
  return (globalThis.i18n_error_base__message_map ||= new WeakMap());
}
