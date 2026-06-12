# Local API Docs Viewer

一个轻量级本地接口文档展示器。

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

接口数据统一维护在：public/api-docs.json

## 添加json格式
{
    // name: 分类; 
    // apis: 子api {
        title/ method/ path/ description/ 
        headers {
            name/ type/ required/ default/ description
        }
        body/ query/ params {
            name/ type/ required/ description
        }
    }
            "name": "用户认证",
            "apis": [
                {
                    "title": "用户登录",
                    "method": "POST",
                    "path": "/api/user/login",
                    "description": "使用用户名和密码登录，登录成功后返回 token。前端需要把 token 存入本地，并在后续请求中放入 Authorization 请求头。",
                    "headers": [
                        {
                            "name": "Content-Type",
                            "type": "string",
                            "required": true,
                            "default": "application/json",
                            "description": "请求体类型"
                        }
                    ],
                    "body": [
                        {
                            "name": "username",
                            "type": "string",
                            "required": true,
                            "description": "用户名"
                        },
                        {
                            "name": "password",
                            "type": "string",
                            "required": true,
                            "description": "密码"
                        }
                    ],
                    "example": {
                        "username": "admin",
                        "password": "123456"
                    },
                    "response": {
                        "code": 200,
                        "message": "success",
                        "data": {
                            "token": "mock-token-value"
                        }
                    }
                },
                {
                    "title": "获取用户信息",
                    "method": "GET",
                    "path": "/api/user/info",
                    "description": "根据 Authorization token 获取当前登录用户信息。",
                    "headers": [
                        {
                            "name": "Authorization",
                            "type": "string",
                            "required": true,
                            "default": "Bearer {{token}}",
                            "description": "登录后获取的 token"
                        }
                    ],
                    "query": [],
                    "example": {},
                    "response": {
                        "code": 200,
                        "message": "success",
                        "data": {
                            "id": 1,
                            "username": "admin",
                            "role": "admin"
                        }
                    }
                }
            ]
        },
