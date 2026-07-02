---
title: 概述
description: i18n-error-base 是一個基礎錯誤類別，與 Valibot 的全域語言設定整合，可根據地區設定動態切換錯誤訊息。
---

i18n-error-base 是一個基礎錯誤類別，與 Valibot 的全域語言設定整合，可根據地區設定動態切換錯誤訊息。

## 安裝 {#install}

```sh
pnpm add i18n-error-base
```

## 需求 {#requirements}

需要 [Valibot](https://valibot.dev) v1 或更高版本作為對等依賴項。

## 基本用法 {#basicusage}

### 定義錯誤類別 {#defineerrorclass}

繼承 `I18nErrorBase` 以建立您自己的錯誤類別。型別參數 `TMeta` 指定與錯誤關聯的中繼資料型別。

建構函式只接受 `meta` 和 `ErrorOptions`，並在 `super` 呼叫中定義預設的英文訊息。

```ts
import { type ErrorOptions, I18nErrorBase } from "i18n-error-base";

type ValidationErrorMeta = {
  readonly field: string;
  readonly value: unknown;
};

class ValidationError extends I18nErrorBase<ValidationErrorMeta> {
  public constructor(args: ValidationErrorMeta & ErrorOptions) {
    const { field, value, ...options } = args;
    const meta = { field, value };
    super(meta, ({ field, value }) => `Invalid value for ${field}: ${value}`, options);
  }
}
```

### 擲出錯誤 {#throwerror}

只向建構函式傳遞中繼資料。將使用定義類別時指定的預設訊息。

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### 註冊特定於地區設定的訊息 {#registermessage}

使用 `setErrorMessage` 函式將錯誤類別與特定於地區設定的訊息關聯起來。

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### 切換地區設定 {#switchlocale}

當您使用 Valibot 的 `setGlobalConfig` 變更語言時，存取 `error.message` 將返回該語言對應的訊息。

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

當未透過 `setGlobalConfig` 指定語言時，預設語言為 `"en"`。因此，預設訊息應使用英文撰寫。
