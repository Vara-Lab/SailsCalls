// scripts/cjs-dts-bridge.mjs
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

const entryDts = 'lib/index.d.ts';
const bridgePath = 'lib/cjs/index.d.ts';
const bridgeContent =
  `export * from '../index';\n` +
  `export { default } from '../index';\n`;

async function main() {
  try {
    // Asegura que existen las declaraciones ESM
    await fs.access(entryDts);
  } catch {
    console.error(`[cjs-dts-bridge] No existe ${entryDts}. Genera primero las declaraciones (.d.ts).`);
    process.exit(1);
  }

  await fs.mkdir(dirname(bridgePath), { recursive: true });
  await fs.writeFile(bridgePath, bridgeContent, 'utf8');

  console.log(`[cjs-dts-bridge] Created ${bridgePath}`);
}

main().catch((e) => {
  console.error('[cjs-dts-bridge] Error:', e);
  process.exit(1);
});
