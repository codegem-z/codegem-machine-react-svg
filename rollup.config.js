import typescript from "@rollup/plugin-typescript";
import fileSize from 'rollup-plugin-filesize';
import pkg from './package.json';

// 构建两个文件
export default [
  {
    input: 'src/index.ts',
    output: {
      name: pkg.name,
      file: 'dist/index.js',
      format: 'esm',
      sourcemap:true,
    },
    plugins: [fileSize(), typescript()],
  },
];
