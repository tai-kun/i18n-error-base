---
title: Обзор
description: i18n-error-base — это базовый класс ошибок, который интегрируется с глобальной конфигурацией языка Valibot для динамического переключения сообщений об ошибках в зависимости от локали.
---

i18n-error-base — это базовый класс ошибок, который интегрируется с глобальной конфигурацией языка Valibot для динамического переключения сообщений об ошибках в зависимости от локали.

## Установка {#install}

```sh
pnpm add i18n-error-base
```

## Требования {#requirements}

[Valibot](https://valibot.dev) версии v1 или выше требуется как зависимость peer.

## Базовое использование {#basicusage}

### Определение класса ошибки {#defineerrorclass}

Расширьте `I18nErrorBase`, чтобы создать свой собственный класс ошибки. Аргумент типа `TMeta` определяет тип метаданных, связанных с ошибкой.

Конструктор принимает только `meta` и `ErrorOptions` и определяет сообщение по умолчанию на английском языке в вызове `super`.

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

### Выброс ошибки {#throwerror}

Передайте только метаданные в конструктор. Используется сообщение по умолчанию, указанное при определении класса.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Регистрация сообщений для конкретной локали {#registermessage}

Используйте функцию `setErrorMessage`, чтобы связать класс ошибки с сообщениями для конкретной локали.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Переключение локали {#switchlocale}

Когда вы меняете язык с помощью `setGlobalConfig` из Valibot, доступ к `error.message` возвращает сообщение, соответствующее этому языку.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

Язык по умолчанию — `"en"`, если язык не указан через `setGlobalConfig`. Поэтому сообщение по умолчанию должно быть написано на английском языке.
