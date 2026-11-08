/* =========================================================
   Vendi-Go — twelve-product catalogue, floating hero,
   one scroll-driven machine scene, cart, panels and menu.
   Native scrolling only: no Lenis, no scroll hijacking.
   ========================================================= */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = () => window.matchMedia('(min-width: 821px)').matches;
const inr = n => '₹' + n.toLocaleString('en-IN');
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- inventory ----------------
   servingG = label serving, the smallest dispensing unit.
   price = per serving. Values shown in the panel are the
   label figures that could be verified; nothing is invented.
------------------------------------------------ */
const PRODUCTS = [
  { id:'c4', brand:'Cellucor', name:'C4 Original', cat:'pre', flavour:'Icy Blue Razz',
    flavours:['Icy Blue Razz','Watermelon','Fruit Punch'], servingG:6.5, price:80, stock:42,
    img:'assets/products/c4.png', powder:'#f0c33c',
    caffeine:150, allergen:'None declared',
    note:'Label serving mixes with 250–300 ml water. Caffeine 150 mg per serving — avoid within 6 hours of sleep.' },

  { id:'ghost', brand:'GHOST', name:'Legend Pre-Workout', cat:'pre', flavour:'Sour Pink Lemonade',
    flavours:['Sour Pink Lemonade','Blue Raspberry','Warheads Green Apple'], servingG:12, price:120, stock:28,
    img:'assets/products/ghost-legend.png', powder:'#f08bb0',
    caffeine:250, allergen:'None declared',
    note:'Caffeine 250 mg per label serving. Not recommended within 6 hours of sleep, or alongside other stimulants.' },

  { id:'buckedup', brand:'Bucked Up', name:'Bucked Up Pre-Workout', cat:'pre', flavour:'Blue Raz',
    flavours:['Blue Raz','Watermelon','Rocket Pop'], servingG:10.7, price:140, stock:24,
    img:'assets/products/buckedup.webp', powder:'#3aa6e0',
    allergen:'None declared',
    note:'Labelled for focus, pump and strength. Caffeine content is not stated on this pack, so it is not shown here.' },

  { id:'totalwar', brand:'REDCON1', name:'Total War Pre-Workout', cat:'pre', flavour:'Rainbow Candy',
    flavours:['Rainbow Candy','Sour Gummy Bears','Blue Lemonade'], servingG:16.2, price:150, stock:18,
    img:'assets/products/totalwar.png', powder:'#e45da0',
    caffeine:325, allergen:'None declared',
    note:'Caffeine 325 mg per label serving — the highest dose on this menu. Avoid stacking with other stimulants.' },

  { id:'prejym', brand:'JYM', name:'Pre JYM', cat:'pre', flavour:'Fruit Punch',
    flavours:['Fruit Punch','Cherry Limeade','Grape'], servingG:26, price:170, stock:16,
    img:'assets/products/prejym.png', powder:'#c8342f',
    caffeine:300, allergen:'None declared',
    note:'Fully disclosed formula, 300 mg caffeine per label serving. Mix one serving with 350–450 ml water.' },

  { id:'onwhey', brand:'Optimum Nutrition', name:'Gold Standard 100% Whey', cat:'pro', flavour:'Double Rich Chocolate',
    flavours:['Double Rich Chocolate','Vanilla Ice Cream','Cookies & Cream'], servingG:30.4, price:100, stock:36,
    img:'assets/products/onwhey.webp', powder:'#c8a15a',
    protein:24, allergen:'Milk · soy',
    note:'24 g protein per label serving. Mix with 180–240 ml cold water or milk.' },

  { id:'iso100', brand:'Dymatize', name:'ISO100 Hydrolyzed', cat:'pro', flavour:'Birthday Cake',
    flavours:['Birthday Cake','Gourmet Chocolate','Fudge Brownie'], servingG:32, price:150, stock:22,
    img:'assets/products/iso100.webp', powder:'#d9c3a0',
    protein:25, allergen:'Milk · soy',
    note:'25 g hydrolysed whey isolate per label serving. Fast-absorbing; mixes clear.' },

  { id:'mbiozyme', brand:'MuscleBlaze', name:'Biozyme Performance Whey', cat:'pro', flavour:'Rich Chocolate',
    flavours:['Rich Chocolate','Chocolate Hazelnut','French Vanilla'], servingG:33, price:95, stock:30,
    img:'assets/products/mbiozyme.jpg', powder:'#7a4a2c',
    protein:25, allergen:'Milk · soy',
    note:'25 g protein per label serving from whey concentrate, with the brand’s enzyme blend for absorption.' },

  { id:'mpimpact', brand:'MyProtein', name:'Impact Whey Protein', cat:'pro', flavour:'Chocolate Smooth',
    flavours:['Chocolate Smooth','Vanilla','Strawberry Cream'], servingG:25, price:70, stock:40,
    img:'assets/products/mpimpact.jpg', powder:'#b57a4d',
    protein:21, allergen:'Milk · soy',
    note:'21 g protein per 25 g label serving. Mix with 150–250 ml water.' },

  { id:'isopure', brand:'Isopure', name:'Zero Carb Protein', cat:'pro', flavour:'Creamy Vanilla',
    flavours:['Creamy Vanilla','Dutch Chocolate','Cookies & Cream'], servingG:31, price:160, stock:20,
    img:'assets/products/isopure.png', powder:'#e6d9be',
    protein:25, allergen:'Milk',
    note:'25 g whey isolate with zero carbohydrates per label serving. Suitable for low-carb diets.' },

  { id:'oncrea', brand:'Optimum Nutrition', name:'Micronized Creatine', cat:'crea', flavour:'Strawberry Peach',
    flavours:['Strawberry Peach','Unflavoured'], servingG:5, price:20, stock:60,
    img:'assets/products/oncrea.png', powder:'#e6ded0',
    allergen:'None declared',
    note:'5 g creatine monohydrate per label serving. Mix with water or your shake.' },

  { id:'mtcrea', brand:'MuscleTech', name:'Platinum Creatine', cat:'crea', flavour:'Orange Splash',
    flavours:['Orange Splash','Unflavoured'], servingG:5, price:25, stock:48,
    img:'assets/products/mtcrea.png', powder:'#f08a1f',
    allergen:'None declared',
    note:'5 g creatine monohydrate per label serving. Flavoured; mix with 200 ml water.' }
];

