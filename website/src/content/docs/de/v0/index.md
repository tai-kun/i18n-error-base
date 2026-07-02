---
title: Übersicht
description: i18n-error-base ist eine Basis-Fehlerklasse, die sich in Valibots globale Sprachkonfiguration einbindet, um Fehlermeldungen dynamisch basierend auf dem Gebietsschema zu wechseln.
---

i18n-error-base ist eine Basis-Fehlerklasse, die sich in Valibots globale Sprachkonfiguration einbindet, um Fehlermeldungen dynamisch basierend auf dem Gebietsschema zu wechseln.

## Installation {#install}

```sh
pnpm add i18n-error-base
```

## Voraussetzungen {#requirements}

[Valibot](https://valibot.dev) v1 oder höher wird als direkte Abhängigkeit benötigt.

## Grundlegende Verwendung {#basicusage}

### Eine Fehlerklasse definieren {#defineerrorclass}

Erweitern Sie `I18nErrorBase`, um eine eigene Fehlerklasse zu erstellen. Das Typargument `TMeta` gibt den Typ der mit dem Fehler verbundenen Metadaten an.

Der Konstruktor akzeptiert nur `meta` und `ErrorOptions` und definiert die standardmäßige englische Nachricht im `super`-Aufruf.

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

### Einen Fehler werfen {#throwerror}

Übergeben Sie nur die Metadaten an den Konstruktor. Die beim Definieren der Klasse angegebene Standardnachricht wird verwendet.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Gebietsschema-spezifische Nachrichten registrieren {#registermessage}

Verwenden Sie die Funktion `setErrorMessage`, um einer Fehlerklasse gebietsschema-spezifische Nachrichten zuzuordnen.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Gebietsschema wechseln {#switchlocale}

Wenn Sie die Sprache mit Valibots `setGlobalConfig` ändern, gibt der Zugriff auf `error.message` die Nachricht in dieser Sprache zurück.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

Die Standardsprache ist `"en"`, wenn keine Sprache über `setGlobalConfig` angegeben wird. Daher sollte die Standardnachricht auf Englisch verfasst sein.
