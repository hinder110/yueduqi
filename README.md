# 阅读器 (YueDuQi)

基于 [Legado（阅读）](https://github.com/gedoor/legado) 核心原理的简化版多书源小说阅读器 Web Demo。

## 功能

- 多书源搜索（番茄小说、笔趣阁、七星阁）
- 章节目录浏览
- 阅读器：字号切换、日间/夜间模式、上下章翻页
- 热门推荐

## 快速开始

### 方式一：Node.js（需要 Node.js 18+）

```bash
# 安装依赖
npm run install:all

# 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`

### 方式二：Docker

```bash
docker compose up
```

浏览器打开 `http://localhost:3000`

## 书源

| 书源 | 类型 | 封面 | 说明 |
|------|------|------|------|
| 番茄小说 | API | 有 | 搜索 + 热门推荐，内容每日限流 |
| 笔趣阁900 | HTML 解析 | 交叉匹配 | 无限制 |
| 七星阁小说网 | HTML 解析 | 自带 | 无限制 |

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Express + Axios + Cheerio
- **解析引擎**: JSONPath / CSS Selector / GBK 解码

## 项目结构

```
yueduqi/
├── client/                    # React 前端
│   └── src/
│       ├── pages/
│       │   ├── SearchPage.tsx    # 搜索 + 热门推荐
│       │   ├── ChaptersPage.tsx  # 章节目录
│       │   └── ReaderPage.tsx    # 阅读器
│       └── api.ts                # 后端 API 封装
├── server/                    # Express 后端
│   └── src/
│       ├── parsers/
│       │   ├── biqugeParser.ts   # 笔趣阁 HTML 解析器
│       │   ├── qixingeParser.ts  # 七星阁 HTML 解析器
│       │   └── index.ts          # 书源路由器
│       └── bookParser.ts         # 光遇 API 解析器
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## License

MIT