const byId = id => PRODUCTS.find(p => p.id === id);
const byCat = cat => PRODUCTS.filter(p => p.cat === cat);

/* ---------------- markup ---------------- */
function packMarkup(p, cls = 'pack-shot') {
  return `<img class="${cls}" src="${p.img}" alt="${p.brand} ${p.name} packshot" loading="lazy" decoding="async">`;
}

function cardMarkup(p) {
  return `<article class="pcard pcard--tile" data-id="${p.id}">
    <button class="pc-info" type="button" data-open="${p.id}" aria-label="Product information for ${p.brand} ${p.name}">i</button>
    <div class="pc-art">${packMarkup(p)}</div>
    <div class="pc-body">
      <span class="pc-brand">${p.brand}</span>
      <h4 class="pc-name">${p.name}</h4>
      <p class="pc-meta"><b>${p.flavour}</b><span>·</span><span>${p.servingG} g serving</span></p>
      <div class="pc-stats">
        <span>${p.protein ? `${p.protein} g protein` : p.caffeine ? `${p.caffeine} mg caffeine` : 'Creatine monohydrate'}</span>
        <em>${p.stock} servings left</em>
      </div>
      <div class="pc-buy">
        <span class="pc-price">${inr(p.price)}<i>/ serving</i></span>
        <button class="pc-cart" type="button" data-cart="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>Add to cart</span>
        </button>
      </div>
    </div>
  </article>`;
}

function renderCatalogue(cat, swap = false) {
  const grid = $('#prodGrid');
  if (!grid) return;
  grid.innerHTML = byCat(cat).map(cardMarkup).join('');
  grid.dataset.cat = cat;
  $$('.catbtn').forEach(b => {
    const on = b.dataset.cat === cat;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
  });
  if (swap) {
    grid.classList.remove('is-swapping');
    void grid.offsetWidth;
    grid.classList.add('is-swapping');
  }
}

