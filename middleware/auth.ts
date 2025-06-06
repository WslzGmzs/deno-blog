// middleware/auth.ts
import { Context, Next } from \"https://deno.land/x/oak@v12.6.1/mod.ts\";
import { create, verify } from \"https://deno.land/x/djwt@v2.9.1/mod.ts\";

const JWT_SECRET = Deno.env.get(\"JWT_SECRET\") || \"your-default-secret-key\";

// 创建一个加密密钥
const getKey = async () => {
  const encoder = new TextEncoder();
  const keyBuf = encoder.encode(JWT_SECRET);
  return await crypto.subtle.importKey(
    \"raw\",
    keyBuf,
    { name: \"HMAC\", hash: \"SHA-256\" },
    true,
    [\"sign\", \"verify\"],
  );
};

export const authMiddleware = async (ctx: Context, next: Next) => {
  try {
    const authHeader = ctx.request.headers.get(\"Authorization\");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: \"No authorization token provided\",
      };
      return;
    }
    
    const token = authHeader.split(\" \")[1];
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: \"Invalid token format\",
      };
      return;
    }
    
    const key = await getKey();
    const payload = await verify(token, key);
    
    ctx.state.user = {
      id: payload.sub,
      username: payload.username,
    };
    
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = {
      success: false,
      message: \"Authentication failed\",
    };
  }
};
