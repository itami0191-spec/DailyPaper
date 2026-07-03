const form = document.querySelector("#entry-form");
const message = document.querySelector("#form-message");

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
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
    setMessage("稿件已收到。", "success");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});
