---
title: Огляд
description: i18n-error-base — це базовий клас помилок, який інтегрується з глобальною конфігурацією мови Valibot для динамічної зміни повідомлень про помилки залежно від локалі.
---

i18n-error-base — це базовий клас помилок, який інтегрується з глобальною конфігурацією мови Valibot для динамічної зміни повідомлень про помилки залежно від локалі.

## Встановлення {#install}

```sh
pnpm add i18n-error-base
```

## Вимоги {#requirements}

[Valibot](https://valibot.dev) версії 1 або новішої потрібен як peer-залежність.

## Базове Використання {#basicusage}

### Визначення Класу Помилки {#defineerrorclass}

Розширте `I18nErrorBase`, щоб створити власний клас помилки. Аргумент типу `TMeta` визначає тип метаданих, пов'язаних із помилкою.

Конструктор приймає лише `meta` та `ErrorOptions` і визначає стандартне англійське повідомлення у виклику `super`.

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

### Викинення Помилки {#throwerror}

Передайте лише метадані конструктору. Використовується стандартне повідомлення, визначене під час оголошення класу.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Реєстрація Локалізованих Повідомлень {#registermessage}

Використовуйте функцію `setErrorMessage`, щоб пов'язати клас помилки з локалізованими повідомленнями.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Зміна Локалі {#switchlocale}

Коли ви змінюєте мову за допомогою `setGlobalConfig` від Valibot, доступ до `error.message` повертає повідомлення, що відповідає цій мові.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

Мовою за замовчуванням є `"en"`, якщо жодна мова не вказана через `setGlobalConfig`. Тому стандартне повідомлення має бути написане англійською.
