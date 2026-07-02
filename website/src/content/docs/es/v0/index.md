---
title: Descripción general
description: i18n-error-base es una clase de error base que se integra con la configuración de idioma global de Valibot para cambiar dinámicamente los mensajes de error según la configuración regional.
---

i18n-error-base es una clase de error base que se integra con la configuración de idioma global de Valibot para cambiar dinámicamente los mensajes de error según la configuración regional.

## Instalación {#install}

```sh
pnpm add i18n-error-base
```

## Requisitos {#requirements}

[Valibot](https://valibot.dev) v1 o superior es necesario como dependencia directa.

## Uso básico {#basicusage}

### Definir una clase de error {#defineerrorclass}

Extienda `I18nErrorBase` para crear su propia clase de error. El argumento de tipo `TMeta` especifica el tipo de metadatos asociados con el error.

El constructor solo acepta `meta` y `ErrorOptions`, y define el mensaje predeterminado en inglés en la llamada a `super`.

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

### Lanzar un error {#throwerror}

Pase solo los metadatos al constructor. Se utiliza el mensaje predeterminado definido al crear la clase.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Registrar mensajes específicos por idioma {#registermessage}

Use la función `setErrorMessage` para asociar una clase de error con mensajes específicos de una configuración regional.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Cambiar de idioma {#switchlocale}

Cuando cambie el idioma usando `setGlobalConfig` de Valibot, acceder a `error.message` devuelve el mensaje correspondiente a ese idioma.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

El idioma predeterminado es `"en"` cuando no se especifica ningún idioma mediante `setGlobalConfig`. Por lo tanto, el mensaje predeterminado debe estar escrito en inglés.
