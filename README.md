# DailyPaper

一个视觉风格参考中国报纸的个人日记网站。用户可以自定义昵称，发布文字日记，也可以上传一张图片；内容由后台保存到本地数据目录。

## 功能

- 自定义昵称发布日记
- 支持正文和单张图片上传
- 后端将日记记录保存到 `data/entries.json`
- 上传图片保存到 `data/uploads/`
- 中国报纸风格的版头、分栏、纸张纹理与红黑配色
- 通过 `/admin` 后台管理页面查看所有投稿记录

## 本地运行

```bash
npm install
npm start
```

然后打开 <http://localhost:3000>。

## 后台管理

后台地址：

```text
http://localhost:3000/admin
```

后台需要设置管理员密码。不要把密码写进 HTML 或 JS 文件里，启动服务前通过环境变量设置。

macOS / Linux：

```bash
ADMIN_PASSWORD=你的后台密码 npm start
```

Windows CMD：

```cmd
set ADMIN_PASSWORD=你的后台密码
npm start
```

Windows PowerShell：

```powershell
$env:ADMIN_PASSWORD="你的后台密码"
npm start
```

部署到云服务器时，也需要在启动命令或进程管理工具里设置 `ADMIN_PASSWORD`。如果没有设置，后台会提示“后台密码尚未配置”。

## 数据说明

运行时数据默认保存在仓库内的 `data/` 目录，但已通过 `.gitignore` 排除，避免误提交用户日记和图片。部署到生产环境时，建议把该目录挂载到持久化存储。