/* ---------------- kiosk ---------------- */
function kioskMarkup() {
  const hops = [
    ['PRE', 'C4 · GHOST', '#f0c33c', '54%'],
    ['PRO', 'ON · ISO100', '#cbb38a', '66%'],
    ['CREA', 'ON · MT', '#e4ded0', '42%']
  ].map(([label, brands, colour, level]) =>
    `<div class="k2-hop" style="--powder:${colour};--level:${level}">
       <div class="k2-jar"><span>${label}</span></div>
       <div class="k2-auger"></div>
       <b>${brands}</b>
     </div>`
  ).join('');

  const shelfIds = ['c4', 'ghost', 'onwhey', 'iso100', 'mbiozyme', 'oncrea'];
  const shelf = shelfIds.map(id => byId(id)).filter(Boolean);
  const thumbs = shelf.slice(0, 6).map(p =>
    `<img src="${p.img}" alt="" loading="lazy" decoding="async">`
  ).join('');

  return `<div class="k2">
    <div class="k2-top">
      <span class="k2-brand">VENDI<i>-GO</i></span>
      <span class="k2-tag">SERIES 01</span>
      <span class="k2-led"></span>
    </div>
    <div class="k2-body">
      <div class="k2-glass">
        <div class="k2-shelf">${shelf.map(p => `<div class="k2-slot"><img src="${p.img}" alt="" loading="lazy" decoding="async"></div>`).join('')}</div>
        <div class="k2-hoppers">${hops}</div>
        <div class="k2-bay">
          <div class="k2-nozzle"><i class="k2-stream"></i></div>
          <div class="k2-cup"><i></i></div>
          <div class="k2-tray"><span>COLLECT</span></div>
        </div>
        <div class="k2-door"><i class="k2-handle"></i></div>
      </div>
      <div class="k2-side">
        <div class="k2-screen">
          <b data-screen>READY</b>
          <div class="k2-thumbs">${thumbs}</div>
          <span>SELECT · PAY</span>
        </div>
        <div class="k2-pay"><i></i><em>CARD / UPI</em></div>
        <div class="k2-cups"><span></span><em>CUPS</em></div>
      </div>
    </div>
    <div class="k2-foot"><span>SEALED HOPPERS</span><span>LOAD-CELL VERIFIED</span><b>04</b></div>
  </div>`;
}

/* ---------------- hero floats ---------------- */
const FLOATS = [
  { id:'c4',       x:8,  y:30, s:1.06, r:-8, d:14, delay:-3 },
  { id:'ghost',    x:12, y:73, s:.82,  r:7,  d:12, delay:-6 },
  { id:'buckedup', x:4,  y:79, s:.66,  r:-4, d:17, delay:-1, far:true, sm:true },
  { id:'onwhey',   x:91, y:27, s:.95,  r:9,  d:13, delay:-4 },
  { id:'iso100',   x:85, y:65, s:.86,  r:-7, d:15, delay:-2 },
  { id:'mbiozyme', x:96, y:80, s:.64,  r:5,  d:18, delay:-7, far:true, sm:true },
  { id:'prejym',   x:7,  y:9,  s:.58,  r:4,  d:16, delay:-9, far:true, sm:true },
  { id:'totalwar', x:78, y:13, s:.6,   r:-5, d:19, delay:-5, far:true, sm:true }
];

function renderHeroFloats() {
  const field = $('#heroFloats');
  if (!field) return;
  field.innerHTML = FLOATS.map(f => {
    const p = byId(f.id);
    return `<div class="hf${f.far ? ' hf--far' : ''}${f.sm ? ' hf--sm' : ''}" data-float="${f.id}"
      style="--x:${f.x}%;--y:${f.y}%;--s:${f.s};--r:${f.r}deg;--d:${f.d}s;--delay:${f.delay}s">${packMarkup(p)}</div>`;
  }).join('');
}

function renderHeroShelf() {
  const host = $('#heroShelf');
  if (!host) return;
  host.innerHTML = ['c4', 'ghost', 'onwhey', 'iso100'].map(id => {
    const p = byId(id);
    return `<span class="hs-tile"><img src="${p.img}" alt="" loading="lazy" decoding="async"></span>`;
  }).join('');
}

/* ---------------- theme ---------------- */
function applyTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  const meta = $('#themeColor');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#EDECE6' : '#000000');
  const btn = $('#themeBtn');
  if (btn) btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  if (persist) { try { localStorage.setItem('vendigo-theme', theme); } catch (e) {} }
}

/* ---------------- one machine scene ---------------- */
const storyEl = $('[data-story]');
const storyMachine = $('.story-machine');
const storyCaps = storyEl ? $$('.cap', storyEl) : [];
const storyBar = $('#storyBar');
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

let targetP = 0;
let curP = 0;

