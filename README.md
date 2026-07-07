# Point Gacha Simulator

一个独立的静态网页抽卡模拟器，参考《魔法使いの約束》的ポイントガチャ机制制作。

> Fan-made simulator. 不使用官方图片、Logo 或素材；概率来自公开 Wiki 的检证参考信息，非官方保证值。

## 功能

- 池子：通常ポイントガチャ
- 消耗：单抽 200pt，十连 2,000pt
- 参考概率：R 7.0%，N 93.0%
- 十连逐张揭示动画
- 跳过动画、重置、累计统计

## 文件结构

```text
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 本地运行

直接打开 `index.html`，或启动一个静态服务器：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 独立成新仓库

如果要从当前 `DailyPaper` 仓库独立出来，可以新建一个 GitHub 仓库，然后把这些文件复制进去：

- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `.nojekyll`

也可以直接把当前分支作为静态站点源码导入新仓库。

## GitHub Pages 部署

新仓库创建后，在 GitHub 仓库设置中打开：

```text
Settings -> Pages -> Build and deployment -> Deploy from a branch
```

选择包含这些文件的分支和根目录 `/` 即可。
