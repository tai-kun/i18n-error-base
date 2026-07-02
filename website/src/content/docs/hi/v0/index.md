---
title: अवलोकन
description: i18n-error-base एक आधार त्रुटि वर्ग है जो लोकेल के आधार पर त्रुटि संदेशों को गतिशील रूप से बदलने के लिए Valibot की वैश्विक भाषा कॉन्फ़िगरेशन के साथ एकीकृत होता है।
---

i18n-error-base एक आधार त्रुटि वर्ग है जो लोकेल के आधार पर त्रुटि संदेशों को गतिशील रूप से बदलने के लिए Valibot की वैश्विक भाषा कॉन्फ़िगरेशन के साथ एकीकृत होता है।

## स्थापना {#install}

```sh
pnpm add i18n-error-base
```

## आवश्यकताएँ {#requirements}

[Valibot](https://valibot.dev) v1 या बाद का संस्करण पीयर डिपेंडेंसी के रूप में आवश्यक है।

## मूल उपयोग {#basicusage}

### त्रुटि वर्ग परिभाषित करें {#defineerrorclass}

अपना स्वयं का त्रुटि वर्ग बनाने के लिए `I18nErrorBase` का विस्तार करें। टाइप आर्गुमेंट `TMeta` त्रुटि से संबंधित मेटाडेटा के प्रकार को निर्दिष्ट करता है।

कंस्ट्रक्टर केवल `meta` और `ErrorOptions` स्वीकार करता है, और `super` कॉल में डिफ़ॉल्ट अंग्रेज़ी संदेश परिभाषित करता है।

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

### त्रुटि फेंकना {#throwerror}

कंस्ट्रक्टर को केवल मेटाडेटा पास करें। वर्ग को परिभाषित करते समय निर्दिष्ट डिफ़ॉल्ट संदेश का उपयोग किया जाता है।

```ts
throw new ValidationError({ field: "email", value: "invalid" });
```

### लोकेल-विशिष्ट संदेश पंजीकृत करें {#registermessage}

लोकेल-विशिष्ट संदेशों के साथ त्रुटि वर्ग को संबद्ध करने के लिए `setErrorMessage` फ़ंक्शन का उपयोग करें।

```ts
import { setErrorMessage } from "i18n-error-base";

setErrorMessage(ValidationError, ({ field, value }) => `${field} の値が不正です: ${value}`, "ja");
```

### लोकेल बदलना {#switchlocale}

जब आप Valibot के `setGlobalConfig` का उपयोग करके भाषा बदलते हैं, तो `error.message` तक पहुँचने पर उस भाषा के अनुरूप संदेश वापस आता है।

```ts
import { setGlobalConfig } from "valibot";

const error = new ValidationError({ field: "email", value: "invalid" });

setGlobalConfig({ lang: "ja" });
console.log(error.message); // => "email の値が不正です: invalid"

setGlobalConfig({ lang: "en" });
console.log(error.message); // => "Invalid value for email: invalid"
```

जब `setGlobalConfig` के माध्यम से कोई भाषा निर्दिष्ट नहीं की जाती है तो डिफ़ॉल्ट भाषा `"en"` होती है। इसलिए, डिफ़ॉल्ट संदेश अंग्रेज़ी में लिखा जाना चाहिए।
