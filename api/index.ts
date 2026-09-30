let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appInstance) {
      const module = await import('../server/index.js');
      appInstance = module.app;
    }
    return appInstance(req, res);
  } catch (err: any) {
    console.error('[SERVERLESS_BOOT_ERROR]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'SERVERLESS_BOOT_ERROR',
      message: err?.message || String(err),
      name: err?.name,
      code: err?.code,
      stack: err?.stack?.split('\n').slice(0, 5)
    }));
  }
}
