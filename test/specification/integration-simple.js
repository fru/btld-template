import { assert } from 'chai';
import { init } from '../../dist/btld-template';

function getShadowDom(tag) {
  return document.getElementsByTagName(tag).shadowRoot;
}

let example1 = `
  <btld-template tag="test-integration-simple1">
    <template>
      <div class="test t1" test="Test1 {t1}"></div>
      <div class="test t2" test="Test2 {t2}"></div>
      <div class="test t3" test="Test3 {t3}"></div>
    </template>
  </btld-template>

  <test-integration-simple1></test-integration-simple1>
`;

describe('Integration', () => {
  describe('Simple 1', () => {
    it('Shadow dom + Dom attr without state', () => {
      document.body.innerHTML = example1;
      init();

      //let dom1 = getShadowDom('test-integration-simple1');
      //let found = dom1.querySelectorAll('.t1');

      //assert.equal(found.getAttribute('test'), 'Test1 ');
    });
  });
});
