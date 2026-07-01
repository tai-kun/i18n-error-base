# i18n-error-base

`valibot` のグローバルな言語設定と連携して、ロケールに応じたエラーメッセージを動的に切り替えられるエラークラスの基底です。

## インストール

```sh
pnpm add i18n-error-base
```

## 必要な環境

- [valibot](https://valibot.dev) v1 以降が peer dependency として必要です。

## 基本的な使い方

### エラークラスを定義する

`I18nErrorBase` を継承して、独自のエラークラスを作成します。型引数 `TMeta` には、エラーに付随するメタデータの型を指定します。

コンストラクターでは `meta` と `ErrorOptions` のみを受け取り、`super` で英語のデフォルトメッセージを定義します。

```ts
import { type ErrorOptions, I18nErrorBase } from "i18n-error-base";

class ValidationError extends I18nErrorBase<{ field: string; value: unknown }> {
  public constructor(meta: { field: string; value: unknown }, options?: ErrorOptions) {
    super(meta, ({ field, value }) => `Invalid value for ${field}: ${value}`, options);
  }
}
```

### エラーを投げる

コンストラクターにはメタデータのみを渡します。メッセージはクラス定義時に指定したデフォルトが使われます。

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### 言語ごとのメッセージを登録する

`setErrorMessage` 関数を使って、エラークラスと言語ごとのメッセージを紐づけます。

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### 言語を切り替える

`valibot` の `setGlobalConfig` で言語を切り替えると、`error.message` にアクセスしたときにその言語に対応したメッセージが返ります。

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

`setGlobalConfig` で言語を指定しない場合のデフォルトは `"en"` です。そのため、デフォルトメッセージは英語で記述します。

## API リファレンス

### `I18nErrorBase<TMeta>`

`Error` を継承した基底クラスです。すべての国際化対応エラークラスはこのクラスを継承して作成します。

#### 型引数

| 引数    | デフォルト値             | 説明                                                                                                              |
| ------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `TMeta` | `ErrorMeta \| undefined` | エラーに付随するメタデータの型です。`{ readonly [prop: string]: unknown }` を拡張したオブジェクト型を指定します。 |

#### コンストラクター

基底クラスのコンストラクターは以下のシグネチャを持ちます。通常は継承先で独自のコンストラクターを定義し、内部で `super` を呼び出します。

##### `TMeta` が `undefined` 以外の場合

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| 引数      | 型                                | 説明                                                                         |
| --------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `meta`    | `TMeta`                           | エラーに付随するメタデータです。                                             |
| `message` | `string \| MessageFactory<TMeta>` | エラーメッセージ、またはメタデータを受け取ってメッセージを生成する関数です。 |
| `options` | `ErrorOptions` (省略可能)         | `Error` コンストラクターに渡すオプションです。`cause` の指定に使用します。   |

##### `TMeta` が `undefined` の場合

メタデータを必要としないエラークラスでは、コンストラクターの第一引数にメッセージを直接渡せます。

| 引数      | 型                                | 説明                                                                         |
| --------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `message` | `string \| MessageFactory<TMeta>` | エラーメッセージ、またはメタデータを受け取ってメッセージを生成する関数です。 |
| `options` | `ErrorOptions` (省略可能)         | `Error` コンストラクターに渡すオプションです。`cause` の指定に使用します。   |

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

#### プロパティー

##### `error.meta: TMeta`

コンストラクターに渡されたメタデータを保持します。`TMeta` が `undefined` の場合は `undefined` になります。

##### `error.message: string`

現在の言語設定に応じたエラーメッセージを返す動的なゲッターです。このプロパティーは列挙可能です。

##### `error.cause: unknown`

コンストラクターのオプションで `cause` を指定すると、`error.cause` に保持されます。このプロパティーは、JavaScript 実行環境が `cause` をネイティブにサポートしていない場合でもポリフィルされます。

#### 静的プロパティー

##### `MyError.prefix?: string`

メッセージの先頭に付加する接頭辞です。継承先のクラスで上書きして使用します。

```ts
class ApiError extends I18nErrorBase<{ status: number }> {
  static {
    this.prefix = "[API Error] ";
  }

  public constructor(meta: { status: number }, options?: ErrorOptions) {
    super(meta, ({ status }) => `Request failed with status ${status}`, options);
  }
}

const error = new ApiError({ status: 404 });
console.log(error.message); // => "[API Error] Request failed with status 404"
```

`prefix` と言語ごとのメッセージを併用した場合、接頭辞は翻訳後またはフォールバック後のメッセージの先頭に付加されます。

```ts
class PrefixedError extends I18nErrorBase<{ code: string }> {
  static {
    this.prefix = "[ERROR] ";
  }

  public constructor(meta: { code: string }, options?: ErrorOptions) {
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

### `setErrorMessage(reference, message, lang)`

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

// 文字列で登録（自動的に関数に変換される）
setErrorMessage(ValidationError, "something went wrong", "en");
```

### 型

#### `ErrorMeta`

メタデータの型定義です。読み取り専用のインデックスシグネチャを持ちます。

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

#### `MessageFactory<TMeta>`

エラーメッセージを生成するファクトリー関数の型です。

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

#### `ErrorOptions`

`Error` コンストラクターのオプションの型です。`cause` プロパティーを持ちます。

```ts
type ErrorOptions = { readonly cause?: unknown };
```

#### `I18nErrorBaseParams<TMeta>`

コンストラクターに渡すパラメーターのタプル型です。`TMeta` が `undefined` かどうかで構成が変化します。

#### `I18nErrorBaseConstructor`

`setErrorMessage` の第一引数に指定できるコンストラクターの型です。`I18nErrorBase` を継承していないクラスを渡そうとすると、型エラーになります。

## 動作の詳細

### メッセージ解決の優先順位

`error.message` にアクセスすると、以下の優先順位でメッセージが解決されます。

1. `valibot` のグローバルな言語設定 (`setGlobalConfig({ lang })`) で指定された言語に対応するメッセージが `setErrorMessage` で登録されている場合は、そのメッセージを返します。
2. 登録されていない場合は、コンストラクターに指定されたデフォルトのメッセージを返します。
3. `static prefix` が設定されている場合は、上記のメッセージの先頭に接頭辞を付加します。

### メッセージの動的な解決

`message` プロパティーはアクセスするたびに現在の言語設定を参照するゲッターです。同じエラーインスタンスに対して言語設定を切り替えながら `message` にアクセスすると、その都度異なる言語のメッセージが返ります。

```ts
const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => 日本語メッセージ

setGlobalConfig({ lang: "en" });
console.log(error.message); // => 英語のデフォルトメッセージ
```

### 登録されていない言語へのフォールバック

`setErrorMessage` で特定の言語のメッセージのみを登録し、それ以外の言語が要求された場合は、コンストラクターに指定されたデフォルトのメッセージが返ります。

```ts
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, "ja");

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "fr" }); // "fr" は未登録
console.log(error.message); // => "Invalid value for email: invalid"（デフォルト）
```

### メッセージファクトリー関数

メッセージに動的な値を埋め込むには、文字列の代わりに関数を渡します。この関数はメタデータを受け取り、文字列を返します。

```ts
class BusinessRuleError extends I18nErrorBase<{ code: string; limit: number }> {
  public constructor(meta: { code: string; limit: number }, options?: ErrorOptions) {
    super(meta, ({ code, limit }) => `Code: ${code}, Limit: ${limit}`, options);
  }
}
```

`setErrorMessage` で言語ごとに異なるメッセージを登録する場合も同様に関数を渡せます。

```ts
setErrorMessage(BusinessRuleError, ({ code, limit }) => `コード: ${code}、制限: ${limit}`, "ja");
```

### ErrorOptions と cause

`ErrorOptions` の `cause` を使って、元のエラーを保持できます。

```ts
try {
  // 何らかの処理
} catch (originalError) {
  throw new ValidationError({ field: "email", value: input }, { cause: originalError });
}
```

## 推奨するエラークラスの定義パターン

エラークラスを定義するときは、コンストラクターで `meta` と `ErrorOptions` のみを受け取り、`super` で英語のデフォルトメッセージを定義することを推奨します。

```ts
import { type ErrorOptions, I18nErrorBase } from "i18n-error-base";

class NotFoundError extends I18nErrorBase<{ resource: string; id: string }> {
  public constructor(meta: { resource: string; id: string }, options?: ErrorOptions) {
    super(meta, ({ resource, id }) => `${resource} not found: ${id}`, options);
  }
}

class UnauthorizedError extends I18nErrorBase<{ action: string }> {
  public constructor(meta: { action: string }, options?: ErrorOptions) {
    super(meta, ({ action }) => `Unauthorized to perform action: ${action}`, options);
  }
}

class ConfigError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Configuration error", options);
  }
}
```

こうすることで、以下の利点があります。

- エラークラスごとに意味のあるデフォルトメッセージが英語で定義される
- 利用者はメッセージを意識せずにメタデータだけを渡してエラーを作成できる
- `setGlobalConfig({ lang: "en" })` のときは常にデフォルトメッセージがフォールバックとして機能する
- 各エラークラスが自己完結しており、利用箇所でメッセージを重複して書く必要がない

## TypeScript による型安全性

`I18nErrorBase` はジェネリクスによりメタデータの型を厳密に扱えます。

```ts
class UserError extends I18nErrorBase<{ userId: number; action: string }> {
  public constructor(meta: { userId: number; action: string }, options?: ErrorOptions) {
    super(meta, ({ userId, action }) => `User ${userId} cannot ${action}`, options);
  }
}

const error = new UserError({ userId: 1, action: "delete" });
error.meta.userId; // number
error.meta.action; // string
```

`setErrorMessage` は `I18nErrorBase` を継承したクラスのコンストラクターのみを受け付けるため、通常の `Error` を誤って渡すと型エラーになります。

```ts
class MyError extends Error {}
// setErrorMessage(MyError, ({ field }) => `${field} is invalid`, "ja");
// ^ 型エラー: I18nErrorBaseConstructor に代入できません
```
