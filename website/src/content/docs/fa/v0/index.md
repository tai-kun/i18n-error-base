---
title: نمای کلی
description: i18n-error-base یک کلاس خطای پایه است که با پیکربندی زبان سراسری Valibot ادغام می‌شود تا پیام‌های خطا را بر اساس locale به صورت پویا تغییر دهد.
---

i18n-error-base یک کلاس خطای پایه است که با پیکربندی زبان سراسری Valibot ادغام می‌شود تا پیام‌های خطا را بر اساس locale به صورت پویا تغییر دهد.

## نصب {#install}

```sh
pnpm add i18n-error-base
```

## پیش‌نیازها {#requirements}

[Valibot](https://valibot.dev) نسخه ۱ یا بالاتر به عنوان وابستگی هم‌رده مورد نیاز است.

## کاربرد پایه {#basicusage}

### تعریف یک کلاس خطا {#defineerrorclass}

از `I18nErrorBase` ارث‌بری کنید تا کلاس خطای خود را ایجاد کنید. آرگومان نوع `TMeta` نوع فراداده مرتبط با خطا را مشخص می‌کند.

سازنده فقط `meta` و `ErrorOptions` را می‌پذیرد و پیام پیش‌فرض انگلیسی را در فراخوانی `super` تعریف می‌کند.

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

### پرتاب یک خطا {#throwerror}

فقط فراداده را به سازنده ارسال کنید. پیام پیش‌فرض مشخص‌شده هنگام تعریف کلاس استفاده می‌شود.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### ثبت پیام‌های خاص هر locale {#registermessage}

از تابع `setErrorMessage` برای مرتبط کردن یک کلاس خطا با پیام‌های خاص هر locale استفاده کنید.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### تغییر locale {#switchlocale}

وقتی زبان را با استفاده از `setGlobalConfig` Valibot تغییر می‌دهید، دسترسی به `error.message` پیام مربوط به آن زبان را برمی‌گرداند.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

زبان پیش‌فرض وقتی زبانی از طریق `setGlobalConfig` مشخص نشده باشد، `"en"` است. بنابراین، پیام پیش‌فرض باید به انگلیسی نوشته شود.
