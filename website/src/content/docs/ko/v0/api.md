---
title: API 참조
description: i18n-error-base가 제공하는 클래스, 함수 및 타입에 대한 참조 문서입니다.
---

## I18nErrorBase {#i18nerrorbase}

`Error`를 확장하는 기본 클래스입니다. 모든 국제화된 오류 클래스는 이 클래스를 확장해야 합니다.

### 타입 인수 {#i18nerrorbase-templates}

| 인수     | 기본값                   | 설명                                                                                          |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| `TMeta`  | `ErrorMeta \| undefined` | 오류와 관련된 메타데이터의 타입입니다. `{ readonly [prop: string]: unknown }`를 확장하는 객체 타입을 지정하세요. |

### 생성자 {#i18nerrorbase-constructor}

기본 클래스 생성자는 다음과 같은 시그니처를 가집니다. 일반적으로 서브클래스는 자체 생성자를 정의하고 내부에서 `super`를 호출합니다.

#### `TMeta`가 `undefined`가 아닌 경우 {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| 매개변수    | 타입                              | 설명                                                                                          |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `meta`      | `TMeta`                           | 오류와 관련된 메타데이터입니다.                                                               |
| `message`   | `string \| MessageFactory<TMeta>` | 오류 메시지 또는 메타데이터를 받아 메시지를 생성하는 함수입니다.                              |
| `options`   | `ErrorOptions` (선택 사항)        | `Error` 생성자에 전달되는 옵션입니다. `cause`를 지정하는 데 사용됩니다.                       |

#### `TMeta`가 `undefined`인 경우 {#i18nerrorbase-tmeta-undefined}

메타데이터가 필요하지 않은 오류 클래스의 경우 메시지를 생성자의 첫 번째 인수로 직접 전달할 수 있습니다.

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| 매개변수    | 타입                              | 설명                                                                                          |
| ----------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `message`   | `string \| MessageFactory<TMeta>` | 오류 메시지 또는 메타데이터를 받아 메시지를 생성하는 함수입니다.                              |
| `options`   | `ErrorOptions` (선택 사항)        | `Error` 생성자에 전달되는 옵션입니다. `cause`를 지정하는 데 사용됩니다.                       |

### 속성 {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

생성자에 전달된 메타데이터를 보관합니다. `TMeta`가 `undefined`인 경우 이 값은 `undefined`입니다.

#### `error.message: string` {#i18nerrorbase-message}

현재 언어 설정에 따라 오류 메시지를 반환하는 동적 getter입니다. 이 속성은 열거 가능합니다.

#### `error.cause: unknown` {#i18nerrorbase-cause}

생성자 옵션에 `cause`가 전달되면 `error.cause`에 보관됩니다. JavaScript 런타임이 기본적으로 `cause`를 지원하지 않더라도 이 속성은 폴리필됩니다.

### 정적 속성

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

메시지 앞에 추가되는 접두사입니다. 서브클래스에서 이 속성을 재정의하여 사용하세요.

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

`prefix`를 로케일별 메시지와 함께 사용하면 접두사가 번역된 메시지 또는 대체 메시지 앞에 추가됩니다.

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

특정 오류 클래스에 대한 로케일별 메시지를 등록합니다.

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| 매개변수     | 타입                            | 설명                                                                                                                                                           |
| ------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference`  | `I18nErrorBaseConstructor`      | 메시지를 등록할 오류 클래스의 생성자입니다. `I18nErrorBase`를 확장하는 클래스만 지정할 수 있습니다.                                                             |
| `message`    | `string \| ((meta) => string)`  | 오류 메시지 또는 메타데이터를 받아 메시지를 생성하는 함수입니다. 문자열이 전달되면 해당 문자열을 반환하는 함수로 자동 변환됩니다.                               |
| `lang`       | `string \| Iterable<string>`    | 언어 코드입니다. 단일 문자열이거나 여러 언어를 동시에 등록하기 위한 배열과 같은 반복 가능한 객체일 수 있습니다.                                                |

이미 등록된 언어에 대해 다시 호출하면 기존 메시지를 덮어씁니다.

```ts
// 단일 언어 등록
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// 여러 언어를 동시에 등록
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// 문자열로 등록
setErrorMessage(ValidationError, "something went wrong", "en");
```

## 타입 {#types}

### ErrorMeta {#errormeta}

메타데이터의 타입 정의입니다. 읽기 전용 인덱스 시그니처를 가집니다.

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

오류 메시지를 생성하는 팩토리 함수의 타입입니다.

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` 생성자 옵션의 타입입니다. `cause` 속성을 가집니다.

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

생성자에 전달되는 매개변수의 튜플 타입입니다. `TMeta`가 `undefined`인지 여부에 따라 구조가 변경됩니다.

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

`setErrorMessage`의 첫 번째 인수로 지정할 수 있는 생성자의 타입입니다. `I18nErrorBase`를 확장하지 않는 클래스를 전달하면 타입 오류가 발생합니다.
