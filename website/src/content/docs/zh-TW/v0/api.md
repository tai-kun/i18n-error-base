---
title: API 參考
description: i18n-error-base 提供的類別、函式和型別的參考文件。
---

## I18nErrorBase {#i18nerrorbase}

一個繼承自 `Error` 的基底類別。所有國際化的錯誤類別都應繼承此類別。

### 型別參數 {#i18nerrorbase-templates}

| 參數    | 預設值                    | 描述                                                                                            |
| ------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `TMeta` | `ErrorMeta \| undefined`  | 與錯誤關聯的中繼資料型別。指定一個繼承自 `{ readonly [prop: string]: unknown }` 的物件型別。  |

### 建構函式 {#i18nerrorbase-constructor}

基底類別建構函式具有以下簽章。通常，子類別定義自己的建構函式並在內部呼叫 `super`。

#### 當 `TMeta` 不為 `undefined` 時 {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| 參數      | 類型                              | 描述                                                                                          |
| --------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `meta`    | `TMeta`                           | 與錯誤關聯的中繼資料。                                                                        |
| `message` | `string \| MessageFactory<TMeta>` | 錯誤訊息，或一個接收中繼資料並產生訊息的函式。                                                |
| `options` | `ErrorOptions` (可選)             | 傳遞給 `Error` 建構函式的選項。用於指定 `cause`。                                             |

#### 當 `TMeta` 為 `undefined` 時 {#i18nerrorbase-tmeta-undefined}

對於不需要中繼資料的錯誤類別，訊息可以直接作為建構函式的第一個引數傳遞。

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| 參數      | 類型                              | 描述                                                                                          |
| --------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `message` | `string \| MessageFactory<TMeta>` | 錯誤訊息，或一個接收中繼資料並產生訊息的函式。                                                |
| `options` | `ErrorOptions` (可選)             | 傳遞給 `Error` 建構函式的選項。用於指定 `cause`。                                             |

### 屬性 {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

儲存傳遞到建構函式的中繼資料。當 `TMeta` 為 `undefined` 時，此值為 `undefined`。

#### `error.message: string` {#i18nerrorbase-message}

一個動態 getter，根據目前語言設定返回錯誤訊息。此屬性是可列舉的。

#### `error.cause: unknown` {#i18nerrorbase-cause}

當在建構函式選項中傳遞了 `cause` 時，它儲存在 `error.cause` 中。即使 JavaScript 執行環境本身不支援 `cause`，此屬性也會被 polyfill。

### 靜態屬性

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

一個新增到訊息開頭的前綴。在子類別中覆寫此屬性以使用它。

```ts
type ApiErrorMeta = {
  readonly status: number;
};

class ApiError extends I18nErrorBase<{ status: number }> {
  static {
    this.prefix = "[API Error] ";
  }

  public constructor(args: ApiErrorMeta & ErrorOptions) {
    const { status, ...options } = args;
    const meta = { status };
    super(meta, ({ status }) => `Request failed with status ${status}`, options);
  }
}

const error = new ApiError({ status: 404 });
console.log(error.message); // => "[API Error] Request failed with status 404"
```

當 `prefix` 與特定於地區設定的訊息一起使用時，前綴會新增到翻譯後的訊息或回退訊息之前。

```ts
type PrefixedErrorMeta = {
  readonly code: string;
};

class PrefixedError extends I18nErrorBase<PrefixedErrorMeta> {
  static {
    this.prefix = "[ERROR] ";
  }

  public constructor(args: PrefixedErrorMeta & ErrorOptions) {
    const { code, ...options } = args;
    const meta = { code };
    super(meta, ({ code }) => `code is ${code}`, options);
  }
}

setErrorMessage(PrefixedError, ({ code }) => `コードは ${code} です`, "ja");

const error = new PrefixedError({ code: "ERR" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "[ERROR] コードは ERR です"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "[ERROR] code is ERR"
```

## setErrorMessage {#seterrormessage}

為特定的錯誤類別註冊一個特定於地區設定的訊息。

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| 參數        | 型別                            | 描述                                                                                                                                                           |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | 要註冊訊息的錯誤類別的建構函式。只能指定繼承自 `I18nErrorBase` 的類別。                                                                                        |
| `message`   | `string \| ((meta) => string)`  | 錯誤訊息，或一個接收中繼資料並產生訊息的函式。如果傳入字串，則會自動轉換為返回該字串的函式。                                                                  |
| `lang`      | `string \| Iterable<string>`    | 語言代碼。可以是單一字串，也可以是陣列等可迭代物件，用於同時註冊多種語言。                                                                                     |

對已註冊的語言再次呼叫將覆寫現有訊息。

```ts
// 註冊單一語言
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// 同時註冊多種語言
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// 使用字串註冊
setErrorMessage(ValidationError, "something went wrong", "en");
```

## 型別 {#types}

### ErrorMeta {#errormeta}

中繼資料的型別定義。具有唯讀的索引簽章。

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

產生錯誤訊息的工廠函式的型別。

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` 建構函式選項的型別。具有 `cause` 屬性。

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

傳遞給建構函式的參數元組型別。其結構根據 `TMeta` 是否為 `undefined` 而變化。

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

可作為 `setErrorMessage` 第一個引數指定的建構函式型別。傳遞一個不繼承自 `I18nErrorBase` 的類別會導致型別錯誤。
