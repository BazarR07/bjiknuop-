const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

const britishToAmericanSpelling = Object.fromEntries(
  Object.entries(americanToBritishSpelling).map(([key, value]) => [value, key]),
);

const britishToAmericanTitles = Object.fromEntries(
  Object.entries(americanToBritishTitles).map(([key, value]) => [
    value,
    key.charAt(0).toUpperCase() + key.slice(1),
  ]),
);

Object.entries(americanToBritishTitles).forEach(([key, value]) => {
  americanToBritishTitles[key] = value.charAt(0).toUpperCase() + value.slice(1);
});
class Translator {
  Translator(text, locale) {
    let result = text;
    result = this.IsWord(result, locale);
    result = this.IsTitle(result, locale);
    result = this.IsTime(result, locale);
    return result === text ? "Everything looks good to me!" : result;
  }

  IsWord(text, locale) {
    let dictionary;
    if (locale === "american-to-british") {
      dictionary = { ...americanToBritishSpelling, ...americanOnly };
    } else if (locale === "british-to-american") {
      dictionary = { ...britishToAmericanSpelling, ...britishOnly };
    } else {
      return { error: `Invalid value for locale field` };
    }
    return text.replace(
      new RegExp(`\\b(${Object.keys(dictionary).join("|")})\\b`, "gi"),
      (match) =>
        `<span class="highlight">${dictionary[match.toLowerCase()] || match}</span>`,
    );
  }

  IsTitle(text, locale) {
    let pattern;
    let dictionary;
    if (locale === "american-to-british") {
      dictionary = americanToBritishTitles;

      pattern = new RegExp(
        `(${Object.keys(dictionary)
          .map((key, index) => {
            if (index !== Object.keys(dictionary).length - 1) {
              return key.slice(0, -1) + "\\.|";
            } else {
              return key.slice(0, -1) + "\\.";
            }
          })
          .join("")})`,
        "gi",
      );
    } else if (locale === "british-to-american") {
      dictionary = britishToAmericanTitles;

      pattern = new RegExp(
        `\\b(${Object.keys(dictionary).join("|")})\\b`,
        "gi",
      );
    } else {
      return { error: `Invalid value for locale field` };
    }

    const result = text.replace(
      pattern,
      (match) =>
        `<span class="highlight">${dictionary[match.toLowerCase()] || match}</span>`,
    );

    return result;
  }

  IsTime(text, locale) {
    if (locale === "american-to-british") {
      return text.replace(/(\d{1,2}):(\d{2})/g, (match, hour, minute) => {
        return `<span class="highlight">${hour + "." + minute}</span>`;
      });
    } else if (locale === "british-to-american") {
      return text.replace(/(\d{1,2})\.(\d{2})/g, (match, hour, minute) => {
        return `<span class="highlight">${hour + ":" + minute}</span>`;
      });
    } else {
      return { error: `Invalid value for locale field` };
    }
  }
}

module.exports = Translator;
