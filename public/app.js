const form = document.querySelector("#entry-form");
const message = document.querySelector("#form-message");
const dateLine = document.querySelector("#date-line");
const historyList = document.querySelector("#history-list");
const historyTemplate = document.querySelector("#history-entry-template");
const nicknameInput = document.querySelector("#nickname");
const anonymousCheckbox = document.querySelector("#is-anonymous");
const anonymousHint = document.querySelector("#anonymous-hint");

const CLIENT_ID_KEY = "dailyPaperClientId";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
  weekday: "long",
});
const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getClientId() {
  const savedClientId = localStorage.getItem(CLIENT_ID_KEY);

  if (savedClientId) {
    return savedClientId;
  }

  const clientId = crypto.randomUUID();
  localStorage.setItem(CLIENT_ID_KEY, clientId);
  return clientId;
}

const clientId = getClientId();

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function lunarDayName(day) {
  const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  if (day <= 10) {
    return `初${digits[day]}`;
  }

  if (day < 20) {
    return `十${digits[day - 10]}`;
  }

  if (day === 20) {
    return "二十";
  }

  if (day < 30) {
    return `廿${digits[day - 20]}`;
  }

  return "三十";
}

function lunarDate(date) {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric",
    }).formatToParts(date);
    const month = parts.find((part) => part.type === "month")?.value;
    const day = Number(parts.find((part) => part.type === "day")?.value);

    if (!month || !Number.isInteger(day)) {
      return "农历日期";
    }

    return `${month}${lunarDayName(day)}`;
  } catch {
    return "农历日期";
  }
}

function zodiacDay(date) {
  const dayLabels = [
    "建日",
    "除日",
    "满日",
    "平日",
    "定日",
    "执日",
    "破日",
    "危日",
    "成日",
    "收日",
    "开日",
    "闭日",
  ];
  const yellowDays = new Set(["除日", "危日", "定日", "执日", "成日", "开日"]);
  const label = dayLabels[Math.floor(date.getTime() / 86400000) % dayLabels.length];

  return yellowDays.has(label) ? `黄道日：${label}` : `平常日：${label}`;
}

function renderDateLine() {
  const today = new Date();
  dateLine.textContent = `${dateFormatter.format(today)} · ${weekdayFormatter.format(today)} · ${lunarDate(today)} · ${zodiacDay(today)}`;
}

function renderHistory(entries) {
  historyList.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "还没有历史投稿。提交后可在这里回看。";
    historyList.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const node = historyTemplate.content.cloneNode(true);
    const nickname = node.querySelector(".history-entry__nickname");
    const time = node.querySelector("time");
    const title = node.querySelector(".history-entry__title");
    const content = node.querySelector(".history-entry__content");
    const image = node.querySelector("img");

    nickname.textContent = entry.nickname;
    time.dateTime = entry.createdAt;
    time.textContent = timeFormatter.format(new Date(entry.createdAt));
    title.textContent = entry.title || "";
    content.textContent = entry.content;

    if (!entry.title) {
      title.remove();
    }

    if (entry.imageUrl) {
      image.src = entry.imageUrl;
      image.alt = `${entry.nickname} 上传的投稿图片`;
    } else {
      image.remove();
    }

    historyList.append(node);
  });
}

async function loadHistory() {
  const response = await fetch(`/api/my-entries?clientId=${encodeURIComponent(clientId)}`);

  if (!response.ok) {
    throw new Error("无法读取历史投稿。");
  }

  renderHistory(await response.json());
}

function syncAnonymousState() {
  const isAnonymous = anonymousCheckbox.checked;

  nicknameInput.disabled = isAnonymous;
  nicknameInput.required = !isAnonymous;
  anonymousHint.hidden = !isAnonymous;

  if (isAnonymous) {
    nicknameInput.value = "";
  }
}

anonymousCheckbox.addEventListener("change", syncAnonymousState);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("正在排版刊登...", "info");

  const submitButton = form.querySelector("button");
  submitButton.disabled = true;

  try {
    const formData = new FormData(form);
    formData.append("clientId", clientId);

    const response = await fetch("/api/entries", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "提交失败。");
    }

    form.reset();
    syncAnonymousState();
    setMessage("稿件已收到。", "success");
    await loadHistory();
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

renderDateLine();
setInterval(renderDateLine, 60 * 1000);
syncAnonymousState();
loadHistory().catch((error) => {
  setMessage(error.message, "error");
});
