---
title: Visão Geral
description: i18n-error-base é uma classe base de erro que se integra com a configuração global de idioma do Valibot para alternar dinamicamente as mensagens de erro com base no locale.
---

i18n-error-base é uma classe base de erro que se integra com a configuração global de idioma do Valibot para alternar dinamicamente as mensagens de erro com base no locale.

## Instalação {#install}

```sh
pnpm add i18n-error-base
```

## Requisitos {#requirements}

[Valibot](https://valibot.dev) v1 ou superior é necessário como dependência par.

## Uso Básico {#basicusage}

### Definir uma Classe de Erro {#defineerrorclass}

Estenda `I18nErrorBase` para criar sua própria classe de erro. O argumento de tipo `TMeta` especifica o tipo de metadados associados ao erro.

O construtor aceita apenas `meta` e `ErrorOptions`, e define a mensagem padrão em inglês na chamada `super`.

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

### Lançar um Erro {#throwerror}

Passe apenas os metadados para o construtor. A mensagem padrão especificada ao definir a classe é usada.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Registrar Mensagens Específicas de Locale {#registermessage}

Use a função `setErrorMessage` para associar uma classe de erro a mensagens específicas de locale.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Alternar Locale {#switchlocale}

Quando você altera o idioma usando `setGlobalConfig` do Valibot, acessar `error.message` retorna a mensagem correspondente àquele idioma.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

O idioma padrão é `"en"` quando nenhum idioma é especificado via `setGlobalConfig`. Portanto, a mensagem padrão deve ser escrita em inglês.
