---
title: Referência da API
description: Referência para classes, funções e tipos fornecidos pelo i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Uma classe base que estende `Error`. Todas as classes de erro internacionalizadas devem estender esta classe.

### Argumentos de Tipo {#i18nerrorbase-templates}

| Argumento | Padrão               | Descrição                                                                                                              |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | O tipo de metadados associados ao erro. Especifique um tipo de objeto que estenda `{ readonly [prop: string]: unknown }`. |

### Construtor {#i18nerrorbase-constructor}

O construtor da classe base tem a seguinte assinatura. Normalmente, subclasses definem seu próprio construtor e chamam `super` internamente.

#### Quando `TMeta` não é `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parâmetro   | Tipo                              | Descrição                                                                                           |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | Os metadados associados ao erro.                                                                    |
| `message`   | `string \| MessageFactory<TMeta>` | A mensagem de erro, ou uma função que recebe metadados e gera uma mensagem.                         |
| `options`   | `ErrorOptions` (opcional)         | Opções passadas ao construtor `Error`. Usado para especificar `cause`.                              |

#### Quando `TMeta` é `undefined` {#i18nerrorbase-tmeta-undefined}

Para classes de erro que não requerem metadados, a mensagem pode ser passada diretamente como o primeiro argumento do construtor.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parâmetro   | Tipo                              | Descrição                                                                                           |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | A mensagem de erro, ou uma função que recebe metadados e gera uma mensagem.                         |
| `options`   | `ErrorOptions` (opcional)         | Opções passadas ao construtor `Error`. Usado para especificar `cause`.                              |

### Propriedades {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Armazena os metadados passados ao construtor. Quando `TMeta` é `undefined`, isto é `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Um getter dinâmico que retorna a mensagem de erro de acordo com a configuração de idioma atual. Esta propriedade é enumerável.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Quando `cause` é passado nas opções do construtor, ele é armazenado em `error.cause`. Esta propriedade é preenchida mesmo que o runtime JavaScript não suporte nativamente `cause`.

### Propriedades Estáticas

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Um prefixo adicionado ao início da mensagem. Sobrescreva isto em subclasses para usá-lo.

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

Quando `prefix` é usado junto com mensagens específicas de locale, o prefixo é adicionado à mensagem traduzida ou de fallback.

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

Registra uma mensagem específica de locale para uma classe de erro específica.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parâmetro   | Tipo                            | Descrição                                                                                                                             |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | O construtor da classe de erro para registrar a mensagem. Apenas classes que estendem `I18nErrorBase` podem ser especificadas.        |
| `message`   | `string \| ((meta) => string)`  | A mensagem de erro, ou uma função que recebe metadados e gera uma mensagem. Se uma string for passada, é automaticamente convertida em uma função que retorna essa string. |
| `lang`      | `string \| Iterable<string>`    | O código do idioma. Pode ser uma única string ou um iterável como um array para registrar vários idiomas de uma vez.                  |

Chamar novamente para um idioma já registrado sobrescreve a mensagem existente.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Tipos {#types}

### ErrorMeta {#errormeta}

A definição de tipo para metadados. Possui uma assinatura de índice somente leitura.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

O tipo de uma função fábrica que gera mensagens de erro.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

O tipo para opções do construtor `Error`. Possui uma propriedade `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Um tipo tupla de parâmetros passados ao construtor. Sua estrutura muda dependendo se `TMeta` é `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

O tipo do construtor que pode ser especificado como o primeiro argumento de `setErrorMessage`. Passar uma classe que não estende `I18nErrorBase` resulta em um erro de tipo.
