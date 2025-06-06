// main.ts
import { Application } from \"https://deno.land/x/oak@v12.6.1/mod.ts\";
import { router } from \"./routes.ts\";
import { logger } from \"./middleware/logger.ts\";

const app = new Application();
const PORT = Deno.env.get(\"PORT\") || \"8000\";

// 中间件
app.use(logger);
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(\"listen\", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 启动服务器
await app.listen({ port: Number(PORT) });
