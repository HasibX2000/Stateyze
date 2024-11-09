import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
];

const plugins = [
  typescript({
    tsconfig: "./tsconfig.json",
    exclude: ["**/*.test.ts", "**/*.test.tsx"],
  }),
  resolve(),
  commonjs(),
];

export default [
  // UMD build
  {
    input: "src/index.ts",
    output: {
      name: "Stateyze",
      file: pkg.unpkg,
      format: "umd",
      sourcemap: true,
      globals: {
        react: "React",
        immer: "immer",
      },
    },
    external,
    plugins: [...plugins, terser()],
  },
  // ESM and CJS builds
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    external,
    plugins,
  },
];
