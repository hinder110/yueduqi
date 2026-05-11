# 阅读器 (YueDuQi)

基于 [Legado（阅读）](https://github.com/gedoor/legado) 原理的桌面小说阅读器，Tauri v2 + React + Rust。

**功能**：多书源搜索 → 章节目录 → 阅读正文，支持字号切换、夜间模式、书架、阅读历史。

---

## 下载

从 [Releases](https://github.com/hinder110/yueduqi/releases) 下载 `yueduqi.exe`，双击运行。

> 仅 Windows x64。其他平台请从源码编译。

---

## 从源码编译

### 环境要求

- [Rust](https://rustup.rs) 1.70+
- [Node.js](https://nodejs.org) 18+
- Windows: Visual Studio Build Tools（或安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)）

### 步骤

```bash
# 1. 克隆
git clone https://github.com/hinder110/yueduqi.git
cd yueduqi

# 2. 安装前端依赖
npm install

# 3. 启动开发模式
npm run tauri dev

# 4. 构建 release exe
npm run tauri build
```

构建产物在 `src-tauri/target/release/yueduqi.exe`。

---

## 书源

书源为 JSON 配置文件，需自行准备。格式支持两种：

### CSS 规则源（简单）

```json
{
  "name": "示例书源",
  "base_url": "https://example.com",
  "group": "测试",
  "enabled": true,
  "search_url": "https://example.com/search?keyword={keyword}",
  "book_list_rule": ".result-item a@text",
  "book_url_rule": ".result-item a@href",
  "chapter_list_rule": "#list dd a@text",
  "chapter_url_rule": "#list dd a@href",
  "content_rule": "#content@html"
}
```

CSS 规则格式：`CSS选择器@text|href|html|src`

### Legado 书源（复杂，部分支持）

支持 Legado 格式的 CSS 规则书源。JS 动态加密书源暂不支持。

---

## 项目结构

```
yueduqi/
├── src/                    # React 前端
│   ├── api.ts              # Tauri IPC 调用
│   ├── types.ts            # 类型定义
│   └── pages/              # 6 个页面
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── main.rs         # 入口
│       ├── lib.rs          # IPC 命令 + AppState
│       ├── source_manager.rs  # 书源加载/解析
│       ├── rule_engine.rs  # CSS 链规则引擎
│       ├── generic_parser.rs  # HTTP 请求 + 搜索
│       ├── mock_source.rs  # 离线 Mock 源
│       └── db.rs           # SQLite 书架/历史
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面框架 | Tauri v2 |
| 前端 | React 19 + TypeScript + Vite |
| 后端 | Rust (tokio, reqwest, scraper, rusqlite) |
| 规则引擎 | CSS 选择器链 + 正则替换 |
| 存储 | SQLite (书架 / 阅读历史) |

## License

MIT
