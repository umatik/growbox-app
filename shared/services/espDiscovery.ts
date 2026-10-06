import Storage from "expo-sqlite/kv-store";

// The router hands the ESP an address by DHCP, so after a router reset it
// can come back under a new IP. When the known address stops answering,
// the app looks for the controller in the same /24 network and remembers
// where it found it.

const STORAGE_KEY = "espApiUrl";
const PROBE_TIMEOUT_MS = 1500;
const PARALLEL_PROBES = 24;

export function loadSavedApiUrl(): string | null {
  try {
    return Storage.getItemSync(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveApiUrl(url: string) {
  try {
    Storage.setItemSync(STORAGE_KEY, url);
  } catch {
    // only a cache - the next discovery finds it again
  }
}

// "http://192.168.18.85/api" -> parts, null for a hostname
function parseUrl(url: string) {
  const match = url.match(
    /^(https?:\/\/)(\d+)\.(\d+)\.(\d+)\.(\d+)(:\d+)?(\/.*)?$/,
  );

  if (!match) return null;

  return {
    scheme: match[1],
    prefix: `${match[2]}.${match[3]}.${match[4]}`,
    last: Number(match[5]),
    port: match[6] ?? "",
    path: match[7] ?? "",
  };
}

// is this our controller? /config answers with config, sensor and status
async function probe(apiUrl: string, apiToken: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}/config`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!response.ok) return false;

    const body = await response.json();

    return Boolean(body?.config && body?.status && body?.sensor);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// Scans the known address' /24, nearest addresses first. Resolves with the
// controller's API URL, or null when it isn't on the network.
export async function discoverEsp(
  knownUrl: string,
  apiToken: string,
): Promise<string | null> {
  const parts = parseUrl(knownUrl);

  if (!parts) return null;

  const urlFor = (host: number) =>
    `${parts.scheme}${parts.prefix}.${host}${parts.port}${parts.path}`;

  const hosts = Array.from({ length: 254 }, (_, index) => index + 1)
    .filter((host) => host !== parts.last)
    .sort((a, b) => Math.abs(a - parts.last) - Math.abs(b - parts.last));

  let found: string | null = null;
  let next = 0;

  const worker = async () => {
    while (!found && next < hosts.length) {
      const url = urlFor(hosts[next]);
      next += 1;

      if (await probe(url, apiToken)) {
        found = found ?? url;
      }
    }
  };

  await Promise.all(Array.from({ length: PARALLEL_PROBES }, worker));

  return found;
}
