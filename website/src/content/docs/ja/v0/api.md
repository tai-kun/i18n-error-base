---
title: API リファレンス
description: i18n-error-base が提供するクラス、関数、型のリファレンスです。
---

## I18nErrorBase {#i18nerrorbase}

`Error` を継承した基底クラスです。すべての国際化対応エラークラスはこのクラスを継承して作成します。

### 型引数 {#i18nerrorbase-templates}

| 引数    | デフォルト値             | 説明                                                                                                              |
| ------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `TMeta` | `ErrorMeta \| undefined` | エラーに付随するメタデータの型です。`{ readonly [prop: string]: unknown }` を拡張したオブジェクト型を指定します。 |

### コンストラクター {#i18nerrorbase-constructor}

基底クラスのコンストラクターは以下のシグネチャを持ちます。通常は継承先で独自のコンストラクターを定義し、内部で `super` を呼び出します。

#### TMeta が `undefined` 以外の場合 {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| 引数      | 型                                | 説明                                                                         |
| --------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `meta`    | `TMeta`                           | エラーに付随するメタデータです。                                             |
| `message` | `string \| MessageFactory<TMeta>` | エラーメッセージ、またはメタデータを受け取ってメッセージを生成する関数です。 |
| `options` | `ErrorOptions` (省略可能)         | `Error` コンストラクターに渡すオプションです。`cause` の指定に使用します。   |

#### TMeta が `undefined` の場合 {#i18nerrorbase-tmeta-undefined}

メタデータを必要としないエラークラスでは、コンストラクターの第一引数にメッセージを直接渡せます。

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| 引数      | 型                                | 説明                                                                         |
| --------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `message` | `string \| MessageFactory<TMeta>` | エラーメッセージ、またはメタデータを受け取ってメッセージを生成する関数です。 |
| `options` | `ErrorOptions` (省略可能)         | `Error` コンストラクターに渡すオプションです。`cause` の指定に使用します。   |

### プロパティー {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

コンストラクターに渡されたメタデータを保持します。`TMeta` が `undefined` の場合は `undefined` になります。

#### `error.message: string` {#i18nerrorbase-message}

現在の言語設定に応じたエラーメッセージを返す動的なゲッターです。このプロパティーは列挙可能です。

#### `error.cause: unknown` {#i18nerrorbase-cause}

コンストラクターのオプションで `cause` を指定すると、`error.cause` に保持されます。このプロパティーは、JavaScript 実行環境が `cause` をネイティブにサポートしていない場合でもポリフィルされます。

### 静的プロパティー

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

メッセージの先頭に付加する接頭辞です。継承先のクラスで上書きして使用します。

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

`prefix` と言語ごとのメッセージを併用した場合、接頭辞は翻訳後またはフォールバック後のメッセージの先頭に付加されます。

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

特定のエラークラスに対して、言語ごとのメッセージを登録します。

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| 引数        | 型                             | 説明                                                                                                                                           |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`     | メッセージを登録するエラークラスのコンストラクターです。`I18nErrorBase` を継承したクラスのみ指定できます。                                     |
| `message`   | `string \| ((meta) => string)` | エラーメッセージ、またはメタデータを受け取ってメッセージを生成する関数です。文字列を渡した場合は、自動的にその文字列を返す関数に変換されます。 |
| `lang`      | `string \| Iterable<string>`   | 言語コードです。単一の文字列、または複数の言語を一度に登録するための配列などの反復可能オブジェクトを指定できます。                             |

すでに登録済みの言語に対して再び呼び出すと、新しいメッセージで上書きされます。

```ts
// 単一の言語を登録
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// 複数の言語を同時に登録
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// 文字列で登録
setErrorMessage(ValidationError, "something went wrong", "en");
```

## 型 {#types}

### ErrorMeta {#errormeta}

メタデータの型定義です。読み取り専用のインデックスシグネチャを持ちます。

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

エラーメッセージを生成するファクトリー関数の型です。

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` コンストラクターのオプションの型です。`cause` プロパティーを持ちます。

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

コンストラクターに渡すパラメーターのタプル型です。`TMeta` が `undefined` かどうかで構成が変化します。

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

`setErrorMessage` の第一引数に指定できるコンストラクターの型です。`I18nErrorBase` を継承していないクラスを渡そうとすると、型エラーになります。
