# 阅读器 (YueDuQi)

基于 [Legado（阅读）](https://github.com/gedoor/legado) 核心原理的简化版多书源小说阅读器。

**功能**：搜书 → 看目录 → 阅读正文。支持字号切换、夜间模式、上下章翻页。

---

## 怎么用（选一种就行）

### 方式一：Node.js 启动（推荐，简单）

**第一步：安装 Node.js**

去 [nodejs.org](https://nodejs.org) 下载安装，选左边那个 LTS 版本。
装好后打开终端（Windows 按 Win+R，输入 `cmd` 回车），输入以下命令验证：

```bash
node -v
```

如果显示版本号（比如 `v20.x.x`），说明装好了。

**第二步：下载项目**

```bash
git clone https://github.com/hinder110/yueduqi.git
cd yueduqi
```

如果没装 git，可以直接在 GitHub 页面点绿色的 `Code` 按钮 → `Download ZIP`，解压后进入文件夹。

**第三步：安装依赖**

```bash
npm install
npm run install:all
```

这一步会下载项目需要的所有包，第一次可能比较慢，等几分钟就好。

**第四步：启动**

```bash
npm run dev
```

终端显示 `Server running at http://localhost:3001` 就说明成功了。
打开浏览器，地址栏输入 **http://localhost:3000** 就能用。

**第五步：关闭**

在终端按 `Ctrl + C` 即可停止。

---

### 方式二：Docker 启动（不需要装 Node.js）

**第一步：安装 Docker Desktop**

去 [docker.com](https://www.docker.com/products/docker-desktop/) 下载安装 Docker Desktop。
装好后重启电脑，Docker 图标出现在右下角任务栏就说明运行中了。

**第二步：下载项目**

```bash
git clone https://github.com/hinder110/yueduqi.git
cd yueduqi
```

**第三步：启动**

```bash
docker compose up
```

浏览器打开 **http://localhost:3000**。

**第四步：关闭**

在终端按 `Ctrl + C`。

---

## 常见问题

**Q: npm install 很慢或失败？**

国内用户可以设置镜像：

```bash
npm config set registry https://registry.npmmirror.com
```

然后再运行 `npm run install:all`。

**Q: Docker 启动报错？**

确保 Docker Desktop 正在运行（右下角任务栏有 Docker 图标）。

**Q: 端口被占用？**

关闭其他占用 3000 或 3001 端口的程序，或者改 Docker 命令：

```bash
docker run -p 8080:3000 yueduqi
```

然后访问 `http://localhost:8080`。

**Q: 番茄书源看不了正文？**

番茄（光遇 API）每天免登录只能看 3 章正文。切换到"笔趣阁"或"七星阁"书源没有这个限制。

---

## 书源

| 书源 | 类型 | 封面 | 说明 |
|------|------|------|------|
| 番茄小说 | API | 有 | 有热门推荐，正文每日限流 3 次 |
| 笔趣阁900 | HTML 解析 | 交叉匹配 | 无限制 |
| 七星阁小说网 | HTML 解析 | 自带 | 无限制 |

---

## 技术栈

React 19 + TypeScript + Vite / Express + Axios + Cheerio

## License

MIT
