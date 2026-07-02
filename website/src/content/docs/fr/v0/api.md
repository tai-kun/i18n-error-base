---
title: Référence de l'API
description: Référence des classes, fonctions et types fournis par i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Une classe de base qui étend `Error`. Toutes les classes d'erreur internationalisées doivent étendre cette classe.

### Arguments de type {#i18nerrorbase-templates}

| Argument | Par défaut              | Description                                                                                                                 |
| -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | Le type des métadonnées associées à l'erreur. Spécifiez un type d'objet qui étend `{ readonly [prop: string]: unknown }`.    |

### Constructeur {#i18nerrorbase-constructor}

Le constructeur de la classe de base a la signature suivante. En général, les sous-classes définissent leur propre constructeur et appellent `super` en interne.

#### Quand `TMeta` n'est pas `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Paramètre  | Type                              | Description                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                           | Les métadonnées associées à l'erreur.                                                                         |
| `message`  | `string \| MessageFactory<TMeta>` | Le message d'erreur, ou une fonction qui reçoit les métadonnées et génère un message.                         |
| `options`  | `ErrorOptions` (optionnel)        | Options passées au constructeur d'`Error`. Utilisé pour spécifier `cause`.                                    |

#### Quand `TMeta` est `undefined` {#i18nerrorbase-tmeta-undefined}

Pour les classes d'erreur qui ne nécessitent pas de métadonnées, le message peut être passé directement comme premier argument du constructeur.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Paramètre  | Type                              | Description                                                                                                   |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | Le message d'erreur, ou une fonction qui reçoit les métadonnées et génère un message.                         |
| `options`  | `ErrorOptions` (optionnel)        | Options passées au constructeur d'`Error`. Utilisé pour spécifier `cause`.                                    |

### Propriétés {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Contient les métadonnées passées au constructeur. Quand `TMeta` est `undefined`, ceci est `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Un accesseur dynamique qui retourne le message d'erreur selon la configuration linguistique actuelle. Cette propriété est énumérable.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Lorsque `cause` est passé dans les options du constructeur, il est conservé dans `error.cause`. Cette propriété est dotée d'une prothèse même si l'environnement d'exécution JavaScript ne prend pas nativement en charge `cause`.

### Propriétés statiques

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Un préfixe ajouté au début du message. Remplacez-le dans les sous-classes pour l'utiliser.

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

Lorsque `prefix` est utilisé avec des messages spécifiques à une locale, le préfixe est ajouté au message traduit ou de remplacement.

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

Enregistre un message spécifique à une locale pour une classe d'erreur donnée.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Paramètre   | Type                             | Description                                                                                                                                                           |
| ----------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Le constructeur de la classe d'erreur pour laquelle enregistrer le message. Seules les classes étendant `I18nErrorBase` peuvent être spécifiées.                       |
| `message`   | `string \| ((meta) => string)`   | Le message d'erreur, ou une fonction qui reçoit les métadonnées et génère un message. Si une chaîne est passée, elle est automatiquement convertie en une fonction qui retourne cette chaîne. |
| `lang`      | `string \| Iterable<string>`     | Le code de langue. Peut être une simple chaîne ou un itérable tel qu'un tableau pour enregistrer plusieurs langues à la fois.                                         |

Un nouvel appel pour une langue déjà enregistrée remplace le message existant.

```ts
// Enregistrer une seule langue
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Enregistrer plusieurs langues à la fois
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Enregistrer avec une chaîne
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Types {#types}

### ErrorMeta {#errormeta}

La définition de type pour les métadonnées. Possède une signature d'index en lecture seule.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Le type d'une fonction d'usine qui génère des messages d'erreur.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Le type pour les options du constructeur d'`Error`. Possède une propriété `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Un type de tuple des paramètres passés au constructeur. Sa structure change selon que `TMeta` est `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Le type du constructeur qui peut être spécifié comme premier argument de `setErrorMessage`. Passer une classe qui n'étend pas `I18nErrorBase` entraîne une erreur de type.
