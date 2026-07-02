---
title: Overview
description: i18n-error-base is a base error class that integrates with Valibot's global language configuration to dynamically switch error messages based on locale.
---

i18n-error-base is a base error class that integrates with Valibot's global language configuration to dynamically switch error messages based on locale.

## Install {#install}

```sh
pnpm add i18n-error-base
```

## Requirements {#requirements}

[Valibot](https://valibot.dev) v1 or later is required as a peer dependency.

## Basic Usage {#basicusage}

### Define an Error Class {#defineerrorclass}

Extend `I18nErrorBase` to create your own error class. The type argument `TMeta` specifies the type of metadata associated with the error.

The constructor only accepts `meta` and `ErrorOptions`, and defines the default English message in the `super` call.

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

### Throw an Error {#throwerror}

Pass only the metadata to the constructor. The default message specified when defining the class is used.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Register Locale-Specific Messages {#registermessage}

Use the `setErrorMessage` function to associate an error class with locale-specific messages.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Switch Locale {#switchlocale}

When you change the language using Valibot's `setGlobalConfig`, accessing `error.message` returns the message corresponding to that language.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

The default language is `"en"` when no language is specified via `setGlobalConfig`. Therefore, the default message should be written in English.
