import { DurableObject } from "cloudflare:workers";

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export class HashtagWeb3 extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const container = ctx.container;
    if (container.running) {
      void ctx.blockConcurrencyWhile(() => container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS));
    }
  }

  async fetch(request) {
    this.starting ??= this.startAndWait().finally(() => {
      this.starting = undefined;
    });
    await this.starting;
    const url = new URL(request.url);
    url.protocol = "http:";
    url.host = "container";
    const forwarded = new Request(url, request);
    forwarded.headers.delete("host");
    return this.ctx.container.getTcpPort(8080).fetch(forwarded);
  }

  async startAndWait() {
    const container = this.ctx.container;
    if (!container.running) {
      container.start({
        image: container.images.base,
        instance: "standard-2",
        enableInternet: true,
      });
    }
    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);
    const port = container.getTcpPort(8080);
    let lastError;
    for (let attempt = 0; attempt < 150; attempt++) {
      try {
        const response = await port.fetch("http://container/icon.png", { signal: AbortSignal.timeout(2000) });
        await response.body?.cancel();
        if (response.ok) return;
        throw new Error(`Health check returned ${response.status}`);
      } catch (error) {
        lastError = error;
        await scheduler.wait(2000);
      }
    }
    throw new Error("Container did not become ready on port 8080", { cause: lastError });
  }
}

export default {
  fetch(request, env) {
    return env.HASHTAGWEB3.getByName("web").fetch(request);
  },
};
