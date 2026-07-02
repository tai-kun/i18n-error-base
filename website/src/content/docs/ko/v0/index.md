---
title: 개요
description: i18n-error-base는 Valibot의 전역 언어 설정과 통합하여 로케일에 따라 오류 메시지를 동적으로 전환하는 기본 오류 클래스입니다.
---

i18n-error-base는 Valibot의 전역 언어 설정과 통합하여 로케일에 따라 오류 메시지를 동적으로 전환하는 기본 오류 클래스입니다.

## 설치 {#install}

```sh
pnpm add i18n-error-base
```

## 요구 사항 {#requirements}

[Valibot](https://valibot.dev) v1 이상이 피어 종속성으로 필요합니다.

## 기본 사용법 {#basicusage}

### 오류 클래스 정의 {#defineerrorclass}

`I18nErrorBase`를 확장하여 자신만의 오류 클래스를 만드세요. 타입 인수 `TMeta`는 오류와 관련된 메타데이터의 타입을 지정합니다.

생성자는 `meta`와 `ErrorOptions`만 허용하며, `super` 호출에서 기본 영어 메시지를 정의합니다.

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

### 오류 던지기 {#throwerror}

생성자에 메타데이터만 전달하세요. 클래스를 정의할 때 지정한 기본 메시지가 사용됩니다.

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### 로케일별 메시지 등록 {#registermessage}

`setErrorMessage` 함수를 사용하여 오류 클래스를 로케일별 메시지와 연결하세요.

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### 로케일 전환 {#switchlocale}

Valibot의 `setGlobalConfig`를 사용하여 언어를 변경하면 `error.message`에 접근할 때 해당 언어의 메시지가 반환됩니다.

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

`setGlobalConfig`를 통해 언어가 지정되지 않은 경우 기본 언어는 `"en"`입니다. 따라서 기본 메시지는 영어로 작성해야 합니다.
