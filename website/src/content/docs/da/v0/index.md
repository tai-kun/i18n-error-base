---
title: Oversigt
description: i18n-error-base er en basis-fejlklasse, der integreres med Valibots globale sprogkonfiguration for dynamisk at skifte fejlmeddelelser baseret på lokalitet.
---

i18n-error-base er en basis-fejlklasse, der integreres med Valibots globale sprogkonfiguration for dynamisk at skifte fejlmeddelelser baseret på lokalitet.

## Installation {#install}

```sh
pnpm add i18n-error-base
```

## Krav {#requirements}

[Valibot](https://valibot.dev) v1 eller nyere kræves som en peer-afhængighed.

## Grundlæggende Brug {#basicusage}

### Definer en Fejlklasse {#defineerrorclass}

Udvid `I18nErrorBase` for at oprette din egen fejlklasse. Typeargumentet `TMeta` angiver typen af metadata, der er knyttet til fejlen.

Konstruktøren accepterer kun `meta` og `ErrorOptions` og definerer standardbeskeden på engelsk i `super`-kaldet.

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

### Kasted en Fejl {#throwerror}

Giv kun metadata til konstruktøren. Standardbeskeden, der blev angivet, da klassen blev defineret, bruges.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Registrer Lokalitetsspecifikke Beskeder {#registermessage}

Brug `setErrorMessage`-funktionen til at knytte en fejlklasse til lokalitetsspecifikke beskeder.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Skift Lokalitet {#switchlocale}

Når du ændrer sproget med Valibots `setGlobalConfig`, returnerer `error.message` den besked, der svarer til det pågældende sprog.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

Standardsproget er `"en"`, når intet sprog er angivet via `setGlobalConfig`. Derfor bør standardbeskeden være skrevet på engelsk.
