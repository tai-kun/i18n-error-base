---
title: Genel Bakış
description: i18n-error-base, Valibot'un küresel dil yapılandırmasıyla entegre olarak yerel ayara göre hata mesajlarını dinamik şekilde değiştiren temel bir hata sınıfıdır.
---

i18n-error-base, Valibot'un küresel dil yapılandırmasıyla entegre olarak yerel ayara göre hata mesajlarını dinamik şekilde değiştiren temel bir hata sınıfıdır.

## Kurulum {#install}

```sh
pnpm add i18n-error-base
```

## Gereksinimler {#requirements}

Peer bağımlılık olarak [Valibot](https://valibot.dev) v1 veya üzeri gereklidir.

## Temel Kullanım {#basicusage}

### Bir Hata Sınıfı Tanımlayın {#defineerrorclass}

Kendi hata sınıfınızı oluşturmak için `I18nErrorBase`'i genişletin. `TMeta` tür argümanı, hatayla ilişkili meta verinin türünü belirtir.

Yapıcı yalnızca `meta` ve `ErrorOptions` kabul eder ve `super` çağrısında varsayılan İngilizce mesajı tanımlar.

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

### Bir Hata Fırlatın {#throwerror}

Yapıcıya yalnızca meta veriyi iletin. Sınıf tanımlanırken belirtilen varsayılan mesaj kullanılır.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Yerel Aya Özel Mesajlar Kaydedin {#registermessage}

Bir hata sınıfını yerel aya özel mesajlarla ilişkilendirmek için `setErrorMessage` işlevini kullanın.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Yerel Ay Değiştirin {#switchlocale}

Valibot'un `setGlobalConfig`'ini kullanarak dili değiştirdiğinizde, `error.message` özelliğine erişmek o dile karşılık gelen mesajı döndürür.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

`setGlobalConfig` üzerinden hiçbir dil belirtilmediğinde varsayılan dil `"en"`'dir. Bu nedenle varsayılan mesaj İngilizce yazılmalıdır.
