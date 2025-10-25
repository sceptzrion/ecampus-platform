// lib/dev-guard.ts
export function assertDev() {
  const allow = process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_TOOLS !== "0";
  if (!allow) {
    const err: any = new Error("Not Found");
    err.status = 404;
    throw err;
  }
}
