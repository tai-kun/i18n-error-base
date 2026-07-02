---
title: Справочник API
description: Справочник по классам, функциям и типам, предоставляемым i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Базовый класс, расширяющий `Error`. Все интернационализированные классы ошибок должны расширять этот класс.

### Аргументы типа {#i18nerrorbase-templates}

| Аргумент | По умолчанию         | Описание                                                                                                                   |
| -------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | Тип метаданных, связанных с ошибкой. Укажите объектный тип, расширяющий `{ readonly [prop: string]: unknown }`. |

### Конструктор {#i18nerrorbase-constructor}

Конструктор базового класса имеет следующую сигнатуру. Обычно подклассы определяют свой собственный конструктор и вызывают `super` внутри.

#### Когда `TMeta` не `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Параметр   | Тип                              | Описание                                                                                                |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                          | Метаданные, связанные с ошибкой.                                                                        |
| `message`  | `string \| MessageFactory<TMeta>` | Сообщение об ошибке или функция, которая получает метаданные и генерирует сообщение.                    |
| `options`  | `ErrorOptions` (опционально)     | Опции, передаваемые конструктору `Error`. Используется для указания `cause`.                            |

#### Когда `TMeta` — `undefined` {#i18nerrorbase-tmeta-undefined}

Для классов ошибок, которые не требуют метаданных, сообщение может быть передано напрямую как первый аргумент конструктора.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Параметр   | Тип                              | Описание                                                                                                |
| ---------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | Сообщение об ошибке или функция, которая получает метаданные и генерирует сообщение.                    |
| `options`  | `ErrorOptions` (опционально)     | Опции, передаваемые конструктору `Error`. Используется для указания `cause`.                            |

### Свойства {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Содержит метаданные, переданные конструктору. Когда `TMeta` — `undefined`, это `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Динамический геттер, который возвращает сообщение об ошибке в соответствии с текущей языковой настройкой. Это свойство является перечисляемым.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Когда `cause` передаётся в опциях конструктора, он сохраняется в `error.cause`. Это свойство полифиллится, даже если среда выполнения JavaScript изначально не поддерживает `cause`.

### Статические свойства

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Префикс, добавляемый в начало сообщения. Переопределите его в подклассах для использования.

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

Когда `prefix` используется вместе с сообщениями для конкретной локали, префикс добавляется к переведённому или резервному сообщению.

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

Регистрирует сообщение для конкретной локали для определённого класса ошибки.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Параметр    | Тип                              | Описание                                                                                                                                           |
| ----------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Конструктор класса ошибки, для которого регистрируется сообщение. Можно указать только классы, расширяющие `I18nErrorBase`.                        |
| `message`   | `string \| ((meta) => string)`   | Сообщение об ошибке или функция, которая получает метаданные и генерирует сообщение. Если передана строка, она автоматически преобразуется в функцию, возвращающую эту строку. |
| `lang`      | `string \| Iterable<string>`     | Код языка. Может быть одной строкой или итерируемым объектом, например массивом, для регистрации нескольких языков одновременно.                   |

Повторный вызов для уже зарегистрированного языка перезаписывает существующее сообщение.

```ts
// Регистрация одного языка
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Регистрация нескольких языков одновременно
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Регистрация строкой
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Типы {#types}

### ErrorMeta {#errormeta}

Определение типа для метаданных. Имеет индексную сигнатуру только для чтения.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Тип фабричной функции, которая генерирует сообщения об ошибках.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Тип для опций конструктора `Error`. Имеет свойство `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Тип кортежа параметров, передаваемых конструктору. Его структура меняется в зависимости от того, является ли `TMeta` `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Тип конструктора, который может быть указан как первый аргумент `setErrorMessage`. Передача класса, не расширяющего `I18nErrorBase`, приводит к ошибке типа.
