#!/usr/bin/env node

/**
 * Patches yttrium.js to use lazy TextDecoder/TextEncoder initialization.
 *
 * The wasm-bindgen generated code creates TextDecoder/TextEncoder at module scope,
 * which crashes in React Native debug builds where these globals aren't available
 * at parse time (the fast-text-encoding polyfill from react-native-compat loads later).
 *
 * This script converts the eager initialization to lazy getters so the instances
 * are created on first use, by which point the polyfills are available.
 *
 * Usage: node scripts/patch_yttrium_lazy_init.js [path-to-yttrium.js]
 *   Default path: packages/pay/src/providers/wasm/yttrium.js
 */

const fs = require("fs");
const path = require("path");

const filePath =
  process.argv[2] ||
  path.join(__dirname, "../packages/pay/src/providers/wasm/yttrium.js");

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

let code = fs.readFileSync(filePath, "utf-8");
const original = code;

// --- TextDecoder: eager init → lazy getter ---

const textDecoderEager =
  /const cachedTextDecoder =\s*typeof TextDecoder !== "undefined"\s*\? new TextDecoder\("utf-8", \{ ignoreBOM: true, fatal: true \}\)\s*: \{\s*decode: \(\) => \{\s*throw Error\("TextDecoder not available"\);\s*\},?\s*\};\s*if \(typeof TextDecoder !== "undefined"\) \{\s*cachedTextDecoder\.decode\(\);\s*\}/;

const textDecoderLazy = `let cachedTextDecoder = null;

function getTextDecoder() {
  if (!cachedTextDecoder) {
    if (typeof TextDecoder === "undefined") {
      throw Error("TextDecoder not available");
    }
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
  }
  return cachedTextDecoder;
}`;

if (!textDecoderEager.test(code)) {
  console.error("WARNING: Could not find TextDecoder eager init pattern — skipping.");
} else {
  code = code.replace(textDecoderEager, textDecoderLazy);
  // Replace usage sites but protect the warmup call inside getTextDecoder()
  // by temporarily swapping it with a placeholder
  code = code.replace("cachedTextDecoder.decode();\n  }\n  return cachedTextDecoder;", "__WARMUP_PLACEHOLDER__");
  code = code.replace(/cachedTextDecoder\.decode\(/g, "getTextDecoder().decode(");
  code = code.replace("__WARMUP_PLACEHOLDER__", "cachedTextDecoder.decode();\n  }\n  return cachedTextDecoder;");
  console.log("Patched TextDecoder to lazy initialization.");
}

// --- TextEncoder: eager init + encodeString → lazy getter + function ---

const textEncoderEager =
  /const cachedTextEncoder =\s*typeof TextEncoder !== "undefined"\s*\? new TextEncoder\("utf-8"\)\s*: \{\s*encode: \(\) => \{\s*throw Error\("TextEncoder not available"\);\s*\},?\s*\};\s*const encodeString =\s*typeof cachedTextEncoder\.encodeInto === "function"\s*\? function \(arg, view\) \{\s*return cachedTextEncoder\.encodeInto\(arg, view\);\s*\}\s*: function \(arg, view\) \{\s*const buf = cachedTextEncoder\.encode\(arg\);\s*view\.set\(buf\);\s*return \{\s*read: arg\.length,\s*written: buf\.length,?\s*\};\s*\};/;

const textEncoderLazy = `let cachedTextEncoder = null;

function getTextEncoder() {
  if (!cachedTextEncoder) {
    if (typeof TextEncoder === "undefined") {
      throw Error("TextEncoder not available");
    }
    cachedTextEncoder = new TextEncoder("utf-8");
  }
  return cachedTextEncoder;
}

function encodeString(arg, view) {
  const encoder = getTextEncoder();
  if (typeof encoder.encodeInto === "function") {
    return encoder.encodeInto(arg, view);
  }
  const buf = encoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length,
  };
}`;

if (!textEncoderEager.test(code)) {
  console.error("WARNING: Could not find TextEncoder eager init pattern — skipping.");
} else {
  code = code.replace(textEncoderEager, textEncoderLazy);
  code = code.replace(/cachedTextEncoder\.encode\(/g, "getTextEncoder().encode(");
  console.log("Patched TextEncoder to lazy initialization.");
}

if (code === original) {
  console.log("No changes needed — file already patched or patterns not found.");
} else {
  fs.writeFileSync(filePath, code, "utf-8");
  console.log(`Wrote patched file: ${filePath}`);
}
