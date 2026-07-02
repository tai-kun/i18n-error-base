---
title: 概述
description: i18n-error-base 是一个基础错误类，与 Valibot 的全局语言配置集成，可根据区域设置动态切换错误消息。
---

i18n-error-base 是一个基础错误类，与 Valibot 的全局语言配置集成，可根据区域设置动态切换错误消息。

## 安装 {#install}

```sh
pnpm add i18n-error-base
```

## 要求 {#requirements}

需要 [Valibot](https://valibot.dev) v1 或更高版本作为对等依赖项。

## 基本用法 {#basicusage}

### 定义错误类 {#defineerrorclass}

继承 `I18nErrorBase` 以创建您自己的错误类。类型参数 `TMeta` 指定与错误关联的元数据类型。

构造函数只接受 `meta` 和 `ErrorOptions`，并在 `super` 调用中定义默认的英文消息。

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

### 抛出错误 {#throwerror}

只向构造函数传递元数据。将使用定义类时指定的默认消息。

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### 注册特定于区域设置的消息 {#registermessage}

使用 `setErrorMessage` 函数将错误类与特定于区域设置的消息关联起来。

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### 切换区域设置 {#switchlocale}

当您使用 Valibot 的 `setGlobalConfig` 更改语言时，访问 `error.message` 将返回该语言对应的消息。

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

当未通过 `setGlobalConfig` 指定语言时，默认语言为 `"en"`。因此，默认消息应使用英文编写。
