// rollup.config.js
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/axios.ts',
  output: {
    file: 'lib/axioswrapper.js',
    format: 'cjs'
  },
  context: 'this',
  plugins: [typescript()]
}
