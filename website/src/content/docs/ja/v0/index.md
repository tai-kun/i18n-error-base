---
title: 概要
description: i18n-error-base は Valibot のグローバルな言語設定と連携して、ロケールに応じたエラーメッセージを動的に切り替えられる基底エラークラスです。
---

i18n-error-base は Valibot のグローバルな言語設定と連携して、ロケールに応じたエラーメッセージを動的に切り替えられる基底エラークラスです。

## インストール {#install}

```sh
pnpm add i18n-error-base
```

## 必要な環境 {#requirements}

[Valibot](https://valibot.dev) v1 以降が peer dependency として必要です。

## 基本的な使い方 {#basicusage}

### エラークラスを定義する {#defineerrorclass}

`I18nErrorBase` を継承して、独自のエラークラスを作成します。型引数 `TMeta` には、エラーに付随するメタデータの型を指定します。

コンストラクターでは `meta` と `ErrorOptions` のみを受け取り、`super` で英語のデフォルトメッセージを定義します。

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

### エラーを投げる {#throwerror}

コンストラクターにはメタデータのみを渡します。メッセージはクラス定義時に指定したデフォルトが使われます。

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### 言語ごとのメッセージを登録する {#registermessage}

`setErrorMessage` 関数を使って、エラークラスと言語ごとのメッセージを紐づけます。

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### 言語を切り替える {#switchlocale}

Valibot の `setGlobalConfig` で言語を切り替えると、`error.message` にアクセスしたときにその言語に対応したメッセージが返ります。

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

`setGlobalConfig` で言語を指定しない場合のデフォルトは `"en"` です。そのため、デフォルトメッセージは英語で記述します。
