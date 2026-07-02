---
title: API 参考
description: i18n-error-base 提供的类、函数和类型的参考文档。
---

## I18nErrorBase {#i18nerrorbase}

一个继承自 `Error` 的基类。所有国际化的错误类都应继承此类。

### 类型参数 {#i18nerrorbase-templates}

| 参数    | 默认值                   | 描述                                                                                          |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| `TMeta` | `ErrorMeta \| undefined` | 与错误关联的元数据类型。指定一个继承自 `{ readonly [prop: string]: unknown }` 的对象类型。 |

### 构造函数 {#i18nerrorbase-constructor}

基类构造函数具有以下签名。通常，子类定义自己的构造函数并在内部调用 `super`。

#### 当 `TMeta` 不为 `undefined` 时 {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| 参数      | 类型                              | 描述                                                                                          |
| --------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `meta`    | `TMeta`                           | 与错误关联的元数据。                                                                          |
| `message` | `string \| MessageFactory<TMeta>` | 错误消息，或一个接收元数据并生成消息的函数。                                                  |
| `options` | `ErrorOptions` (可选)             | 传递给 `Error` 构造函数的选项。用于指定 `cause`。                                             |

#### 当 `TMeta` 为 `undefined` 时 {#i18nerrorbase-tmeta-undefined}

对于不需要元数据的错误类，消息可以直接作为构造函数的第一个参数传递。

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| 参数      | 类型                              | 描述                                                                                          |
| --------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `message` | `string \| MessageFactory<TMeta>` | 错误消息，或一个接收元数据并生成消息的函数。                                                  |
| `options` | `ErrorOptions` (可选)             | 传递给 `Error` 构造函数的选项。用于指定 `cause`。                                             |

### 属性 {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

保存传递到构造函数的元数据。当 `TMeta` 为 `undefined` 时，此值为 `undefined`。

#### `error.message: string` {#i18nerrorbase-message}

一个动态 getter，根据当前语言设置返回错误消息。此属性是可枚举的。

#### `error.cause: unknown` {#i18nerrorbase-cause}

当在构造函数选项中传递了 `cause` 时，它保存在 `error.cause` 中。即使 JavaScript 运行时本身不支持 `cause`，此属性也会被 polyfill。

### 静态属性

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

一个添加到消息开头的前缀。在子类中覆盖此属性以使用它。

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

当 `prefix` 与特定于区域设置的消息一起使用时，前缀会添加到翻译后的消息或回退消息之前。

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

为特定的错误类注册一个特定于区域设置的消息。

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| 参数        | 类型                            | 描述                                                                                                                                                       |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | 要注册消息的错误类的构造函数。只能指定继承自 `I18nErrorBase` 的类。                                                                                        |
| `message`   | `string \| ((meta) => string)`  | 错误消息，或一个接收元数据并生成消息的函数。如果传入字符串，则会自动转换为返回该字符串的函数。                                                            |
| `lang`      | `string \| Iterable<string>`    | 语言代码。可以是单个字符串，也可以是数组等可迭代对象，用于同时注册多种语言。                                                                               |

对已注册的语言再次调用将覆盖现有消息。

```ts
// 注册单一语言
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// 同时注册多种语言
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// 使用字符串注册
setErrorMessage(ValidationError, "something went wrong", "en");
```

## 类型 {#types}

### ErrorMeta {#errormeta}

元数据的类型定义。具有只读的索引签名。

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

生成错误消息的工厂函数的类型。

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` 构造函数选项的类型。具有 `cause` 属性。

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

传递给构造函数的参数元组类型。其结构根据 `TMeta` 是否为 `undefined` 而变化。

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

可作为 `setErrorMessage` 第一个参数指定的构造函数类型。传递一个不继承自 `I18nErrorBase` 的类会导致类型错误。
