---
title: API-Referenz
description: Referenz für Klassen, Funktionen und Typen, die von i18n-error-base bereitgestellt werden.
---

## I18nErrorBase {#i18nerrorbase}

Eine Basisklasse, die `Error` erweitert. Alle internationalisierten Fehlerklassen sollten diese Klasse erweitern.

### Typargumente {#i18nerrorbase-templates}

| Argument | Standard              | Beschreibung                                                                                                              |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | Der Typ der mit dem Fehler verbundenen Metadaten. Geben Sie einen Objekttyp an, der `{ readonly [prop: string]: unknown }` erweitert. |

### Konstruktor {#i18nerrorbase-constructor}

Der Basisklassenkonstruktor hat die folgende Signatur. In der Regel definieren Unterklassen ihren eigenen Konstruktor und rufen intern `super` auf.

#### Wenn `TMeta` nicht `undefined` ist {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parameter   | Typ                              | Beschreibung                                                                                                  |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | Die mit dem Fehler verbundenen Metadaten.                                                                     |
| `message`   | `string \| MessageFactory<TMeta>` | Die Fehlernachricht oder eine Funktion, die Metadaten empfängt und eine Nachricht erzeugt.                     |
| `options`   | `ErrorOptions` (optional)         | Optionen, die an den `Error`-Konstruktor übergeben werden. Dient zur Angabe von `cause`.                       |

#### Wenn `TMeta` `undefined` ist {#i18nerrorbase-tmeta-undefined}

Für Fehlerklassen, die keine Metadaten benötigen, kann die Nachricht direkt als erstes Argument an den Konstruktor übergeben werden.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parameter   | Typ                              | Beschreibung                                                                                                  |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | Die Fehlernachricht oder eine Funktion, die Metadaten empfängt und eine Nachricht erzeugt.                     |
| `options`   | `ErrorOptions` (optional)         | Optionen, die an den `Error`-Konstruktor übergeben werden. Dient zur Angabe von `cause`.                       |

### Eigenschaften {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Enthält die an den Konstruktor übergebenen Metadaten. Wenn `TMeta` `undefined` ist, ist dies `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Ein dynamischer Getter, der die Fehlernachricht entsprechend der aktuellen Spracheinstellung zurückgibt. Diese Eigenschaft ist aufzählbar.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Wenn `cause` in den Konstruktoroptionen übergeben wird, wird es in `error.cause` gespeichert. Diese Eigenschaft wird polyfilliert, selbst wenn die JavaScript-Laufzeit `cause` nicht nativ unterstützt.

### Statische Eigenschaften

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Ein Präfix, das dem Anfang der Nachricht vorangestellt wird. Überschreiben Sie dies in Unterklassen, um es zu verwenden.

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

Wenn `prefix` zusammen mit gebietsschema-spezifischen Nachrichten verwendet wird, wird das Präfix der übersetzten oder Fallback-Nachricht vorangestellt.

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

Registriert eine gebietsschema-spezifische Nachricht für eine bestimmte Fehlerklasse.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parameter   | Typ                             | Beschreibung                                                                                                                                                         |
| ----------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Der Konstruktor der Fehlerklasse, für die die Nachricht registriert werden soll. Es können nur Klassen angegeben werden, die `I18nErrorBase` erweitern.               |
| `message`   | `string \| ((meta) => string)`   | Die Fehlernachricht oder eine Funktion, die Metadaten empfängt und eine Nachricht erzeugt. Wenn ein String übergeben wird, wird er automatisch in eine Funktion umgewandelt, die diesen String zurückgibt. |
| `lang`      | `string \| Iterable<string>`     | Der Sprachcode. Kann ein einzelner String oder ein Iterable wie ein Array sein, um mehrere Sprachen auf einmal zu registrieren.                                      |

Ein erneuter Aufruf für eine bereits registrierte Sprache überschreibt die vorhandene Nachricht.

```ts
// Eine einzelne Sprache registrieren
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Mehrere Sprachen auf einmal registrieren
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Mit einem String registrieren
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Typen {#types}

### ErrorMeta {#errormeta}

Die Typdefinition für Metadaten. Hat eine reine Lese-Index-Signatur.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Der Typ einer Factory-Funktion, die Fehlernachrichten erzeugt.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Der Typ für `Error`-Konstruktoroptionen. Hat eine `cause`-Eigenschaft.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Ein Tupeltyp der an den Konstruktor übergebenen Parameter. Seine Struktur ändert sich je nachdem, ob `TMeta` `undefined` ist.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Der Typ des Konstruktors, der als erstes Argument von `setErrorMessage` angegeben werden kann. Die Übergabe einer Klasse, die `I18nErrorBase` nicht erweitert, führt zu einem Typfehler.
