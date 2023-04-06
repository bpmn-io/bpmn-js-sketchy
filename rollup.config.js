import { terser } from 'rollup-plugin-terser';
import { string } from 'rollup-plugin-string';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';

function pgl(plugins = []) {
  return [
    string({
      include: '**/*.svg'
    }),
    resolve({
      browser: true
    }),
    commonjs(),
    ...plugins
  ];
}

const srcEntry = pkg.source;

const umdDist = pkg['unpkg'];

const umdName = 'BpmnJSSketchy';

export default [

  // browser-friendly UMD build
  {
    input: srcEntry,
    output: {
      file: umdDist.replace(/\.js$/, '.prod.js'),
      format: 'umd',
      name: umdName
    },
    plugins: pgl([
      terser()
    ])
  },
  {
    input: srcEntry,
    output: {
      file: umdDist,
      format: 'umd',
      name: umdName
    },
    plugins: pgl()
  },
  {
    input: srcEntry,
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'es', exports: 'default' }
    ],
    external: [
      'inherits',
      'min-dash',
      'min-dom',
      'tiny-svg'
    ],
    plugins: pgl()
  }
];