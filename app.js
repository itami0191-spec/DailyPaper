const POINTS = {
  initial: 20000,
  single: 200,
  ten: 2000,
};

const RATES = {
  R: 0.07,
  N: 0.93,
};

const CHARACTERS = [
  "オズ",
  "アーサー",
  "カイン",
  "リケ",
  "スノウ",
  "ホワイト",
  "ミスラ",
  "オーエン",
  "ブラッドリー",
  "ファウスト",
  "シノ",
  "ヒースクリフ",
  "ネロ",
  "シャイロック",
  "ムル",
  "クロエ",
  "ラスティカ",
  "フィガロ",
  "ルチル",
  "レノックス",
  "ミチル",
];

const R_TITLES = [
  "穏やかな昼下がり",
  "賢者への挨拶",
  "魔法舎の一日",
  "訓練のあとで",
  "小さな約束",
  "思い出の欠片",
  "月夜の談話",
  "きらめく予感",
  "扉の向こう",
  "手渡された花",
  "風の通り道",
  "朝食の時間",
  "雨上がりの庭",
  "読書の余韻",
  "旅支度",
  "やさしい灯り",
  "静かな祈り",
  "秘密のメモ",
  "星を数えて",
  "廊下の足音",
  "明日への準備",
];

const elements = {
  points: document.querySelector("#points"),
  reset: document.querySelector("#reset"),
  single: document.querySelector("#single"),
  ten: document.querySelector("#ten"),
  skip: document.querySelector("#skip"),
  stage: document.querySelector("#stage"),
  slab: document.querySelector("#slab"),
  stageText: document.querySelector("#stage-text"),
  cards: document.querySelector("#cards"),
  summary: document.querySelector("#summary"),
  totalPulls: document.querySelector("#total-pulls"),
  totalR: document.querySelector("#total-r"),
  totalN: document.querySelector("#total-n"),
  rRate: document.querySelector("#r-rate"),
};

const state = {
  points: POINTS.initial,
  stats: {
    pulls: 0,
    R: 0,
    N: 0,
  },
  activeTimeouts: [],
  currentResults: [],
  isAnimating: false,
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function drawCard(index) {
  const rarity = Math.random() < RATES.R ? "R" : "N";
  const character = sample(CHARACTERS);

  return {
    index,
    rarity,
    character,
    title: rarity === "R" ? `【${sample(R_TITLES)}】${character}` : `【N】${character}`,
  };
}

function updateUi() {
  elements.points.textContent = formatNumber(state.points);
  elements.totalPulls.textContent = formatNumber(state.stats.pulls);
  elements.totalR.textContent = formatNumber(state.stats.R);
  elements.totalN.textContent = formatNumber(state.stats.N);
  elements.rRate.textContent =
    state.stats.pulls === 0 ? "0.0%" : `${((state.stats.R / state.stats.pulls) * 100).toFixed(1)}%`;

  elements.single.disabled = state.isAnimating || state.points < POINTS.single;
  elements.ten.disabled = state.isAnimating || state.points < POINTS.ten;
}

function clearAnimationQueue() {
  state.activeTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  state.activeTimeouts = [];
}

function queue(callback, delay) {
  const timeoutId = window.setTimeout(() => {
    state.activeTimeouts = state.activeTimeouts.filter((id) => id !== timeoutId);
    callback();
  }, delay);
  state.activeTimeouts.push(timeoutId);
}

function setSummoning(isSummoning, hasRare = false) {
  elements.stage.classList.toggle("is-summoning", isSummoning);
  elements.stage.classList.toggle("is-rare", hasRare);
  elements.skip.hidden = !isSummoning;
  state.isAnimating = isSummoning;
  updateUi();
}

function createCardElement(card) {
  const cardElement = document.createElement("article");
  cardElement.className = `card card--${card.rarity.toLowerCase()}`;
  cardElement.innerHTML = `
    <span class="card__rarity">${card.rarity}</span>
    <h3 class="card__title">${card.title}</h3>
    <p class="card__character">${card.character}</p>
    <span class="card__index">#${String(card.index).padStart(2, "0")}</span>
  `;
  return cardElement;
}

function renderSummary(results) {
  const rareCount = results.filter((card) => card.rarity === "R").length;
  const normalCount = results.length - rareCount;
  elements.summary.textContent = `${results.length} 抽：R ${rareCount} / N ${normalCount}`;
}

function revealAll(results) {
  clearAnimationQueue();
  elements.cards.replaceChildren();
  results.forEach((card) => {
    const cardElement = createCardElement(card);
    elements.cards.append(cardElement);
    cardElement.classList.add("revealed");
  });
  elements.stageText.textContent = "结果已全部揭示。";
  setSummoning(false, results.some((card) => card.rarity === "R"));
}

function revealSequentially(results) {
  elements.cards.replaceChildren();
  results.forEach((card, cardIndex) => {
    queue(() => {
      const cardElement = createCardElement(card);
      elements.cards.append(cardElement);
      requestAnimationFrame(() => cardElement.classList.add("revealed"));
      elements.stageText.textContent =
        card.rarity === "R" ? "金色光芒浮现，R 卡出现。" : "银色光芒落下，N 卡出现。";
    }, 900 + cardIndex * 260);
  });

  queue(() => {
    elements.stageText.textContent = "召唤完成。";
    setSummoning(false, results.some((card) => card.rarity === "R"));
  }, 900 + results.length * 260 + 280);
}

function pull(count) {
  const cost = count === 10 ? POINTS.ten : POINTS.single;
  if (state.isAnimating || state.points < cost) {
    return;
  }

  const results = Array.from({ length: count }, (_, index) => drawCard(index + 1));
  state.currentResults = results;
  state.points -= cost;
  state.stats.pulls += count;
  results.forEach((card) => {
    state.stats[card.rarity] += 1;
  });

  renderSummary(results);
  setSummoning(true, results.some((card) => card.rarity === "R"));
  elements.slab.textContent = results.some((card) => card.rarity === "R") ? "RARE" : "POINT";
  elements.stageText.textContent = count === 10 ? "十连召唤中，石板正在点亮..." : "召唤中...";
  revealSequentially(results);
}

function reset() {
  clearAnimationQueue();
  state.points = POINTS.initial;
  state.stats = { pulls: 0, R: 0, N: 0 };
  state.currentResults = [];
  elements.cards.replaceChildren();
  elements.summary.textContent = "尚未抽卡";
  elements.stageText.textContent = "点击抽卡，点亮石板。";
  elements.slab.textContent = "POINT";
  setSummoning(false, false);
}

elements.single.addEventListener("click", () => pull(1));
elements.ten.addEventListener("click", () => pull(10));
elements.skip.addEventListener("click", () => revealAll(state.currentResults));
elements.reset.addEventListener("click", reset);

updateUi();
