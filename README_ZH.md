🇬🇧 [English README](README.md)

# ✈️ TripTab — 旅行费用分摊应用

**TripTab** 是一款现代化、响应式的渐进式 Web 应用（PWA），专为旅行中的群组费用分摊、债务追踪与透明结算而设计，简单高效、界面精美。

![主题](https://img.shields.io/badge/主题-Sunset%20Voyage-ff6b6b)
![PWA](https://img.shields.io/badge/PWA-Ready-10b981)
![国际化](https://img.shields.io/badge/语言-EN%20%7C%20ZH-ffd93d)

---

## ✨ 功能特色

- ✈️ **行程管理**：创建、编辑与归档行程，支持多种基础货币（USD、MYR、SGD、EUR、JPY、GBP、CNY 等）。
- 👥 **群组与虚拟成员**：通过邮箱邀请注册好友，或直接为虚拟成员指定名称，立即开始记录费用。
- 💳 **灵活的费用分摊**：
  - 所有成员平均分摊
  - 自定义各成员分摊金额
  - 指定部分成员参与分摊
  - **显示分摊详情开关**：在费用列表中一键展开每笔费用的各成员分摊金额芯片（偏好设置通过 `localStorage` 持久保存）。
- ⚡ **智能债务简化**：
  - **直接配对模式**：显示任意两位成员之间的精确逐项债务。
  - **群组债务简化**：贪心算法，最大程度减少全组总结算步骤。
  - **计算明细弹窗**：逐步展示「A 为 B 付款」减去「B 为 A 付款」的详细数学过程。
- 📄 **PDF 与打印摘要**：生成可打印的计算明细，并导出行程摘要便于存档。
- 🌐 **全局国际化翻译**：所有页面、弹窗与动态列表实时切换**英文**与**中文（简体）**。
- 🌙 **深色与浅色模式**：Sunset Voyage 设计系统，融合玻璃拟态、动态渐变与深色舒适配色。
- 📱 **PWA 与离线可用**：支持「添加到主屏幕」，像原生应用一样全屏使用，Service Worker 缓存核心资源。

---

## 🛠️ 技术栈

- **前端**：HTML5、原生 JavaScript（ES6+）
- **样式**：现代 CSS3（自定义设计令牌、Flexbox/Grid、玻璃拟态、响应式媒体查询）
- **后端与存储**：Firebase Authentication 与 Firestore NoSQL 数据库
- **离线 / 应用安装**：Web App Manifest（`manifest.json`）与 Service Worker（`sw.js`）

---

## 📂 项目结构

```
Travel Apps/
├── add-expense.html    # 添加 / 编辑费用表单与分类选择
├── dashboard.html      # 用户主界面与活跃行程列表
├── index.html          # 落地页与入口
├── login.html          # 用户登录页
├── profile.html        # 用户资料、统计数据与主题偏好
├── register.html       # 注册页（私有访问控制）
├── trip.html           # 行程详情主视图（费用、成员、结算标签页）
├── manifest.json       # PWA Web 应用清单
├── sw.js               # 离线资源缓存 Service Worker
├── css/
│   ├── base.css        # 核心设计系统令牌、主题、排版
│   ├── components.css  # 按钮、卡片、弹窗、应用栏、底部导航
│   └── pages.css       # 各页面专属布局
└── js/
    ├── auth.js         # Firebase Auth 辅助函数
    ├── expenses.js     # 费用处理与分组逻辑
    ├── firebase-config.js # Firebase 项目配置
    ├── i18n.js         # 国际化（中英文翻译）
    ├── theme.js        # 深色 / 浅色模式状态管理
    ├── trips.js        # Firestore 行程 CRUD 操作
    └── utils.js        # 货币、日期格式化与通用工具函数
```

---

## 🚀 本地运行方式

1. **方式 A：直接打开文件**
   - 用任意现代浏览器（Chrome、Safari、Edge、Firefox）直接打开 `dashboard.html`。

2. **方式 B：本地开发服务器**
   - 在项目目录下运行轻量 HTTP 服务：
     ```bash
     npx http-server ./
     ```
   - 在浏览器中打开 `http://localhost:8080`。

---

## 📲 移动端安装（添加到主屏幕）

- **iPhone（Safari）**：打开网页链接 → 点击分享图标 `[↑]` → 选择**「添加到主屏幕」**。
- **Android（Chrome）**：打开网页链接 → 点击三点菜单 `⋮` → 选择**「添加到主屏幕」**或**「安装应用」**。

---

## 🔧 配置你自己的 Firebase（开发者）

如需克隆或 Fork 本项目自行部署：

1. 在 [console.firebase.google.com](https://console.firebase.google.com/) 免费创建项目。
2. 在 *Build → Authentication → Sign-in method* 中启用**邮箱/密码登录**。
3. 在 *Build → Firestore Database* 中创建 **Cloud Firestore 数据库**。
4. 将 `js/firebase-config.js` 中的配置替换为你的 Firebase Web 配置：
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## 👤 创建第一个用户账号

> **注意**：默认情况下，公开注册已关闭以保持应用私密性。你需要通过 Firebase 控制台手动创建第一个账号。

**操作步骤：**

1. 前往你的 Firebase 项目：[console.firebase.google.com](https://console.firebase.google.com/)
2. 导航至 **Build → Authentication → Users**
3. 点击 **「Add user」**
4. 输入**邮箱**和**密码**
5. 点击 **「Add user」** 确认
6. 打开应用并使用上述凭据登录 — 完成！🎉

> **邀请他人**：对每位需要访问权限的人重复以上步骤。他们可以用你设置的邮箱和密码登录，并在应用内的资料页修改密码。

---

## 📝 开源许可

本项目基于 MIT 协议分发。详情请参阅 `LICENSE` 文件。

