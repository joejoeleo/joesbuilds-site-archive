// State and race checks against the real gallery script, without a browser.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const source = readFileSync(resolve(__dirname, '../src/gallery.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function fixture({ quiet = true } = {}) {
  const waiting = new Map();
  const ready = new Set();
  class Element {
    constructor() {
      this.children = []; this.dataset = {}; this.attributes = {}; this.listeners = {};
      this.hidden = false; this.textContent = ''; this.offsetLeft = 4; this.offsetWidth = 90;
      this.style = { setProperty() {}, removeProperty() {} };
      this.classList = { add() {}, contains: () => false };
    }
    setAttribute(key, value) { this.attributes[key] = value; }
    getAttribute(key) { return this.attributes[key]; }
    removeAttribute(key) { delete this.attributes[key]; }
    append(child) { child.remove(); this.children.push(child); child.parent = this; }
    prepend(child) { child.remove(); this.children.unshift(child); child.parent = this; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    get firstElementChild() { return this.children[0]; }
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
    emit(type, detail) { (this.listeners[type] || []).forEach(callback => callback({ detail })); }
    animate() { return { finished: Promise.resolve(), cancel() {} }; }
  }
  class Image extends Element {
    constructor() { super(); this.src = ''; this.alt = ''; }
    decode() {
      if (ready.has(this.src)) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const callbacks = waiting.get(this.src) || [];
        callbacks.push({ resolve, reject }); waiting.set(this.src, callbacks);
      });
    }
  }
  const stage = new Element();
  const image = new Image(); image.src = './built.jpg'; image.alt = 'Actual table'; image.setAttribute('src', image.src);
  ready.add(image.src);
  const film = new Element(); film.setAttribute('poster', './film.jpg'); film.plays = 0; film.pauses = 0;
  film.play = () => { film.plays++; return Promise.resolve(); };
  film.pause = () => { film.pauses++; };
  const caption = new Element(); caption.textContent = 'Completed build / Mark 3';
  const buttons = ['built', 'inside', 'cad', 'film'].map((key, i) => {
    const button = new Element(); button.dataset.view = key; button.offsetLeft = 4 + i * 95;
    button.setAttribute('aria-pressed', String(i === 0)); return button;
  });
  const tabs = new Element(); tabs.querySelectorAll = () => buttons;
  const panel = new Element(); panel.classList.contains = () => true;
  const document = new Element(); document.hidden = false;
  document.body = { classList: { contains: () => quiet } };
  document.getElementById = id => ({ 'specimen-media': stage, 'specimen-image': image, 'specimen-film': film, 'view-label': caption, 'launch-infinity': panel }[id]);
  document.querySelector = selector => selector === '.view-switch' ? tabs : null;
  document.createElement = () => new Element();
  const window = { addEventListener() {} };
  vm.runInNewContext(source, { document, window, Image, setTimeout, clearTimeout, console });
  return {
    stage, caption, buttons, film, document,
    click(key) { buttons.find(button => button.dataset.view === key).emit('click'); },
    complete(fragment, fail = false) {
      const key = [...waiting.keys()].find(key => key.includes(fragment));
      assert.ok(key, `Expected a pending load for ${fragment}`);
      if (!fail) ready.add(key);
      waiting.get(key).forEach(callback => fail ? callback.reject(new Error('Offline')) : callback.resolve());
      waiting.delete(key);
    },
    active() { return buttons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.view; },
    visible() { return stage.children.filter(layer => !layer.hidden); }
  };
}

test('slow loads keep the current image visible until a replacement is ready', async () => {
  const f = fixture(); f.click('inside');
  assert.equal(f.active(), 'built'); assert.equal(f.visible().length, 1);
  assert.equal(f.visible()[0].firstElementChild.src, './built.jpg');
  f.complete('mark-3-frame'); await flush();
  assert.equal(f.active(), 'inside'); assert.equal(f.visible().length, 1);
  assert.match(f.visible()[0].firstElementChild.src, /mark-3-frame/);
});

test('a stale response cannot replace the most recent selection', async () => {
  const f = fixture(); f.click('inside'); f.click('cad');
  f.complete('mark-3-cad'); await flush();
  f.complete('mark-3-frame'); await flush();
  assert.equal(f.active(), 'cad'); assert.match(f.visible()[0].firstElementChild.src, /mark-3-cad/);
  assert.equal(f.visible().length, 1);
});

test('selecting the current tab cancels a pending different view', async () => {
  const f = fixture(); f.click('inside'); f.click('built');
  f.complete('mark-3-frame'); await flush();
  assert.equal(f.active(), 'built'); assert.equal(f.visible()[0].firstElementChild.src, './built.jpg');
  assert.equal(f.stage.getAttribute('aria-busy'), undefined);
});

test('a failed load keeps usable media and supports a retry', async () => {
  const f = fixture(); f.click('inside'); f.complete('mark-3-frame', true); await flush();
  assert.equal(f.active(), 'built'); assert.match(f.caption.textContent, /unavailable/);
  f.click('inside'); f.complete('mark-3-frame'); await flush();
  assert.equal(f.active(), 'inside'); assert.equal(f.visible().length, 1);
});

test('motion-off switches to the video poster without automatic playback', async () => {
  const f = fixture(); f.click('film'); f.complete('film.jpg'); await flush();
  assert.equal(f.active(), 'film'); assert.equal(f.film.plays, 0);
  f.click('built'); await flush();
  assert.equal(f.visible()[0].firstElementChild.src, './built.jpg');
});

test('animated film entry starts playback after transition and pauses on page hide', async () => {
  const f = fixture({ quiet: false }); f.click('film'); f.complete('film.jpg'); await flush();
  assert.equal(f.film.plays, 1); assert.equal(f.visible().length, 1);
  const pauses = f.film.pauses;
  f.document.hidden = true; f.document.emit('visibilitychange');
  assert.equal(f.film.pauses, pauses + 1);
});
