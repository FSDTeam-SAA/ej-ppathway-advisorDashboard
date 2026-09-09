const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Transpile the real component in memory; no Next dev/build artifacts are touched.
const file = path.resolve(__dirname, '../app/components/SessionReview.tsx');
const compiled = new Module(file, module);
compiled.filename = file;
compiled.paths = module.paths;
compiled._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, file);
const { SessionReview, getSessionReview } = compiled.exports;
const render = (session) => renderToStaticMarkup(React.createElement(SessionReview, { session }));

test('populated review object renders comment and its own rating without crashing', () => {
  const html = render({ review: { _id: 'review-id', rating: 5, comment: 'Good session' }, rating: 1 });
  assert.match(html, /Good session/);
  assert.match(html, /5\.0 \/ 5/);
  assert.doesNotMatch(html, /review-id|\[object Object\]/);
});
test('legacy string comment uses session rating', () => {
  const html = render({ review: 'Helpful', rating: 4 });
  assert.match(html, /Helpful/);
  assert.match(html, /4\.0 \/ 5/);
});
test('rating-only review displays the no-comment message', () => {
  assert.match(render({ review: { rating: 3, comment: '' } }), /No written review submitted/);
  assert.match(render({ rating: 2 }), /2\.0 \/ 5/);
});
test('missing review hides the review card', () => {
  assert.equal(render({ review: null }), '');
  assert.equal(getSessionReview({}).ratingLabel, 'Not rated');
});
test('malformed fields never reach React as objects', () => {
  const html = render({ review: { comment: { text: 'invalid' }, rating: {} }, rating: NaN });
  assert.match(html, /No written review submitted/);
  assert.match(html, /Not rated/);
});
test('unpopulated review ID is not displayed as a comment', () => {
  const id = '6aa12eef68e0a20aa68b8631';
  assert.doesNotMatch(render({ review: id }), new RegExp(id));
});
