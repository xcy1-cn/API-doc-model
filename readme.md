# Local API Docs Viewer

一个轻量级本地接口文档展示器。

## 替换更新接口文档

```
在 app.js 的顶部:
    let path = "./risk-hazard-api-docs.json";(再次更换按照和原项目相同格式的json文件，也欢迎重构接口文档js函数配置)
```

## 功能

- 接口分组展示
- GET / POST / PUT / DELETE 方法标签
- Header / Query / Body / Path 参数展示
- 请求示例展示
- 响应示例展示
- 本地 Node 静态服务器启动

## 启动方式

```bash
npm install
npm run dev


