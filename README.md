# FLX Tab Page

这是一个个性化的浏览器新标签页，旨在提供美观的背景、快速访问常用网站以及便捷的搜索功能。

## 功能

*   **动态壁纸:**
    *   提供多个内置壁纸源，包括每日必应壁纸和随机高清壁纸。
    *   用户可以轻松切换壁纸。
*   **用户认证:**
    *   通过 Supabase 实现用户登录和数据同步。
    *   用户设置（如壁纸偏好、搜索引擎选择和快速链接）可以跨设备同步。
*   **快速链接:**
    *   用户可以添加、删除和自定义快速访问链接。
    *   链接以图标和标题的形式直观展示。
*   **多引擎搜索:**
    *   集成多个搜索引擎（Google, Bing, Baidu, DuckDuckGo）。
    *   用户可以方便地在不同搜索引擎之间切换。
*   **天气小部件:**
    *   根据用户地理位置显示当前天气信息。
*   **响应式设计:**
    *   界面在不同设备尺寸上均有良好表现。

## 技术栈

*   **前端:**
    *   HTML5
    *   CSS3
    *   JavaScript (ES6+)
*   **后端服务:**
    *   [Supabase](https://supabase.io/) - 用于用户认证和数据存储。
*   **API:**
    *   [OpenWeatherMap API](https://openweathermap.org/api) - 用于获取天气数据。
    *   各种壁纸 API。

## 如何运行

1.  **克隆仓库:**
    ```bash
    git clone <repository-url>
    ```
2.  **安装依赖:**
    ```bash
    npm install
    ```
3.  **启动服务:**
    ```bash
    npm start
    ```
    这会启动一个本地 Node.js 服务器（主要用于处理部分 API 请求）。
4.  **在浏览器中打开:**
    直接在浏览器中打开 `index.html` 文件即可使用。

## 文件结构

```
.
├── .vscode/
│   └── settings.json
├── bizhi.png
├── index.html          # 主页面结构
├── package-lock.json
├── package.json        # 项目依赖和脚本
├── script.js           # 主要的 JavaScript 逻辑
├── server.js           # 后端服务
├── style.css           # 页面样式
└── utils/
    └── debugger.js
```