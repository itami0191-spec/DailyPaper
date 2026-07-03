const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const express = require("express");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const ENTRIES_FILE = path.join(DATA_DIR, "entries.json");

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("只能上传图片文件。"));
      return;
    }

    callback(null, true);
  },
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

async function ensureStorage() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  try {
    await fs.access(ENTRIES_FILE);
  } catch {
    await fs.writeFile(ENTRIES_FILE, "[]\n", "utf8");
  }
}

async function readEntries() {
  await ensureStorage();
  const raw = await fs.readFile(ENTRIES_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeEntries(entries) {
  await fs.writeFile(ENTRIES_FILE, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

app.get("/api/entries", async (_req, res, next) => {
  try {
    const entries = await readEntries();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

app.post("/api/entries", upload.single("image"), async (req, res, next) => {
  try {
    const nickname = sanitizeText(req.body.nickname);
    const content = sanitizeText(req.body.content);

    if (!nickname || nickname.length > 24) {
      res.status(400).json({ message: "昵称不能为空，且不能超过 24 个字符。" });
      return;
    }

    if (!content || content.length > 2000) {
      res.status(400).json({ message: "日记正文不能为空，且不能超过 2000 个字符。" });
      return;
    }

    const entries = await readEntries();
    const entry = {
      id: crypto.randomUUID(),
      nickname,
      content,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString(),
    };

    entries.unshift(entry);
    await writeEntries(entries);

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ message: "图片不能超过 5MB，且每次只能上传 1 张。" });
    return;
  }

  if (error.message === "只能上传图片文件。") {
    res.status(400).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "服务器暂时无法保存日记，请稍后再试。" });
});

ensureStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DailyPaper is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize storage.", error);
    process.exit(1);
  });
