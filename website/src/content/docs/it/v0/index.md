---
title: Panoramica
description: i18n-error-base è una classe base di errore che si integra con la configurazione della lingua globale di Valibot per cambiare dinamicamente i messaggi di errore in base alla locale.
---

i18n-error-base è una classe base di errore che si integra con la configurazione della lingua globale di Valibot per cambiare dinamicamente i messaggi di errore in base alla locale.

## Installazione {#install}

```sh
pnpm add i18n-error-base
```

## Requisiti {#requirements}

[Valibot](https://valibot.dev) v1 o successivo è richiesto come dipendenza peer.

## Utilizzo di base {#basicusage}

### Definire una classe di errore {#defineerrorclass}

Estendi `I18nErrorBase` per creare la tua classe di errore. L'argomento tipo `TMeta` specifica il tipo di metadati associati all'errore.

Il costruttore accetta solo `meta` e `ErrorOptions`, e definisce il messaggio predefinito in inglese nella chiamata a `super`.

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

### Lanciare un errore {#throwerror}

Passa solo i metadati al costruttore. Viene utilizzato il messaggio predefinito specificato quando si definisce la classe.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Registrare messaggi specifici per locale {#registermessage}

Usa la funzione `setErrorMessage` per associare una classe di errore a messaggi specifici per la locale.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Cambiare locale {#switchlocale}

Quando cambi la lingua usando `setGlobalConfig` di Valibot, l'accesso a `error.message` restituisce il messaggio corrispondente a quella lingua.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

La lingua predefinita è `"en"` quando nessuna lingua è specificata tramite `setGlobalConfig`. Pertanto, il messaggio predefinito dovrebbe essere scritto in inglese.
