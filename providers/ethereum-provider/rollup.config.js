import { name, dependencies, peerDependencies } from "./package.json";
import createConfig, { input, plugins } from "../../rollup.config";
import alias from "@rollup/plugin-alias";
import path from "path";

const options = { inlineDynamicImports: true };
// @walletconnect/modal has dynamic imports, so we need to enable inlineDynamicImports
export default createConfig(
  name,
  Object.keys({ ...dependencies, ...peerDependencies }).concat("@reown/appkit/core"),
  options,
  options,
  options,
  [
    {
      input,
      plugins: [
        alias({
          entries: [
            {
              find: "./utils/appkit",
              replacement: path.resolve(__dirname, `src/utils/appkit.native.ts`),
            },
          ],
        }),
        ...plugins,
      ],
      output: {
        file: "./dist/index.native.js",
        format: "cjs",
        exports: "named",
        name,
        sourcemap: true,
        ...options,
      },
    },
  ],
);