function updateStory(p) {
  if (!storyEl) return;

  if (storyMachine) {
    const enter = smooth(p / 0.14);
    const scale = 0.9 + 0.1 * enter;
    const y = (1 - enter) * 16;
    storyMachine.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${scale.toFixed(3)})`;
    storyMachine.style.opacity = '1';

    const door = -66 * smooth((p - 0.08) / 0.22);
    const hopper = smooth((p - 0.26) / 0.12) * (1 - smooth((p - 0.44) / 0.1));
    const pour = smooth((p - 0.56) / 0.07) * (1 - smooth((p - 0.7) / 0.08));
    const fill = smooth((p - 0.6) / 0.18);

    storyMachine.style.setProperty('--door', `${door.toFixed(2)}deg`);
    storyMachine.style.setProperty('--shelf-dim', (1 - 0.72 * hopper).toFixed(3));
    storyMachine.style.setProperty('--pour', pour.toFixed(3));
    storyMachine.style.setProperty('--fill', fill.toFixed(3));

    storyMachine.classList.toggle('is-lit', p > 0.02);
    storyMachine.classList.toggle('is-open', door < -4);
    storyMachine.classList.toggle('is-hopper', hopper > 0.2);
    storyMachine.classList.toggle('is-dose', p > 0.3 && p < 0.66);

    const screen = storyMachine.querySelector('[data-screen]');
    if (screen) {
      const text = p < 0.08 ? 'READY' : p < 0.28 ? 'OPEN' : p < 0.44 ? 'HOPPERS' : p < 0.54 ? 'DOSING' : p < 0.74 ? 'POURING' : 'SELECT';
      if (screen.textContent !== text) screen.textContent = text;
    }
  }

  /* one caption at a time: a CSS fade, never two readable blocks */
  const activeCap = p < 0.3 ? 0 : p < 0.58 ? 1 : 2;
  storyCaps.forEach((c, i) => c.classList.toggle('is-on', i === activeCap));

  if (storyBar) storyBar.style.width = `${(p * 100).toFixed(1)}%`;
}

/* ---------------- cart + wallet ---------------- */
const bag = new Map();
const wallet = { balance: 1240 };
const log = [
  { label: 'Gold Standard Whey · 1 serving', amount: 100, when: 'Yesterday · 18:04' },
  { label: 'C4 Original · 2 servings', amount: 160, when: 'Tue · 07:22' }
];

const bagServings = () => Array.from(bag.values()).reduce((a, it) => a + it.qty, 0);
const bagTotal = () => Array.from(bag.entries()).reduce((sum, [id, it]) => sum + byId(id).price * it.qty, 0);
const bagGrams = () => Array.from(bag.entries()).reduce((sum, [id, it]) => sum + byId(id).servingG * it.qty, 0);

function renderBag() {
  const list = $('#bagList');
  const totalEl = $('#bagTotal');
  const countEl = $('#bagCount');
  const balanceEl = $('#walletBalance');
  const servingsEl = $('#bagServings');
  const clearBtn = $('#bagClear');
  if (!list) return;

  if (!bag.size) {
    list.innerHTML = `<p class="drawer-empty">Nothing chosen yet. Add a serving from the catalogue, adjust the quantity here, then pay to dispense.</p>`;
  } else {
    list.innerHTML = Array.from(bag.entries()).map(([id, it]) => {
      const p = byId(id);
      return `<div class="bag-item">
        <div class="bag-thumb">${packMarkup(p)}</div>
        <div class="bag-info">
          <b>${p.name}</b>
          <span>${it.flavour} · ${p.servingG} g per serving</span>
          <span class="bag-sub">${inr(p.price)} × ${it.qty} = ${inr(p.price * it.qty)}</span>
        </div>
        <div class="bag-qty">
          <button type="button" data-dec="${id}" aria-label="Remove one serving of ${p.name}">−</button>
          <span>${it.qty}</span>
          <button type="button" data-inc="${id}" aria-label="Add one serving of ${p.name}">+</button>
        </div>
        <button class="bag-remove" type="button" data-remove="${id}" aria-label="Remove ${p.name} from cart">✕</button>
      </div>`;
    }).join('');
  }

  if (totalEl) totalEl.textContent = inr(bagTotal());
  if (countEl) countEl.textContent = String(bagServings());
  if (servingsEl) servingsEl.textContent = `${bagServings()} serving${bagServings() === 1 ? '' : 's'}`;
  if (balanceEl) balanceEl.textContent = inr(wallet.balance);
  if (clearBtn) clearBtn.hidden = !bag.size;
}

function renderLog() {
  const host = $('#vendLog');
  if (!host) return;
  host.innerHTML = log.slice(0, 4).map(l => `<li><b>${l.label}</b><i>−${inr(l.amount)}</i><span>${l.when}</span></li>`).join('');
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2800);
}

function addToBag(id, qty = 1, flavour) {
  const p = byId(id);
  const cur = bag.get(id);
  const nextFlavour = flavour || (cur && cur.flavour) || p.flavour;
  bag.set(id, { qty: (cur ? cur.qty : 0) + qty, flavour: nextFlavour });
  renderBag();
  toast(`${qty} serving${qty > 1 ? 's' : ''} of ${p.name} added · ${inr(p.price * qty)}`);
}

function removeFromBag(id) {
  const cur = bag.get(id);
  if (!cur) return;
  if (cur.qty <= 1) bag.delete(id); else bag.set(id, { ...cur, qty: cur.qty - 1 });
  renderBag();
}

/* ---------------- product panel ---------------- */
const sheet = { id: null, qty: 1, flavour: null };
let lastFocus = null;

function sheetMarkup(p) {
  const rows = [
    ['Serving size', `${p.servingG} g`],
    p.protein ? ['Protein', `${p.protein} g`] : null,
    p.caffeine ? ['Caffeine', `${p.caffeine} mg`] : null,
    ['Allergens', p.allergen || 'Not declared'],
    ['Availability', `${p.stock} servings in this machine`],
    ['Price', `${inr(p.price)} per serving`]
  ].filter(Boolean).map(([k, v]) => `<div class="spec-row"><span>${k}</span><b>${v}</b></div>`).join('');

  return `<div class="sheet-top">
      <div>
        <span class="eyebrow">${p.brand}</span>
        <h3>${p.name}</h3>
        <p class="pc-meta">${p.flavour}</p>
      </div>
      <button class="sheet-close" type="button" data-close-sheet aria-label="Close product details">✕</button>
    </div>
    <div class="sheet-grid">
      <div class="sheet-art">${packMarkup(p)}<span class="sheet-badge">Packshot · ${p.brand}</span></div>
      <div>
        <div class="serve-row">
          <div class="serve-card"><span>Price</span><strong>${inr(p.price)}</strong><em>per serving</em></div>
          <div class="serve-card"><span>Label serving</span><strong>${p.servingG} g</strong><em>${p.protein ? `${p.protein} g protein` : p.caffeine ? `${p.caffeine} mg caffeine` : 'creatine monohydrate'}</em></div>
        </div>
        <span class="eyebrow">Flavour</span>
        <div class="flavours">
          ${p.flavours.map(f => `<button class="flav${f === sheet.flavour ? ' is-on' : ''}" type="button" data-flav="${f}">${f}</button>`).join('')}
        </div>
        <span class="eyebrow">Servings</span>
        <div class="sheet-qty">
          <button type="button" data-qty="-1" aria-label="One fewer serving">−</button>
          <b>${sheet.qty}</b>
          <span>${(p.servingG * sheet.qty).toFixed(1)} g total</span>
          <button type="button" data-qty="1" aria-label="One more serving">+</button>
        </div>
        <div class="spec-rows">${rows}</div>
        <p class="sheet-note">${p.note}</p>
        <p class="sheet-flag"><i></i> Label data shown; no tub is sold or dispensed</p>
        <button class="btn btn--accent sheet-add" type="button" data-sheet-add>Add ${inr(p.price * sheet.qty)} to cart</button>
      </div>
    </div>`;
}

function renderSheet() {
  const p = byId(sheet.id);
  const card = $('#sheetCard');
  if (!p || !card) return;
  card.innerHTML = sheetMarkup(p);
}

function openSheet(id) {
  const el = $('#sheet');
  if (!el) return;
  sheet.id = id;
  sheet.qty = 1;
  sheet.flavour = byId(id).flavour;
  lastFocus = document.activeElement;
  renderSheet();
  el.hidden = false;
  document.body.style.overflow = 'hidden';
  const close = $('.sheet-close', el);
  if (close) close.focus();
}

function closeSheet() {
  const el = $('#sheet');
  if (!el || el.hidden) return;
  el.hidden = true;
  if (!dispenseOpen) document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ---------------- information menu ---------------- */
const INFO = {
  about: {
    title: 'About Vendi-Go',
    body: `<p>Vendi-Go is a concept for a self-service supplement kiosk. Instead of buying a tub, you pay for the label serving you actually want — one scoop of pre-workout before a session, one shake after it, one 5 g dose of creatine.</p>
      <p>The kiosk keeps branded packs on display for identification while the dispensing hardware works from sealed bulk hoppers. That means a menu of twelve products without twelve open tubs behind the glass.</p>
      <p>This site is a storefront concept, not a live vending network. No hardware is connected and no payment is taken.</p>`
  },
  technology: {
    title: 'Serving technology',
    body: `<p>Every product has its own dosing channel, auger profile and calibration table, because 6.5 g of pre-workout and 33 g of whey do not move the same way.</p>
      <ul>
        <li><strong>Sealed hoppers</strong> — food-grade, nitrogen-flushed, temperature-held.</li>
        <li><strong>Calibrated auger</strong> — runs for a measured time, then trims the dose.</li>
        <li><strong>Load cell</strong> — weighs the cup before and after dosing.</li>
        <li><strong>Tolerance check</strong> — an out-of-spec dose is rejected before the tray unlocks.</li>
      </ul>
      <p>Serving weights on this site follow the figures printed on each product's label.</p>`
  },
  hygiene: {
    title: 'Hygiene & safety',
    body: `<p>Powder stays inside a closed hopper until a paid order requests it. There are no open scoops, no shared tubs and no cross-contact between products.</p>
      <ul>
        <li>Nozzle, cup chute and tray run on a logged cleaning cycle.</li>
        <li>Cleaning status is shown on the kiosk screen before payment.</li>
        <li>Sealed cups are stacked in a closed column and ejected one at a time.</li>
        <li>A production unit would need food-safety validation and product-specific calibration before deployment.</li>
      </ul>`
  },
  contact: {
    title: 'Contact',
    body: `<p>Concept storefront enquiries: <strong>hello@vendi-go.example</strong></p>
      <p>Machine 04 · Connaught Place, New Delhi · 9 min walk from Rajiv Chowk.</p>
      <p>For product, allergen or label questions, always check the pack in your hand — this demo shows label figures for identification and does not replace the manufacturer's label.</p>`
  },
  categories: {
    title: 'Product categories',
    body: `<p>The machine stocks three chambers, each with its own dosing channel:</p>
      <ul>
        <li><strong>Pre-workout</strong> — C4, GHOST Legend, Bucked Up, Total War, Pre JYM. Small servings, 6.5–26 g.</li>
        <li><strong>Protein</strong> — Gold Standard, ISO100, Biozyme, Impact Whey, Isopure Zero Carb. 25–33 g servings.</li>
        <li><strong>Creatine</strong> — ON Micronized and MuscleTech Platinum. 5 g servings.</li>
      </ul>
      <p>Every price is per serving, never per tub.</p>`
  }
};

