const { execFileSync, spawn } = require('child_process');
const path = require('path');

const DEFAULT_AVD = 'FordSpecPulse_API_36';
const isWindows = process.platform === 'win32';

function androidSdkRoot() {
  return (
    process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    (process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
      : undefined)
  );
}

function prependAndroidToolsToPath(sdkRoot) {
  const entries = [
    path.join(sdkRoot, 'platform-tools'),
    path.join(sdkRoot, 'emulator'),
    path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin'),
  ];

  process.env.ANDROID_HOME = sdkRoot;
  process.env.ANDROID_SDK_ROOT = sdkRoot;
  process.env.PATH = `${entries.join(path.delimiter)}${path.delimiter}${process.env.PATH || ''}`;
}

function tool(sdkRoot, folder, executable) {
  const binary = isWindows ? `${executable}.exe` : executable;
  return path.join(sdkRoot, folder, binary);
}

function run(command, args = []) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function connectedAndroidDevices(adb) {
  try {
    return run(adb, ['devices'])
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^\S+\s+device$/.test(line))
      .map((line) => line.split(/\s+/)[0]);
  } catch {
    return [];
  }
}

function listAvds(emulator) {
  try {
    return run(emulator, ['-list-avds'])
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function waitForBoot(adb, timeoutMs = 300000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const devices = connectedAndroidDevices(adb);

    for (const serial of devices) {
      try {
        const bootCompleted = run(adb, ['-s', serial, 'shell', 'getprop', 'sys.boot_completed']).trim();
        if (bootCompleted === '1') {
          return serial;
        }
      } catch {
        // The emulator can be visible before adb is ready. Keep polling.
      }
    }

    await sleep(5000);
  }

  throw new Error('Timed out waiting for the Android emulator to finish booting.');
}

async function ensureAndroidTarget() {
  const sdkRoot = androidSdkRoot();

  if (!sdkRoot) {
    throw new Error('ANDROID_HOME is not set and the default Android SDK location could not be inferred.');
  }

  prependAndroidToolsToPath(sdkRoot);

  const adb = tool(sdkRoot, 'platform-tools', 'adb');
  const emulator = tool(sdkRoot, 'emulator', 'emulator');

  const connected = connectedAndroidDevices(adb);
  if (connected.length > 0) {
    console.log(`Using connected Android device: ${connected[0]}`);
    return;
  }

  const avds = listAvds(emulator);
  const requestedAvd = process.env.EXPO_ANDROID_AVD || DEFAULT_AVD;
  const avd = avds.includes(requestedAvd) ? requestedAvd : avds[0];

  if (!avd) {
    throw new Error('No Android emulator was found. Create an AVD first, then rerun npm run android.');
  }

  console.log(`Starting Android emulator: ${avd}`);
  const child = spawn(emulator, ['-avd', avd, '-netdelay', 'none', '-netspeed', 'full'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  const serial = await waitForBoot(adb);
  console.log(`Android emulator is ready: ${serial}`);
}

async function main() {
  await ensureAndroidTarget();

  const npx = isWindows ? 'npx.cmd' : 'npx';
  const expo = spawn(npx, ['expo', 'start', '--android', ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: isWindows,
  });

  expo.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
