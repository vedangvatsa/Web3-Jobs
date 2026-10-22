import { spawn } from 'node:child_process';

function writerError(message, code, fatal = false, cause) {
  return Object.assign(new Error(message, { cause }), { code, fatal });
}

export async function runNewsWriterProcess(binary, args, {
  cwd, env, timeoutMs, graceMs = 5_000, killWaitMs = 5_000,
  spawnProcess = spawn, kill = process.kill.bind(process), signals = process,
  platform = process.platform, now = Date.now,
} = {}) {
  if (!['linux', 'darwin'].includes(platform)) throw writerError('News writer process groups require Linux or macOS', 'NEWS_WRITER_PLATFORM', true);
  for (const [name, value, max] of [['timeoutMs', timeoutMs, 90 * 60_000], ['graceMs', graceMs, 10_000], ['killWaitMs', killWaitMs, 10_000]]) {
    if (!Number.isInteger(value) || value <= 0 || value > max) throw writerError(`Invalid news writer ${name}`, 'NEWS_WRITER_LIMIT', true);
  }
  let child;
  try { child = spawnProcess(binary, args, { cwd, env, stdio: 'inherit', detached: true, shell: false }); }
  catch (cause) { throw writerError(`Could not start news writer: ${cause.message}`, 'NEWS_WRITER_START', true, cause); }

  const group = child.pid;
  const ownsGroup = Number.isInteger(group) && group > 1 && group !== process.pid;
  let failure, closed = false, groupGone = false, wake;
  const stopped = new Promise(resolve => { wake = resolve; });
  const onError = cause => {
    failure = writerError(`News writer process failed: ${cause.message}`, 'NEWS_WRITER_PROCESS', true, cause);
    wake();
  };
  const onExit = (code, signal) => {
    if (!failure && code !== 0) failure = writerError(`News writer exited ${code ?? signal}`, 'NEWS_WRITER_EXIT');
    wake();
  };
  const onClose = (code, signal) => { closed = true; onExit(code, signal); };
  const interrupt = signal => {
    failure = writerError(`News writer interrupted by ${signal}`, 'NEWS_WRITER_INTERRUPTED', true);
    wake();
  };
  const onTerm = () => interrupt('SIGTERM'), onInt = () => interrupt('SIGINT');
  child.on('error', onError);
  child.once('exit', onExit);
  child.once('close', onClose);
  signals.on('SIGTERM', onTerm);
  signals.on('SIGINT', onInt);
  const timer = setTimeout(() => {
    failure ||= writerError(`News writer exceeded its ${timeoutMs}ms budget; saved progress will be rechecked`, 'NEWS_WRITER_TIMEOUT');
    wake();
  }, timeoutMs);

  const signalGroup = signal => {
    if (groupGone) return false;
    try { kill(-group, signal); return true; }
    catch (cause) {
      if (cause.code === 'ESRCH') { groupGone = true; return false; }
      throw writerError(`Could not stop owned news writer group ${group}: ${cause.message}`, 'NEWS_WRITER_CLEANUP', true, cause);
    }
  };
  try {
    await stopped;
    clearTimeout(timer);
    if (!ownsGroup) throw failure?.fatal ? failure : writerError('News writer did not create an owned process group', 'NEWS_WRITER_GROUP', true, failure);
    // A successful writer exit can still leave tool processes running in its group.
    signalGroup('SIGTERM');
    const killAt = now() + graceMs, stopAt = killAt + killWaitMs;
    let killed = false;
    while (true) {
      if (!signalGroup(0) && closed) break;
      if (!killed && now() >= killAt) { signalGroup('SIGKILL'); killed = true; continue; }
      if (now() >= stopAt) throw writerError('Owned news writer tools did not stop; refusing to audit while they may write', 'NEWS_WRITER_CLEANUP', true);
      await new Promise(resolve => setTimeout(resolve, Math.min(50, (killed ? stopAt : killAt) - now())));
    }
    if (failure) throw Object.assign(failure, { writerStopped: true });
    return { code: 0, writerStopped: true };
  } finally {
    clearTimeout(timer);
    signals.off('SIGTERM', onTerm);
    signals.off('SIGINT', onInt);
    child.off('exit', onExit);
    child.off('close', onClose);
    child.off('error', onError);
  }
}
