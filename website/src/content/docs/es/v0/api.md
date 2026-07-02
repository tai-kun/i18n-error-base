---
title: Referencia de la API
description: Referencia de clases, funciones y tipos proporcionados por i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Una clase base que extiende `Error`. Todas las clases de error internacionalizadas deben extender esta clase.

### Argumentos de tipo {#i18nerrorbase-templates}

| Argumento | Por defecto              | Descripción                                                                                                                 |
| --------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `TMeta`   | `ErrorMeta \| undefined` | El tipo de metadatos asociados con el error. Especifique un tipo objeto que extienda `{ readonly [prop: string]: unknown }`. |

### Constructor {#i18nerrorbase-constructor}

El constructor de la clase base tiene la siguiente firma. Normalmente, las subclases definen su propio constructor y llaman a `super` internamente.

#### Cuando `TMeta` no es `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parámetro  | Tipo                              | Descripción                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                           | Los metadatos asociados con el error.                                                                         |
| `message`  | `string \| MessageFactory<TMeta>` | El mensaje de error, o una función que recibe metadatos y genera un mensaje.                                  |
| `options`  | `ErrorOptions` (opcional)         | Opciones pasadas al constructor de `Error`. Se usa para especificar `cause`.                                  |

#### Cuando `TMeta` es `undefined` {#i18nerrorbase-tmeta-undefined}

Para clases de error que no requieren metadatos, el mensaje se puede pasar directamente como el primer argumento del constructor.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parámetro  | Tipo                              | Descripción                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | El mensaje de error, o una función que recibe metadatos y genera un mensaje.                                  |
| `options`  | `ErrorOptions` (opcional)         | Opciones pasadas al constructor de `Error`. Se usa para especificar `cause`.                                  |

### Propiedades {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Contiene los metadatos pasados al constructor. Cuando `TMeta` es `undefined`, esto es `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Un getter dinámico que devuelve el mensaje de error según la configuración de idioma actual. Esta propiedad es enumerable.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Cuando se pasa `cause` en las opciones del constructor, se almacena en `error.cause`. Esta propiedad cuenta con un polyfill incluso si el entorno de ejecución de JavaScript no soporta `cause` de forma nativa.

### Propiedades estáticas

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Un prefijo que se antepone al inicio del mensaje. Sobrescriba esto en las subclases para usarlo.

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

Cuando se usa `prefix` junto con mensajes específicos de una configuración regional, el prefijo se antepone al mensaje traducido o alternativo.

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

Registra un mensaje específico de una configuración regional para una clase de error concreta.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parámetro  | Tipo                             | Descripción                                                                                                                                                      |
| ---------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference`| `I18nErrorBaseConstructor`       | El constructor de la clase de error para la que registrar el mensaje. Solo se pueden especificar clases que extienden `I18nErrorBase`.                           |
| `message`  | `string \| ((meta) => string)`   | El mensaje de error, o una función que recibe metadatos y genera un mensaje. Si se pasa una cadena, se convierte automáticamente a una función que devuelve esa cadena. |
| `lang`     | `string \| Iterable<string>`     | El código de idioma. Puede ser una sola cadena o un iterable como un arreglo para registrar varios idiomas a la vez.                                             |

Llamar de nuevo para un idioma ya registrado sobrescribe el mensaje existente.

```ts
// Registrar un solo idioma
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Registrar varios idiomas a la vez
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Registrar con una cadena
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Tipos {#types}

### ErrorMeta {#errormeta}

La definición de tipo para los metadatos. Tiene una firma de índice de solo lectura.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

El tipo de una función fábrica que genera mensajes de error.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

El tipo para las opciones del constructor de `Error`. Tiene una propiedad `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Un tipo de tupla con los parámetros pasados al constructor. Su estructura cambia dependiendo de si `TMeta` es `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

El tipo del constructor que se puede especificar como primer argumento de `setErrorMessage`. Pasar una clase que no extienda `I18nErrorBase` resulta en un error de tipo.