function openInfo(key) {
  const data = INFO[key];
  const modal = $('#infoModal');
  const card = $('#infoCard');
  if (!data || !modal || !card) return;
  card.innerHTML = `<button class="icon-btn info-close" type="button" data-close-info aria-label="Close">✕</button>
    <span class="eyebrow">Vendi-Go</span>
    <h3>${data.title}</h3>
    ${data.body}
    <div class="info-actions"><button class="btn btn--ghost btn--sm" type="button" data-close-info>Close</button></div>`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const close = $('.info-close', card);
  if (close) close.focus();
}

function closeInfo() {
  const modal = $('#infoModal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  if (!dispenseOpen) document.body.style.overflow = '';
}

function openMenu() {
  const panel = $('#menuPanel');
  const btn = $('#menuBtn');
  if (!panel) return;
  panel.hidden = false;
  if (btn) btn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  const panel = $('#menuPanel');
  const btn = $('#menuBtn');
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (!dispenseOpen && !bag.size) document.body.style.overflow = '';
}

/* ---------------- dispensing ---------------- */
const DOSE_STEPS = (grams) => [
  ['Payment confirmed', 380],
  [`Dosing ${grams.toFixed(1)} g`, 1450],
  ['Weight verified · within tolerance', 700],
  ['Dispensing into cup', 900],
  ['Collection ready', 320]
];

let dispensing = false;
let dispenseOpen = false;

function setStep(index, state) {
  const items = $$('#dispenseStates li');
  items.forEach((li, i) => {
    li.classList.toggle('is-on', i === index && state === 'active');
    if (i < index || (i === index && state === 'done')) li.classList.add('is-done');
    if (i === index && state === 'fail') li.classList.add('is-fail');
  });
}

function machineScreen(text) {
  const screen = storyMachine && storyMachine.querySelector('[data-screen]');
  if (screen) screen.textContent = text;
}

async function startDispense() {
  if (dispensing) return;
  if (!bag.size) { toast('Your cart is empty.'); return; }

  const total = bagTotal();
  if (total > wallet.balance) { toast('Not enough balance — top up your wallet.'); return; }

  const servings = bagServings();
  const grams = bagGrams();
  const firstName = byId(Array.from(bag.keys())[0]).name;
  const extra = servings - 1;

  dispensing = true;
  dispenseOpen = true;
  closeDrawer();

  const overlay = $('#dispense');
  const cup = $('#dispenseCup');
  const meta = $('#dispenseMeta');
  const done = $('#dispenseDone');
  const title = $('#dispenseTitle');

  overlay.hidden = false;
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  done.disabled = true;
  cup.classList.remove('is-pouring');
  overlay.classList.remove('is-filled');
  title.textContent = 'Dispensing your serving';
  meta.textContent = `${firstName}${extra > 0 ? ` + ${extra} more serving${extra > 1 ? 's' : ''}` : ''} · ${grams.toFixed(1)} g total`;

  const steps = DOSE_STEPS(grams);
  $('#dispenseStates').innerHTML = steps.map(([label], i) =>
    `<li data-step="${i}"><i>${i + 1}</i><span>${label}</span></li>`
  ).join('');

  wallet.balance -= total;
  renderBag();

  for (let i = 0; i < steps.length; i++) {
    setStep(i, 'active');
    if (i === 1) { machineScreen('DOSING'); cup.classList.add('is-pouring'); }
    if (i === 3) { machineScreen('DISPENSING'); }
    await wait(steps[i][1]);
    setStep(i, 'done');
  }

  cup.classList.remove('is-pouring');
  cup.classList.add('is-done');
  machineScreen('READY');
  overlay.classList.add('is-filled');
  done.disabled = false;

  log.unshift({
    label: `${firstName}${extra > 0 ? ` + ${extra} more` : ''} · ${servings} serving${servings > 1 ? 's' : ''}`,
    amount: total,
    when: 'Just now'
  });
  renderLog();
  bag.clear();
  renderBag();
  toast(`Dispensed ${grams.toFixed(1)} g. Collect your cup.`);
  dispensing = false;
}

function closeDispense() {
  const overlay = $('#dispense');
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-filled');
  dispenseOpen = false;
  document.body.style.overflow = '';
  const cup = $('#dispenseCup');
  if (cup) cup.classList.remove('is-pouring', 'is-done');
}

/* ---------------- drawer ---------------- */
function openDrawer() {
  const drawer = $('#drawer'), scrim = $('#scrim');
  if (!drawer || !scrim) return;
  scrim.hidden = false;
  requestAnimationFrame(() => { scrim.classList.add('is-on'); drawer.classList.add('is-open'); });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  const drawer = $('#drawer'), scrim = $('#scrim');
  if (!drawer || !scrim) return;
  drawer.classList.remove('is-open');
  scrim.classList.remove('is-on');
  drawer.setAttribute('aria-hidden', 'true');
  if (!dispenseOpen) document.body.style.overflow = '';
  setTimeout(() => { scrim.hidden = true; }, 420);
}

function topUp(amount) {
  wallet.balance += amount;
  renderBag();
  toast(`${inr(amount)} added to your wallet`);
}

/* ---------------- scroll: native, reversible ---------------- */
function initScroll() {
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  if (!hasST || !storyEl) return;
  gsap.registerPlugin(ScrollTrigger);

  /* the machine scene is the only pinned moment: one trigger, one progress value */
  const mm = gsap.matchMedia();
  const tight = window.matchMedia('(max-width: 820px)').matches;
  const scene = () => {
    const st = ScrollTrigger.create({
      trigger: storyEl,
      start: 'top top',
      end: 'bottom bottom',
      scrub: tight ? 0.28 : 0.35,
      onUpdate: self => { targetP = self.progress; }
    });
    return () => st.kill();
  };
  mm.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', scene);
  mm.add('(max-width: 820px) and (prefers-reduced-motion: no-preference)', scene);

  /* hero: packs drift outward while the headline steps back */
  const hero = $('.hero--badgey');
  if (hero && !reduce) {
    const floats = $$('.hf');
    const small = window.matchMedia('(max-width: 820px)').matches;
    gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .5 }
    })
      .to('.hero-core', small ? { y: -28, opacity: 0, ease: 'none' } : { y: -60, opacity: 0, filter: 'blur(7px)', ease: 'none' }, 0)
      .to('.hero-scroll', { opacity: 0, ease: 'none' }, 0)
      .to(floats, {
        x: (i, el) => {
          const h = hero.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          return (r.left + r.width / 2 - (h.left + h.width / 2)) * .55;
        },
        y: (i, el) => {
          const h = hero.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          return (r.top + r.height / 2 - (h.top + h.height / 2)) * .35;
        },
        scale: 1.1,
        opacity: .15,
        ease: 'none',
        stagger: .02
      }, 0);
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* ---------------- events + boot ---------------- */
function bind() {
  const themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  });

  const bagBtn = $('#bagBtn');
  if (bagBtn) bagBtn.addEventListener('click', openDrawer);

  const bagClear = $('#bagClear');
  if (bagClear) bagClear.addEventListener('click', () => {
    if (!bag.size) return;
    bag.clear();
    renderBag();
    toast('Cart cleared.');
  });

  const drawerClose = $('#drawerClose');
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  const scrim = $('#scrim');
  if (scrim) scrim.addEventListener('click', closeDrawer);

  const vendBtn = $('#vendBtn');
  if (vendBtn) vendBtn.addEventListener('click', startDispense);
  const dispenseDone = $('#dispenseDone');
  if (dispenseDone) dispenseDone.addEventListener('click', closeDispense);

  const menuBtn = $('#menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  const menuClose = $('#menuClose');
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  const menuPanel = $('#menuPanel');
  if (menuPanel) menuPanel.addEventListener('click', e => { if (e.target === menuPanel) closeMenu(); });

  const catBar = $('#catBar');
  if (catBar) catBar.addEventListener('click', e => {
    const btn = e.target.closest('.catbtn');
    if (!btn) return;
    renderCatalogue(btn.dataset.cat, true);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#dispense')?.hidden) { closeDispense(); return; }
    if (!$('#sheet')?.hidden) { closeSheet(); return; }
    if (!$('#infoModal')?.hidden) { closeInfo(); return; }
    if (!$('#menuPanel')?.hidden) { closeMenu(); return; }
    closeDrawer();
  });

  document.addEventListener('click', e => {
    const menuItem = e.target.closest('[data-menu]');
    if (menuItem) {
      const key = menuItem.dataset.menu;
      closeMenu();
      if (key === 'machine') { $('#machine')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
      if (key === 'how') { $('#how')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
      openInfo(key);
      return;
    }

    if (e.target.closest('[data-close-info]')) { closeInfo(); return; }

    const cartBtn = e.target.closest('[data-cart]');
    if (cartBtn) {
      addToBag(cartBtn.dataset.cart);
      cartBtn.classList.add('is-added', 'is-pulse');
      const label = $('span', cartBtn);
      if (label) label.textContent = 'Added';
      setTimeout(() => { cartBtn.classList.remove('is-added', 'is-pulse'); if (label) label.textContent = 'Add to cart'; }, 1400);
      return;
    }

    const add = e.target.closest('[data-add]');
    if (add) { addToBag(add.dataset.add); return; }

    const inc = e.target.closest('[data-inc]');
    if (inc) { const it = bag.get(inc.dataset.inc); addToBag(inc.dataset.inc, 1, it && it.flavour); return; }

    const dec = e.target.closest('[data-dec]');
    if (dec) { removeFromBag(dec.dataset.dec); return; }

    const rm = e.target.closest('[data-remove]');
    if (rm) { bag.delete(rm.dataset.remove); renderBag(); toast('Removed from cart.'); return; }

    const chip = e.target.closest('[data-topup]');
    if (chip) { topUp(Number(chip.dataset.topup)); return; }

    if (e.target.closest('[data-close-sheet]')) { closeSheet(); return; }

    const flav = e.target.closest('[data-flav]');
    if (flav) {
      sheet.flavour = flav.dataset.flav;
      $$('#sheetCard .flav').forEach(b => b.classList.toggle('is-on', b === flav));
      return;
    }

    const qty = e.target.closest('[data-qty]');
    if (qty) {
      const p = byId(sheet.id);
      sheet.qty = clamp(sheet.qty + Number(qty.dataset.qty), 1, Math.min(6, p.stock));
      renderSheet();
      return;
    }

    if (e.target.closest('[data-sheet-add]')) {
      addToBag(sheet.id, sheet.qty, sheet.flavour);
      closeSheet();
      return;
    }

    const info = e.target.closest('[data-open]');
    if (info) { openSheet(info.dataset.open); return; }
  });

  const locateForm = $('#locateForm');
  if (locateForm) {
    locateForm.addEventListener('submit', e => {
      e.preventDefault();
      const pin = ($('#pincode')?.value || '').trim();
      if (pin.replace(/\D/g, '').length < 6) { toast('Enter a 6-digit pincode.'); return; }
      toast(`3 Vendi-Go machines within 2 km of ${pin}`);
    });
  }
}

const head = $('#siteHead');
function onScroll() {
  if (head) head.classList.toggle('is-scrolled', window.scrollY > 14);
}
window.addEventListener('scroll', onScroll, { passive: true });

function initReveal() {
  const items = $$('.js-reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('is-in'), delay);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(el => io.observe(el));
}

function boot() {
  $$('[data-machine]').forEach(el => { el.innerHTML = kioskMarkup(); });
  if (window.matchMedia('(min-width: 621px)').matches) renderHeroFloats();
  else $('#heroFloats')?.remove();
  renderHeroShelf();
  renderCatalogue('pre');
  renderBag();
  renderLog();
  initReveal();
  bind();

  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', false);
  onScroll();

  initScroll();
  if (reduce) targetP = curP = 0.58;   /* reduced motion: static open chamber, all copy shown */
  updateStory(curP);

  setTimeout(() => {
    const heroEl = $('.hero--badgey');
    if (heroEl) heroEl.classList.add('is-in');
  }, 200);

  const curtain = $('#curtain');
  const finish = () => {
    setTimeout(() => {
      if (curtain) {
        curtain.classList.add('is-done');
        setTimeout(() => curtain.remove(), 1400);
      }
    }, reduce ? 0 : 420);
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    if (curP !== targetP) {
      curP += (targetP - curP) * Math.min(1, dt / 90);
      if (Math.abs(targetP - curP) < 0.0005) curP = targetP;
      updateStory(curP);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
