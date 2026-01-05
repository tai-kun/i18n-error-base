import { getGlobalConfig } from "valibot";
import getMessageMap from "./_get-message-map.js";

/**
 * エラーコンストラクター内でメッセージプロパティーを初期化します。
 *
 * @template TInstance エラーオブジェクトの型です。
 * @param instance エラーオブジェクトです。
 * @param message エラーメッセージです。
 */
export default function initErrorMessage<TInstance extends Error>(
  instance: TInstance,
  message: (error: TInstance) => string,
): void {
  const reference = instance.constructor;
  const { lang = "en" } = getGlobalConfig();
  const msg = getMessageMap();
  const store = msg.get(reference);
  const genMessage = store?.get(lang) ?? message;
  instance.message = genMessage(instance);
}
