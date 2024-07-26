const chai = require("chai");
const chaiHttp = require("chai-http");
const { assert } = chai;
const server = require("../server.js");

chai.use(chaiHttp);

const Translator = require("../components/translator.js");
const translate = new Translator();

suite("Functional Tests", () => {
  const tests = [
    {
      name: "Translation with text and locale field",
      payload: {
        text: "Mangoes are my favorite fruit.",
        locale: "american-to-british",
      },
      expected: {
        status: 200,
        translation:
          'Mangoes are my <span class="highlight">favourite</span> fruit.',
      },
    },
    {
      name: "Translation with text and invalid locale field",
      payload: {
        text: "Mangoes are my favorite fruit.",
        locale: "american-to-russia",
      },
      expected: { status: 200, error: "Invalid value for locale field" },
    },
    {
      name: "Translation with missing text field",
      payload: { locale: "american-to-british" },
      expected: { status: 200, error: "Required field(s) missing" },
    },
    {
      name: "Translation with missing locale field",
      payload: { text: "Mangoes are my favorite fruit." },
      expected: { status: 200, error: "Required field(s) missing" },
    },
    {
      name: "Translation with empty text",
      payload: { text: "", locale: "american-to-british" },
      expected: { status: 200, error: "No text to translate" },
    },
    {
      name: "Translation with text that needs no translation",
      payload: {
        text: "Mangoes are my favorite fruit.",
        locale: "british-to-american",
      },
      expected: { status: 200, translation: "Everything looks good to me!" },
    },
  ];

  tests.forEach(({ name, payload, expected }) => {
    test(name, (done) => {
      chai
        .request(server)
        .keepOpen()
        .post("/api/translate")
        .send(payload)
        .end((err, res) => {
          assert.equal(res.status, expected.status, "Api response");
          if (expected.translation) {
            assert.equal(
              res.body.translation,
              expected.translation,
              "translation field",
            );
          }
          if (expected.error) {
            assert.equal(res.body.error, expected.error, "error field");
          }
          done();
        });
    });
  });
});
