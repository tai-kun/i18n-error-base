---
title: Довідник API
description: Довідник класів, функцій і типів, що надаються i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Базовий клас, який розширює `Error`. Усі інтернаціоналізовані класи помилок мають розширювати цей клас.

### Аргументи Типу {#i18nerrorbase-templates}

| Аргумент | Стандартне значення | Опис                                                                                                                |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | Тип метаданих, пов'язаних із помилкою. Вкажіть тип об'єкта, що розширює `{ readonly [prop: string]: unknown }`.      |

### Конструктор {#i18nerrorbase-constructor}

Конструктор базового класу має наступну сигнатуру. Зазвичай підкласи визначають власний конструктор і викликають `super` всередині.

#### Коли `TMeta` не є `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Параметр   | Тип                               | Опис                                                                                                    |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                           | Метадані, пов'язані з помилкою.                                                                         |
| `message`  | `string \| MessageFactory<TMeta>` | Повідомлення про помилку або функція, яка отримує метадані та генерує повідомлення.                     |
| `options`  | `ErrorOptions` (необов'язковий)   | Параметри, що передаються конструктору `Error`. Використовується для вказівки `cause`.                   |

#### Коли `TMeta` є `undefined` {#i18nerrorbase-tmeta-undefined}

Для класів помилок, які не потребують метаданих, повідомлення можна передати безпосередньо як перший аргумент конструктора.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Параметр   | Тип                               | Опис                                                                                                    |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | Повідомлення про помилку або функція, яка отримує метадані та генерує повідомлення.                     |
| `options`  | `ErrorOptions` (необов'язковий)   | Параметри, що передаються конструктору `Error`. Використовується для вказівки `cause`.                   |

### Властивості {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Містить метадані, передані конструктору. Коли `TMeta` є `undefined`, це значення також `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Динамічний геттер, який повертає повідомлення про помилку відповідно до поточного налаштування мови. Ця властивість є перелічуваною.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Коли `cause` передається в параметрах конструктора, він зберігається в `error.cause`. Ця властивість поліфілиться, навіть якщо середовище виконання JavaScript не підтримує `cause` нативно.

### Статичні Властивості

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Префікс, який додається на початок повідомлення. Перевизначте це в підкласах для використання.

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

Коли `prefix` використовується разом із локалізованими повідомленнями, префікс додається до перекладеного або резервного повідомлення.

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

Реєструє локалізоване повідомлення для певного класу помилки.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Параметр    | Тип                              | Опис                                                                                                                               |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Конструктор класу помилки, для якого реєструється повідомлення. Можна вказувати лише класи, що розширюють `I18nErrorBase`.         |
| `message`   | `string \| ((meta) => string)`   | Повідомлення про помилку або функція, яка отримує метадані та генерує повідомлення. Якщо передано рядок, він автоматично перетворюється на функцію, яка повертає цей рядок. |
| `lang`      | `string \| Iterable<string>`     | Код мови. Може бути окремим рядком або ітерованим об'єктом, як-от масив, щоб зареєструвати кілька мов одночасно.                   |

Повторний виклик для вже зареєстрованої мови перезаписує існуюче повідомлення.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Типи {#types}

### ErrorMeta {#errormeta}

Визначення типу для метаданих. Має індексну сигнатуру лише для читання.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Тип фабричної функції, яка генерує повідомлення про помилки.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Тип параметрів конструктора `Error`. Має властивість `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Тип кортежу параметрів, що передаються конструктору. Його структура змінюється залежно від того, чи є `TMeta` `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Тип конструктора, який можна вказати як перший аргумент `setErrorMessage`. Передача класу, який не розширює `I18nErrorBase`, призводить до помилки типу.
