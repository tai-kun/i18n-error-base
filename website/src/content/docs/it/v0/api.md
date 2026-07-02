---
title: Riferimento API
description: Riferimento per classi, funzioni e tipi forniti da i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Una classe base che estende `Error`. Tutte le classi di errore internazionalizzate dovrebbero estendere questa classe.

### Argomenti di tipo {#i18nerrorbase-templates}

| Argomento | Predefinito           | Descrizione                                                                                                                |
| --------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `TMeta`   | `ErrorMeta \| undefined` | Il tipo di metadati associati all'errore. Specifica un tipo oggetto che estende `{ readonly [prop: string]: unknown }`. |

### Costruttore {#i18nerrorbase-constructor}

Il costruttore della classe base ha la seguente firma. Tipicamente, le sottoclassi definiscono il proprio costruttore e chiamano `super` internamente.

#### Quando `TMeta` non è `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parametro  | Tipo                             | Descrizione                                                                                               |
| ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                          | I metadati associati all'errore.                                                                          |
| `message`  | `string \| MessageFactory<TMeta>` | Il messaggio di errore, o una funzione che riceve i metadati e genera un messaggio.                       |
| `options`  | `ErrorOptions` (opzionale)       | Opzioni passate al costruttore di `Error`. Usato per specificare `cause`.                                 |

#### Quando `TMeta` è `undefined` {#i18nerrorbase-tmeta-undefined}

Per le classi di errore che non richiedono metadati, il messaggio può essere passato direttamente come primo argomento al costruttore.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parametro  | Tipo                             | Descrizione                                                                                               |
| ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | Il messaggio di errore, o una funzione che riceve i metadati e genera un messaggio.                       |
| `options`  | `ErrorOptions` (opzionale)       | Opzioni passate al costruttore di `Error`. Usato per specificare `cause`.                                 |

### Proprietà {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Contiene i metadati passati al costruttore. Quando `TMeta` è `undefined`, questo è `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Un getter dinamico che restituisce il messaggio di errore in base all'impostazione della lingua corrente. Questa proprietà è enumerabile.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Quando `cause` viene passato nelle opzioni del costruttore, viene conservato in `error.cause`. Questa proprietà viene polyfillata anche se il runtime JavaScript non supporta nativamente `cause`.

### Proprietà statiche

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Un prefisso anteposto all'inizio del messaggio. Sovrascrivilo nelle sottoclassi per utilizzarlo.

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

Quando `prefix` viene utilizzato insieme a messaggi specifici per la locale, il prefisso viene anteposto al messaggio tradotto o al messaggio di fallback.

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

Registra un messaggio specifico per una locale per una specifica classe di errore.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parametro   | Tipo                             | Descrizione                                                                                                                                                     |
| ----------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Il costruttore della classe di errore per cui registrare il messaggio. Possono essere specificate solo classi che estendono `I18nErrorBase`.                   |
| `message`   | `string \| ((meta) => string)`   | Il messaggio di errore, o una funzione che riceve i metadati e genera un messaggio. Se viene passata una stringa, viene automaticamente convertita in una funzione che restituisce quella stringa. |
| `lang`      | `string \| Iterable<string>`     | Il codice lingua. Può essere una singola stringa o un iterabile come un array per registrare più lingue contemporaneamente.                                    |

Chiamarlo nuovamente per una lingua già registrata sovrascrive il messaggio esistente.

```ts
// Registrare una singola lingua
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Registrare più lingue contemporaneamente
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Registrare con una stringa
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Tipi {#types}

### ErrorMeta {#errormeta}

La definizione del tipo per i metadati. Ha un indice di sola lettura.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Il tipo di una funzione factory che genera messaggi di errore.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Il tipo per le opzioni del costruttore di `Error`. Ha una proprietà `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Un tipo tupla dei parametri passati al costruttore. La sua struttura cambia a seconda che `TMeta` sia `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Il tipo del costruttore che può essere specificato come primo argomento di `setErrorMessage`. Passare una classe che non estende `I18nErrorBase` causa un errore di tipo.
