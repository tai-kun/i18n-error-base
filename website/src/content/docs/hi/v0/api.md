---
title: API संदर्भ
description: i18n-error-base द्वारा प्रदान की गई कक्षाओं, फ़ंक्शनों और प्रकारों के लिए संदर्भ।
---

## I18nErrorBase {#i18nerrorbase}

एक आधार वर्ग जो `Error` का विस्तार करता है। सभी अंतर्राष्ट्रीयकृत त्रुटि वर्गों को इस वर्ग का विस्तार करना चाहिए।

### प्रकार तर्क {#i18nerrorbase-templates}

| तर्क      | डिफ़ॉल्ट             | विवरण                                                                                                              |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `TMeta`   | `ErrorMeta \| undefined` | त्रुटि से संबंधित मेटाडेटा का प्रकार। एक ऑब्जेक्ट प्रकार निर्दिष्ट करें जो `{ readonly [prop: string]: unknown }` का विस्तार करता है। |

### कंस्ट्रक्टर {#i18nerrorbase-constructor}

आधार वर्ग के कंस्ट्रक्टर का निम्नलिखित हस्ताक्षर है। आमतौर पर, उपवर्ग अपना स्वयं का कंस्ट्रक्टर परिभाषित करते हैं और आंतरिक रूप से `super` को कॉल करते हैं।

#### जब `TMeta` `undefined` न हो {#i18nerrorbase-tmeta-defined}

```ts
new MyError(meta: TMeta, message: string | MessageFactory<TMeta>, options?: ErrorOptions)
```

| पैरामीटर   | प्रकार                            | विवरण                                                                                               |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `meta`     | `TMeta`                           | त्रुटि से संबद्ध मेटाडेटा।                                                                          |
| `message`  | `string \| MessageFactory<TMeta>` | त्रुटि संदेश, या एक फ़ंक्शन जो मेटाडेटा प्राप्त करता है और संदेश उत्पन्न करता है।                |
| `options`  | `ErrorOptions` (वैकल्पिक)         | `Error` कंस्ट्रक्टर को पास किए गए विकल्प। `cause` निर्दिष्ट करने के लिए उपयोग किया जाता है।      |

#### जब `TMeta` `undefined` हो {#i18nerrorbase-tmeta-undefined}

उन त्रुटि वर्गों के लिए जिन्हें मेटाडेटा की आवश्यकता नहीं है, संदेश को सीधे कंस्ट्रक्टर के पहले तर्क के रूप में पास किया जा सकता है।

```ts
class SimpleError extends I18nErrorBase<undefined> {
  public constructor(message?: string, options?: ErrorOptions) {
    super(undefined, message ?? "Something went wrong", options);
  }
}
```

| पैरामीटर   | प्रकार                            | विवरण                                                                                               |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `message`  | `string \| MessageFactory<TMeta>` | त्रुटि संदेश, या एक फ़ंक्शन जो मेटाडेटा प्राप्त करता है और संदेश उत्पन्न करता है।                |
| `options`  | `ErrorOptions` (वैकल्पिक)         | `Error` कंस्ट्रक्टर को पास किए गए विकल्प। `cause` निर्दिष्ट करने के लिए उपयोग किया जाता है।      |

### गुण {#i18nerrorbase-properties}

#### `error.meta: TMeta` {#i18nerrorbase-meta}

कंस्ट्रक्टर को पास किए गए मेटाडेटा को रखता है। जब `TMeta` `undefined` होता है, तो यह `undefined` होता है।

#### `error.message: string` {#i18nerrorbase-message}

एक डायनामिक गेटर जो वर्तमान भाषा सेटिंग के अनुसार त्रुटि संदेश लौटाता है। यह गुण गणनीय (enumerable) है।

#### `error.cause: unknown` {#i18nerrorbase-cause}

जब कंस्ट्रक्टर विकल्पों में `cause` पास किया जाता है, तो यह `error.cause` में रखा जाता है। यह गुण पॉलीफ़िल किया जाता है, भले ही जावास्क्रिप्ट रनटाइम मूल रूप से `cause` का समर्थन न करता हो।

