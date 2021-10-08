// rollup.config.js
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'lib/plugin.js',
    format: 'cjs',
    exports: 'default'
  },
  context: 'this',
  plugins: [typescript()],
  external: ['haxios']
}
