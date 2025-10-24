部署到 GitHub Container Registry (GHCR) + CloudBase Run 指南（精简版）

前提
- 代码托管在 GitHub（仓库名与当前目录对应）。
- 已在项目根有 `Dockerfile`（已创建）。

1) 在 GitHub 仓库中添加 Secrets
- GHCR_USERNAME：你的 GitHub 用户名
- GHCR_TOKEN：GitHub Personal Access Token，需包含 `write:packages` 权限（推荐创建短期 PAT）

可选（自动更新 CloudBase Run）
- TCB_SECRET_ID / TCB_SECRET_KEY：腾讯云 API 密钥（用于自动触发 CloudBase Run API 部署，非必须）
- TCB_ENV_ID：CloudBase 环境 ID
- TCB_RUN_SERVICE_NAME：CloudBase Run 服务名

2) CI 工作流（已添加）
- 文件：`.github/workflows/docker-ghcr.yml`
- 触发：push 到 `main` 分支或手动在 Actions 页面运行（workflow_dispatch）
- 作用：构建 Docker 镜像并推到 GHCR（镜像地址示例： `ghcr.io/<OWNER>/<REPO>:<tag>`）

3) 在 CloudBase Run 使用 GHCR 镜像部署
- 登录 CloudBase 控制台 -> 云托管（CloudBase Run）-> 新建服务或更新服务
- 镜像来源：填写 GHCR 镜像地址，例如 `ghcr.io/<OWNER>/<REPO>:main`
- 容器端口：`8787`
- 健康检查：HTTP 路径 `/healthz`
- 环境变量（示例）：
  - PORT=8787
  - CORS_ORIGINS=https://your-frontend-domain.com
  - OPENAI_API_KEY=（如有）
  - MODEL_ENDPOINT=（如有）
  - MODEL_NAME=（如有）
  - LOG_LEVEL=info
- 资源与扩缩容：按需设置
- 完成后部署并访问生成的后端域名（例如 `https://xxxxx.tcloudbaseapp.com`）

4) 前端对接
- 在 Vite 前端项目中设置 `VITE_API_BASE` 为后端域名
- 确保后端 `CORS_ORIGINS` 包含前端域名（含协议）

5) 可选：自动在 CI 后调用 CloudBase API 部署
- 若希望镜像构建完自动更新 CloudBase Run，需要在 workflow 中添加调用 CloudBase API 的步骤，并在 GitHub Secrets 中配好 `TCB_SECRET_ID` / `TCB_SECRET_KEY` / `TCB_ENV_ID` / `TCB_RUN_SERVICE_NAME`。
- 我可以按需帮你添加这一步（需要你确认并提供最小权限的腾讯云子账号凭证后配置为 Secrets）。

4) 验证要点
- 访问：`https://<backend-domain>/healthz` 应返回 `ok`
- 访问：`https://<backend-domain>/api/personas` 返回 personas 列表
- POST `/api/llm/chat` 和 GET `/api/llm/stream` 流式测试（浏览器 EventSource 或我提供的 `tools/test_sse_client.cjs`）

5) 常见问题与排查
- 构建失败：在 Actions 里查看日志，常见为依赖安装失败或 Dockerfile 路径错误
- 部署失败：检查 CloudBase Run 的镜像地址、端口、健康检查路径与环境变量
- CORS 报错：确保前端域名在 `CORS_ORIGINS` 中

如果你同意，我将把这两个文件提交到仓库（已创建）。接下来我会给你一份“GitHub Secrets 配置清单（精确字段名）”和一条触发 workflow 的简单步骤说明。