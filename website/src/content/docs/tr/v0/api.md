---
title: API Referansı
description: i18n-error-base tarafından sağlanan sınıflar, işlevler ve türler için referans.
---

## I18nErrorBase {#i18nerrorbase}

`Error`'u genişleten bir temel sınıf. Tüm uluslararasılaştırılmış hata sınıfları bu sınıfı genişletmelidir.

### Tür Argümanları {#i18nerrorbase-templates}

| Argüman  | Varsayılan           | Açıklama                                                                                                           |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `TMeta`  | `ErrorMeta \| undefined` | Hatayla ilişkili meta verinin türü. `{ readonly [prop: string]: unknown }`'u genişleten bir nesne türü belirtin.     |

### Yapıcı {#i18nerrorbase-constructor}

Temel sınıf yapıcısı aşağıdaki imzaya sahiptir. Alt sınıflar genellikle kendi yapıcılarını tanımlar ve dahili olarak `super`'i çağırır.

#### `TMeta` `undefined` olmadığında {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parametre  | Tür                               | Açıklama                                                                                                   |
| ---------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                           | Hatayla ilişkili meta veri.                                                                                |
| `message`  | `string \| MessageFactory<TMeta>` | Hata mesajı veya meta veriyi alıp mesaj oluşturan bir işlev.                                               |
| `options`  | `ErrorOptions` (isteğe bağlı)     | `Error` yapıcısına iletilen seçenekler. `cause` belirtmek için kullanılır.                                  |

#### `TMeta` `undefined` olduğunda {#i18nerrorbase-tmeta-undefined}

Meta veri gerektirmeyen hata sınıfları için mesaj, doğrudan yapıcının ilk argümanı olarak iletilebilir.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parametre  | Tür                               | Açıklama                                                                                                   |
| ---------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | Hata mesajı veya meta veriyi alıp mesaj oluşturan bir işlev.                                               |
| `options`  | `ErrorOptions` (isteğe bağlı)     | `Error` yapıcısına iletilen seçenekler. `cause` belirtmek için kullanılır.                                  |

### Özellikler {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Yapıcıya iletilen meta veriyi tutar. `TMeta` `undefined` olduğunda bu da `undefined`'tır.

#### `error.message: string` {#i18nerrorbase-message}

Geçerli dil ayarına göre hata mesajını döndüren dinamik bir getter. Bu özellik numaralandırılabilirdir.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Yapıcı seçeneklerinde `cause` iletildiğinde, `error.cause` içinde tutulur. JavaScript çalışma zamanı `cause`'u yerel olarak desteklemese bile bu özellik polyfill ile sağlanır.

### Statik Özellikler

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Mesajın başına eklenen bir ön ek. Kullanmak için bunu alt sınıflarda geçersiz kılın.

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

`prefix`, yerel aya özel mesajlarla birlikte kullanıldığında, ön ek çevrilmiş veya yedek mesajın başına eklenir.

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

Belirli bir hata sınıfı için yerel aya özel bir mesaj kaydeder.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parametre   | Tür                              | Açıklama                                                                                                                              |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`       | Mesajın kaydedileceği hata sınıfının yapıcısı. Yalnızca `I18nErrorBase`'i genişleten sınıflar belirtilebilir.                         |
| `message`   | `string \| ((meta) => string)`   | Hata mesajı veya meta veriyi alıp mesaj oluşturan bir işlev. Bir dize iletilirse, otomatik olarak o diziyi döndüren bir işleve dönüştürülür. |
| `lang`      | `string \| Iterable<string>`     | Dil kodu. Tek bir dize veya aynı anda birden çok dil kaydetmek için dizi gibi yinelenebilir bir nesne olabilir.                        |

Zaten kayıtlı bir dil için tekrar çağırmak, mevcut mesajın üzerine yazar.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Türler {#types}

### ErrorMeta {#errormeta}

Meta veri için tür tanımı. Salt okunur bir indeks imzasına sahiptir.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Hata mesajları oluşturan bir fabrika işlevinin türü.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` yapıcı seçenekleri için tür. Bir `cause` özelliğine sahiptir.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Yapıcıya iletilen parametrelerin bir demet türü. Yapısı, `TMeta`'nın `undefined` olup olmamasına bağlı olarak değişir.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

`setErrorMessage`'in ilk argümanı olarak belirtilebilen yapıcının türü. `I18nErrorBase`'i genişletmeyen bir sınıf iletmek, tür hatasına neden olur.
