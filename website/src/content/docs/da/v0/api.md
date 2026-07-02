---
title: API Reference
description: Reference til klasser, funktioner og typer leveret af i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

En basisklasse, der udvider `Error`. Alle internationaliserede fejlklasser bør udvide denne klasse.

### Typeargumenter {#i18nerrorbase-templates}

| Argument | Standard            | Beskrivelse                                                                                                              |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `TMeta`  | `ErrorMeta \| undefined` | Typen af metadata knyttet til fejlen. Angiv en objekttype, der udvider `{ readonly [prop: string]: unknown }`.            |

### Konstruktør {#i18nerrorbase-constructor}

Basisklassens konstruktør har følgende signatur. Typisk definerer underklasser deres egen konstruktør og kalder `super` internt.

#### Når `TMeta` ikke er `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parameter   | Type                              | Beskrivelse                                                                                                  |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | Metadata knyttet til fejlen.                                                                                  |
| `message`   | `string \| MessageFactory<TMeta>` | Fejlmeddelelsen eller en funktion, der modtager metadata og genererer en meddelelse.                          |
| `options`   | `ErrorOptions` (valgfri)          | Indstillinger, der sendes til `Error`-konstruktøren. Bruges til at angive `cause`.                            |

#### Når `TMeta` er `undefined` {#i18nerrorbase-tmeta-undefined}

For fejlklasser, der ikke kræver metadata, kan meddelelsen sendes direkte som det første argument til konstruktøren.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parameter   | Type                              | Beskrivelse                                                                                                  |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | Fejlmeddelelsen eller en funktion, der modtager metadata og genererer en meddelelse.                          |
| `options`   | `ErrorOptions` (valgfri)          | Indstillinger, der sendes til `Error`-konstruktøren. Bruges til at angive `cause`.                            |

### Egenskaber {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Indeholder metadata sendt til konstruktøren. Når `TMeta` er `undefined`, er dette `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

En dynamisk getter, der returnerer fejlmeddelelsen i henhold til den aktuelle sprogindstilling. Denne egenskab er enumererbar.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Når `cause` sendes i konstruktørens indstillinger, opbevares den i `error.cause`. Denne egenskab er polyfyldt, selvom JavaScript-runtime ikke understøtter `cause` indbygget.

### Statiske Egenskaber

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Et præfiks, der sættes foran meddelelsen. Tilsidesæt dette i underklasser for at bruge det.

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

Når `prefix` bruges sammen med lokalitetsspecifikke beskeder, sættes præfikset foran den oversatte eller reservebesked.

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

Registrerer en lokalitetsspecifik besked for en bestemt fejlklasse.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parameter   | Type                            | Beskrivelse                                                                                                                                 |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | Konstruktøren for den fejlklasse, der skal registreres besked for. Kun klasser, der udvider `I18nErrorBase`, kan angives.                   |
| `message`   | `string \| ((meta) => string)`  | Fejlmeddelelsen eller en funktion, der modtager metadata og genererer en meddelelse. Hvis en streng sendes, konverteres den automatisk til en funktion, der returnerer den streng. |
| `lang`      | `string \| Iterable<string>`    | Sprogkoden. Kan være en enkelt streng eller en iterabel som et array for at registrere flere sprog på én gang.                               |

At kalde igen for et allerede registreret sprog overskriver den eksisterende besked.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Typer {#types}

### ErrorMeta {#errormeta}

Typedefinitionen for metadata. Har en skrivebeskyttet indekssignatur.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Typen af en fabriksfunktion, der genererer fejlmeddelelser.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Typen for `Error`-konstruktørens indstillinger. Har en `cause`-egenskab.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

En tuple-type af parametre, der sendes til konstruktøren. Dens struktur ændres afhængigt af, om `TMeta` er `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Typen af den konstruktør, der kan angives som det første argument til `setErrorMessage`. At sende en klasse, der ikke udvider `I18nErrorBase`, resulterer i en typefejl.
