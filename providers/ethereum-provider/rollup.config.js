import { name, dependencies, peerDependencies } from "./package.json";
import createConfig from "../../rollup.config";
// @walletconnect/modal has dynamic imports, so we need to enable inlineDynamicImports
export default createConfig(
  name,
  Object.keys({ ...dependencies, ...peerDependencies }).concat(["@reown/appkit/core"]),
  { inlineDynamicImports: true },
  { inlineDynamicImports: true },
  { inlineDynamicImports: true },
);
