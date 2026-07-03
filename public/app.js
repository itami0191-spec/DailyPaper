const form = document.querySelector("#entry-form");
const message = document.querySelector("#form-message");
const entriesContainer = document.querySelector("#entries");
const template = document.querySelector("#entry-template");

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function entryTitle(content) {
  const firstLine = content.split(/\n/).find(Boolean) || "今日短讯";
  return firstLine.length > 24 ? `${firstLine.slice(0, 24)}...` : firstLine;
}

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function renderEntries(entries) {
  entriesContainer.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "还没有日记。写下第一篇，让这份小报开张。";
    entriesContainer.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".entry");
    const nickname = node.querySelector(".entry__nickname");
    const time = node.querySelector("time");
    const title = node.querySelector("h3");
    const content = node.querySelector(".entry__content");
    const image = node.querySelector("img");

    article.dataset.id = entry.id;
    nickname.textContent = entry.nickname;
    time.dateTime = entry.createdAt;
    time.textContent = formatter.format(new Date(entry.createdAt));
    title.textContent = entryTitle(entry.content);
    content.textContent = entry.content;

    if (entry.imageUrl) {
      image.src = entry.imageUrl;
      image.alt = `${entry.nickname} 上传的日记图片`;
    } else {
      image.remove();
    }

    entriesContainer.append(node);
  });
}

async function loadEntries() {
  const response = await fetch("/api/entries");
  if (!response.ok) {
    throw new Error("无法读取日记。");
  }

  renderEntries(await response.json());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("正在排版刊登...", "info");

  const submitButton = form.querySelector("button");
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/entries", {
      method: "POST",
      body: new FormData(form),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "提交失败。");
    }

    form.reset();
    setMessage("已刊登到今日版面。", "success");
    await loadEntries();
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

loadEntries().catch((error) => {
  setMessage(error.message, "error");
});
