---
title: API Reference
description: Reference for classes, functions, and types provided by i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

A base class that extends `Error`. All internationalized error classes should extend this class.

### Type Arguments {#i18nerrorbase-templates}

| Argument | Default                | Description                                                                                                       |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | The type of metadata associated with the error. Specify an object type that extends `{ readonly [prop: string]: unknown }`. |

### Constructor {#i18nerrorbase-constructor}

The base class constructor has the following signature. Typically, subclasses define their own constructor and call `super` internally.

#### When `TMeta` is not `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parameter   | Type                              | Description                                                                                          |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | The metadata associated with the error.                                                              |
| `message`   | `string \| MessageFactory<TMeta>` | The error message, or a function that receives metadata and generates a message.                     |
| `options`   | `ErrorOptions` (optional)         | Options passed to the `Error` constructor. Used to specify `cause`.                                  |

#### When `TMeta` is `undefined` {#i18nerrorbase-tmeta-undefined}

For error classes that do not require metadata, the message can be passed directly as the first argument to the constructor.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parameter   | Type                              | Description                                                                                          |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | The error message, or a function that receives metadata and generates a message.                     |
| `options`   | `ErrorOptions` (optional)         | Options passed to the `Error` constructor. Used to specify `cause`.                                  |

### Properties {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Holds the metadata passed to the constructor. When `TMeta` is `undefined`, this is `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

A dynamic getter that returns the error message according to the current language setting. This property is enumerable.

#### `error.cause: unknown` {#i18nerrorbase-cause}

When `cause` is passed in the constructor options, it is held in `error.cause`. This property is polyfilled even if the JavaScript runtime does not natively support `cause`.

### Static Properties

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

A prefix prepended to the beginning of the message. Override this in subclasses to use it.

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

When `prefix` is used together with locale-specific messages, the prefix is prepended to the translated or fallback message.

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

Registers a locale-specific message for a specific error class.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parameter   | Type                            | Description                                                                                                                           |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | The constructor of the error class to register the message for. Only classes extending `I18nErrorBase` can be specified.              |
| `message`   | `string \| ((meta) => string)`  | The error message, or a function that receives metadata and generates a message. If a string is passed, it is automatically converted to a function that returns that string. |
| `lang`      | `string \| Iterable<string>`    | The language code. Can be a single string or an iterable such as an array to register multiple languages at once.                     |

Calling again for an already registered language overwrites the existing message.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Types {#types}

### ErrorMeta {#errormeta}

The type definition for metadata. Has a read-only index signature.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

The type of a factory function that generates error messages.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

The type for `Error` constructor options. Has a `cause` property.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

A tuple type of parameters passed to the constructor. Its structure changes depending on whether `TMeta` is `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

The type of the constructor that can be specified as the first argument of `setErrorMessage`. Passing a class that does not extend `I18nErrorBase` results in a type error.
