const loginCard = document.querySelector(".admin-login-card");
const loginForm = document.querySelector("#admin-login-form");
const passwordInput = document.querySelector("#admin-password");
const message = document.querySelector("#admin-message");
const adminPanel = document.querySelector("#admin-panel");
const summary = document.querySelector("#admin-summary");
const entryList = document.querySelector("#admin-entry-list");
const entryTemplate = document.querySelector("#admin-entry-template");
const refreshButton = document.querySelector("#refresh-admin-entries");
const logoutButton = document.querySelector("#admin-logout");

const ADMIN_PASSWORD_KEY = "dailyPaperAdminPassword";

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function setAdminMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function savedPassword() {
  return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "";
}

function savePassword(password) {
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

function clearPassword() {
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

function showPanel() {
  loginCard.hidden = true;
  adminPanel.hidden = false;
}

function showLogin() {
  loginCard.hidden = false;
  adminPanel.hidden = true;
  passwordInput.focus();
}

function renderEntries(entries) {
  entryList.replaceChildren();
  summary.textContent = `共 ${entries.length} 篇投稿`;

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "暂时还没有投稿。";
    entryList.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const node = entryTemplate.content.cloneNode(true);
    const nickname = node.querySelector(".admin-entry__nickname");
    const time = node.querySelector("time");
    const contact = node.querySelector(".admin-entry__contact");
    const title = node.querySelector(".admin-entry__title");
    const content = node.querySelector(".admin-entry__content");
    const imageLink = node.querySelector(".admin-entry__image-link");
    const image = node.querySelector("img");

    nickname.textContent = entry.nickname;
    time.dateTime = entry.createdAt;
    time.textContent = timeFormatter.format(new Date(entry.createdAt));
    contact.textContent = `联系方式：${entry.contact || "未填写"}`;
    title.textContent = entry.title || "";
    content.textContent = entry.content;

    if (!entry.title) {
      title.remove();
    }

    if (entry.imageUrl) {
      imageLink.href = entry.imageUrl;
      image.src = entry.imageUrl;
      image.alt = `${entry.nickname} 上传的投稿图片`;
    } else {
      imageLink.remove();
    }

    entryList.append(node);
  });
}

async function loadAdminEntries(password) {
  const response = await fetch("/api/admin/entries", {
    headers: {
      "x-admin-password": password,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "无法读取后台投稿。");
  }

  renderEntries(result);
  showPanel();
  setAdminMessage("后台已解锁。", "success");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;

  setAdminMessage("正在进入后台...", "info");

  try {
    await loadAdminEntries(password);
    savePassword(password);
    loginForm.reset();
  } catch (error) {
    clearPassword();
    setAdminMessage(error.message, "error");
  }
});

refreshButton.addEventListener("click", async () => {
  try {
    await loadAdminEntries(savedPassword());
  } catch (error) {
    clearPassword();
    setAdminMessage(error.message, "error");
    showLogin();
  }
});

logoutButton.addEventListener("click", () => {
  clearPassword();
  entryList.replaceChildren();
  summary.textContent = "";
  setAdminMessage("已退出后台。", "info");
  showLogin();
});

if (savedPassword()) {
  loadAdminEntries(savedPassword()).catch(() => {
    clearPassword();
    showLogin();
  });
}
