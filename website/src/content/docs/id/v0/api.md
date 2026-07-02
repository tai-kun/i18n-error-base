---
title: Referensi API
description: Referensi untuk kelas, fungsi, dan tipe yang disediakan oleh i18n-error-base.
---

## I18nErrorBase {#i18nerrorbase}

Kelas dasar yang memperluas `Error`. Semua kelas error yang diinternasionalisasi harus memperluas kelas ini.

### Argumen Tipe {#i18nerrorbase-templates}

| Argumen | Default               | Deskripsi                                                                                                           |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | Tipe metadata yang terkait dengan error. Tentukan tipe objek yang memperluas `{ readonly [prop: string]: unknown }`. |

### Konstruktor {#i18nerrorbase-constructor}

Konstruktor kelas dasar memiliki tanda tangan berikut. Biasanya, subclass mendefinisikan konstruktor mereka sendiri dan memanggil `super` secara internal.

#### Ketika `TMeta` bukan `undefined` {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| Parameter   | Tipe                              | Deskripsi                                                                                          |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | Metadata yang terkait dengan error.                                                                 |
| `message`   | `string \| MessageFactory<TMeta>` | Pesan error, atau fungsi yang menerima metadata dan menghasilkan pesan.                             |
| `options`   | `ErrorOptions` (opsional)         | Opsi yang diteruskan ke konstruktor `Error`. Digunakan untuk menentukan `cause`.                    |

#### Ketika `TMeta` adalah `undefined` {#i18nerrorbase-tmeta-undefined}

Untuk kelas error yang tidak memerlukan metadata, pesan dapat diteruskan langsung sebagai argumen pertama ke konstruktor.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| Parameter   | Tipe                              | Deskripsi                                                                                          |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | Pesan error, atau fungsi yang menerima metadata dan menghasilkan pesan.                             |
| `options`   | `ErrorOptions` (opsional)         | Opsi yang diteruskan ke konstruktor `Error`. Digunakan untuk menentukan `cause`.                    |

### Properti {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

Menyimpan metadata yang diteruskan ke konstruktor. Ketika `TMeta` adalah `undefined`, ini adalah `undefined`.

#### `error.message: string` {#i18nerrorbase-message}

Sebuah getter dinamis yang mengembalikan pesan error sesuai dengan pengaturan bahasa saat ini. Properti ini enumerable.

#### `error.cause: unknown` {#i18nerrorbase-cause}

Ketika `cause` diteruskan dalam opsi konstruktor, ia disimpan di `error.cause`. Properti ini di-polyfill meskipun runtime JavaScript tidak mendukung `cause` secara native.

### Properti Statis

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

Sebuah awalan yang ditambahkan ke awal pesan. Timpa ini di subclass untuk menggunakannya.

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

Ketika `prefix` digunakan bersama dengan pesan spesifik lokal, awalan ditambahkan ke pesan yang diterjemahkan atau pesan fallback.

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

Mendaftarkan pesan spesifik lokal untuk kelas error tertentu.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| Parameter   | Tipe                            | Deskripsi                                                                                                                           |
| ----------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`      | Konstruktor kelas error untuk mendaftarkan pesan. Hanya kelas yang memperluas `I18nErrorBase` yang dapat ditentukan.                |
| `message`   | `string \| ((meta) => string)`  | Pesan error, atau fungsi yang menerima metadata dan menghasilkan pesan. Jika string diteruskan, secara otomatis dikonversi menjadi fungsi yang mengembalikan string tersebut. |
| `lang`      | `string \| Iterable<string>`    | Kode bahasa. Dapat berupa string tunggal atau iterable seperti array untuk mendaftarkan beberapa bahasa sekaligus.                   |

Memanggil lagi untuk bahasa yang sudah terdaftar akan menimpa pesan yang ada.

```ts
// Register a single language
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// Register multiple languages at once
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// Register with a string
setErrorMessage(ValidationError, "something went wrong", "en");
```

## Tipe {#types}

### ErrorMeta {#errormeta}

Definisi tipe untuk metadata. Memiliki signature indeks read-only.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

Tipe dari fungsi factory yang menghasilkan pesan error.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

Tipe untuk opsi konstruktor `Error`. Memiliki properti `cause`.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

Tipe tuple dari parameter yang diteruskan ke konstruktor. Strukturnya berubah tergantung pada apakah `TMeta` adalah `undefined`.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

Tipe konstruktor yang dapat ditentukan sebagai argumen pertama dari `setErrorMessage`. Melewatkan kelas yang tidak memperluas `I18nErrorBase` menghasilkan error tipe.
