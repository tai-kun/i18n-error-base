---
title: Aperçu
description: i18n-error-base est une classe d'erreur de base qui s'intègre à la configuration linguistique globale de Valibot pour changer dynamiquement les messages d'erreur en fonction de la locale.
---

i18n-error-base est une classe d'erreur de base qui s'intègre à la configuration linguistique globale de Valibot pour changer dynamiquement les messages d'erreur en fonction de la locale.

## Installation {#install}

```sh
pnpm add i18n-error-base
```

## Prérequis {#requirements}

[Valibot](https://valibot.dev) v1 ou supérieur est requis comme dépendance directe.

## Utilisation de base {#basicusage}

### Définir une classe d'erreur {#defineerrorclass}

Étendez `I18nErrorBase` pour créer votre propre classe d'erreur. L'argument de type `TMeta` spécifie le type des métadonnées associées à l'erreur.

Le constructeur accepte uniquement `meta` et `ErrorOptions`, et définit le message anglais par défaut dans l'appel à `super`.

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

### Lever une erreur {#throwerror}

Passez uniquement les métadonnées au constructeur. Le message par défaut défini lors de la création de la classe est utilisé.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Enregistrer des messages spécifiques à une locale {#registermessage}

Utilisez la fonction `setErrorMessage` pour associer une classe d'erreur à des messages spécifiques à une locale.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Changer de locale {#switchlocale}

Lorsque vous changez la langue à l'aide de `setGlobalConfig` de Valibot, l'accès à `error.message` renvoie le message correspondant à cette langue.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

La langue par défaut est `"en"` lorsqu'aucune langue n'est spécifiée via `setGlobalConfig`. Par conséquent, le message par défaut doit être rédigé en anglais.
