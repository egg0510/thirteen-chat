已为项目做了以下“自用稳定性”增强：

- 添加 @cloudbase/js-sdk 依赖，提供 Web 端云函数调用封装 src/tcb.ts（含匿名登录、重试）
- package.json 增加 engines.node >=18，保证云端构建一致
- postbuild 自动复制 dist/index.html 为 dist/404.html，便于 SPA 刷新不 404（若未配置路由回退规则时可兜底）

部署与使用建议（CloudBase Hosting）：
- 控制台添加路由回退：/* -> /index.html （状态码 200）
- 绑定仓库启用自动部署：安装命令 npm ci，构建命令 npm run build，产物目录 dist，Node 18
- 前端调用云函数：import { callPersonas } from './src/tcb' 后直接调用
- 若改用 HTTP 触发器：注意函数内 CORS 与限流校验

如需继续：
- 我可以为 personas/plugins 提供 HTTP 触发器版本与 CORS 模板
- 也可添加可用性监控/告警脚本与心跳函数