### स्थैतिक गुण

#### `MyError.prefix?: string` {#i18nerrorbase-static-prefix}

संदेश की शुरुआत में जोड़ा जाने वाला उपसर्ग। इसका उपयोग करने के लिए उपवर्गों में इसे ओवरराइड करें।

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

जब `prefix` का उपयोग लोकेल-विशिष्ट संदेशों के साथ किया जाता है, तो उपसर्ग अनुवादित या फ़ॉलबैक संदेश में जोड़ दिया जाता है।

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

किसी विशिष्ट त्रुटि वर्ग के लिए लोकेल-विशिष्ट संदेश पंजीकृत करता है।

```ts
function setErrorMessage<TReference extends I18nErrorBaseConstructor>(
  reference: TReference,
  message: string | ((meta: InstanceType<TReference>["meta"]) => string),
  lang: string | Iterable<string>,
): void;
```

| पैरामीटर    | प्रकार                            | विवरण                                                                                                                                           |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference` | `I18nErrorBaseConstructor`        | त्रुटि वर्ग का कंस्ट्रक्टर जिसके लिए संदेश पंजीकृत करना है। केवल `I18nErrorBase` का विस्तार करने वाले वर्ग निर्दिष्ट किए जा सकते हैं।        |
| `message`   | `string \| ((meta) => string)`    | त्रुटि संदेश, या एक फ़ंक्शन जो मेटाडेटा प्राप्त करता है और संदेश उत्पन्न करता है। यदि एक स्ट्रिंग पास की जाती है, तो यह स्वचालित रूप से उस स्ट्रिंग को लौटाने वाले फ़ंक्शन में परिवर्तित हो जाती है। |
| `lang`      | `string \| Iterable<string>`      | भाषा कोड। एक एकल स्ट्रिंग या एक साथ कई भाषाओं को पंजीकृत करने के लिए ऐरे जैसा इटरेबल हो सकता है।                                             |

पहले से पंजीकृत भाषा के लिए पुनः कॉल करने पर मौजूदा संदेश ओवरराइट हो जाता है।

```ts
// एकल भाषा पंजीकृत करें
setErrorMessage(ValidationError, ({ field }) => `field ${field} is invalid`, "en");

// एक साथ कई भाषाएँ पंजीकृत करें
setErrorMessage(ValidationError, ({ field }) => `フィールド ${field} が不正です`, ["ja", "ja-JP"]);

// स्ट्रिंग के साथ पंजीकृत करें
setErrorMessage(ValidationError, "something went wrong", "en");
```

## प्रकार {#types}

### ErrorMeta {#errormeta}

मेटाडेटा के लिए प्रकार परिभाषा। इसमें केवल-पढ़ने के लिए इंडेक्स सिग्नेचर है।

```ts
type ErrorMeta = {
  readonly [prop: string]: unknown;
};
```

### MessageFactory {#messagefactory}

फ़ैक्टरी फ़ंक्शन का प्रकार जो त्रुटि संदेश उत्पन्न करता है।

```ts
interface MessageFactory<TMeta> {
  (meta: TMeta): string;
}
```

### ErrorOptions {#erroroptions}

`Error` कंस्ट्रक्टर विकल्पों के लिए प्रकार। इसमें एक `cause` गुण है।

```ts
type ErrorOptions = { readonly cause?: unknown };
```

### I18nErrorBaseParams {#i18nerrorbaseparams}

कंस्ट्रक्टर को पास किए गए मापदंडों का एक टपल प्रकार। इसकी संरचना इस आधार पर बदलती है कि `TMeta` `undefined` है या नहीं।

### I18nErrorBaseConstructor {#i18nerrorbaseconstructor}

कंस्ट्रक्टर का प्रकार जिसे `setErrorMessage` के पहले तर्क के रूप में निर्दिष्ट किया जा सकता है। ऐसा वर्ग पास करना जो `I18nErrorBase` का विस्तार नहीं करता है, टाइप त्रुटि उत्पन्न करता है।
