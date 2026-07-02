---
title: مرجع API
description: مرجع کلاس‌ها، توابع و انواع ارائه‌شده توسط i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

یک کلاس پایه که `Error` را گسترش می‌دهد. تمام کلاس‌های خطای بین‌المللی‌شده باید از این کلاس ارث‌بری کنند.

### آرگومان‌های نوع {#i18nerrorbase-templates}

| آرگومان | پیش‌فرض               | شرح                                                                                                              |
| -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | نوع فراداده مرتبط با خطا. یک نوع شیء که `{ readonly [prop: string]: unknown }` را گسترش می‌دهد مشخص کنید. |

### سازنده {#i18nerrorbase-constructor}

سازنده کلاس پایه امضای زیر را دارد. به طور معمول، زیرکلاس‌ها سازنده خود را تعریف کرده و `super` را در داخل فراخوانی می‌کنند.

#### وقتی `TMeta` `undefined` نیست {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| پارامتر    | نوع                              | شرح                                                                                             |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `meta`      | `TMeta`                           | فراداده مرتبط با خطا.                                                                           |
| `message`   | `string \| MessageFactory<TMeta>` | پیام خطا، یا تابعی که فراداده را دریافت کرده و یک پیام تولید می‌کند.                            |
| `options`   | `ErrorOptions` (اختیاری)          | گزینه‌های ارسال‌شده به سازنده `Error`. برای مشخص کردن `cause` استفاده می‌شود.                    |

#### وقتی `TMeta` `undefined` است {#i18nerrorbase-tmeta-undefined}

برای کلاس‌های خطایی که به فراداده نیاز ندارند، پیام می‌تواند مستقیماً به عنوان اولین آرگومان به سازنده ارسال شود.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| پارامتر    | نوع                              | شرح                                                                                             |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `message`   | `string \| MessageFactory<TMeta>` | پیام خطا، یا تابعی که فراداده را دریافت کرده و یک پیام تولید می‌کند.                            |
| `options`   | `ErrorOptions` (اختیاری)          | گزینه‌های ارسال‌شده به سازنده `Error`. برای مشخص کردن `cause` استفاده می‌شود.                    |

### ویژگی‌ها {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

فراداده ارسال‌شده به سازنده را نگه می‌دارد. وقتی `TMeta` `undefined` است، این مقدار `undefined` است.

#### `error.message: string` {#i18nerrorbase-message}

یک getter پویا که پیام خطا را با توجه به تنظیمات زبان فعلی برمی‌گرداند. این ویژگی قابل شمارش است.

#### `error.cause: unknown` {#i18nerrorbase-cause}

وقتی `cause` در گزینه‌های سازنده ارسال شود، در `error.cause` نگه داشته می‌شود. این ویژگی حتی اگر runtime جاوااسکریپت به صورت بومی از `cause` پشتیبانی نکند، polyfill می‌شود.

### ویژگی‌های ایستا

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

یک پیشوند که به ابتدای پیام اضافه می‌شود. برای استفاده از آن، در زیرکلاس‌ها بازنویسی کنید.

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

وقتی `prefix` همراه با پیام‌های خاص locale استفاده می‌شود، پیشوند به پیام ترجمه‌شده یا پیام بازگشتی اضافه می‌شود.

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

یک پیام خاص locale را برای یک کلاس خطای مشخص ثبت می‌کند.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| پارامتر     | نوع                              | شرح                                                                                                                                  |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`        | سازنده کلاس خطا برای ثبت پیام. فقط کلاس‌هایی که `I18nErrorBase` را گسترش می‌دهند می‌توانند مشخص شوند.                                 |
| `message`   | `string \| ((meta) => string)`    | پیام خطا، یا تابعی که فراداده را دریافت کرده و یک پیام تولید می‌کند. اگر یک رشته ارسال شود، به طور خودکار به تابعی تبدیل می‌شود که آن رشته را برمی‌گرداند. |
| `lang`      | `string \| Iterable<string>`      | کد زبان. می‌تواند یک رشته تکی یا یک شیء قابل پیمایش مانند آرایه باشد تا چندین زبان را همزمان ثبت کند.                                 |

فراخوانی مجدد برای یک زبان ثبت‌شده قبلی، پیام موجود را بازنویسی می‌کند.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## انواع {#types}

### ErrorMeta {#errormeta}

تعریف نوع برای فراداده. دارای امضای شاخص فقط خواندنی است.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

نوع یک تابع کارخانه که پیام‌های خطا را تولید می‌کند.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

نوع گزینه‌های سازنده `Error`. دارای ویژگی `cause` است.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

یک نوع تاپل از پارامترهای ارسال‌شده به سازنده. ساختار آن بسته به اینکه `TMeta` `undefined` است یا خیر تغییر می‌کند.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

نوع سازنده‌ای که می‌تواند به عنوان اولین آرگومان `setErrorMessage` مشخص شود. ارسال کلاسی که `I18nErrorBase` را گسترش نمی‌دهد منجر به خطای نوع می‌شود.
