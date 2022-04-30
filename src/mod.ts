import path from 'path';
import fs from 'fs';
import { transform } from '@svgr/core';

type FileInfoType = { ext: string; dir: string; name: string; path: string };

interface Options {
  output: string;
  replaceAttrValues?: { [k: string]: string };
}

export default function generateReactSvg({
  output,
  replaceAttrValues,
}: Options) {
  return (source: any[]) => {
    // console.log(source[0].filesInfo[0]);

    let indexExportCode = '';

    const result = source[0].filesInfo
      .filter((it: FileInfoType) => {
        return it.ext === '.svg';
      })
      .map((fileInfo: FileInfoType) => {
        const svgName = fileInfo.dir.split(path.sep).slice(-1);
        const svgStyle = fileInfo.name;

        // 获取文件名 activity_filled.tsx
        const generatedFileName = `${svgName}_${svgStyle}`;
        // 导出的默认组件名 ActivityFilled
        const exportComponentName = toHump(generatedFileName);

        // index 里代码 : export {default as } from './icons/'
        indexExportCode += `export { default as ${exportComponentName} } from './icons/${generatedFileName}';\n`;

        const svgCode = fs.readFileSync(fileInfo.path, 'utf-8');
        try {
          const jsCode = transform.sync(
            svgCode,
            {
              plugins: [
                '@svgr/plugin-svgo',
                '@svgr/plugin-jsx',
                '@svgr/plugin-prettier',
              ],
              icon: true,
              typescript: true,
              replaceAttrValues,
            },
            { componentName: exportComponentName },
          );

          return {
            pathname: path.resolve(output, `./icons/${generatedFileName}.tsx`),
            code: jsCode,
          };
        } catch (error) {
          console.error(error);
        }

        return [];
      });
    return [
      ...result,
      {
        pathname: output,
        code: indexExportCode,
      },
    ];
  };
}

// 下划线转驼峰
function toHump(name: string) {
  return name
    .split('_')
    .map((it) => {
      return it.replace(/^\w/g, (it) => {
        return it.toUpperCase();
      });
    })
    .join('');
}
