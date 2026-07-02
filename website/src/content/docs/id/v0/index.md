---
title: Ikhtisar
description: i18n-error-base adalah kelas dasar error yang terintegrasi dengan konfigurasi bahasa global Valibot untuk secara dinamis mengganti pesan error berdasarkan locale.
---

i18n-error-base adalah kelas dasar error yang terintegrasi dengan konfigurasi bahasa global Valibot untuk secara dinamis mengganti pesan error berdasarkan locale.

## Instalasi {#install}

```sh
pnpm add i18n-error-base
```

## Persyaratan {#requirements}

[Valibot](https://valibot.dev) v1 atau yang lebih baru diperlukan sebagai dependency peer.

## Penggunaan Dasar {#basicusage}

### Mendefinisikan Kelas Error {#defineerrorclass}

Perluas `I18nErrorBase` untuk membuat kelas error Anda sendiri. Argumen tipe `TMeta` menentukan jenis metadata yang terkait dengan error.

Konstruktor hanya menerima `meta` dan `ErrorOptions`, serta mendefinisikan pesan default bahasa Inggris di pemanggilan `super`.

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

### Melempar Error {#throwerror}

Berikan hanya metadata ke konstruktor. Pesan default yang ditentukan saat mendefinisikan kelas akan digunakan.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### Mendaftarkan Pesan Spesifik Lokal {#registermessage}

Gunakan fungsi `setErrorMessage` untuk mengaitkan kelas error dengan pesan spesifik lokal.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### Mengganti Lokal {#switchlocale}

Ketika Anda mengubah bahasa menggunakan `setGlobalConfig` Valibot, mengakses `error.message` akan mengembalikan pesan yang sesuai dengan bahasa tersebut.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

Bahasa default adalah `"en"` ketika tidak ada bahasa yang ditentukan melalui `setGlobalConfig`. Oleh karena itu, pesan default harus ditulis dalam bahasa Inggris.
