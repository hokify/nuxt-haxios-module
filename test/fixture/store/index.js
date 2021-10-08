// ensure fetch is available (jsdom fucks up otherwise)

import 'whatwg-fetch'
export default {
  actions: {
    nuxtServerInit ({ commit }, ctx) {
      if (!ctx.$axios) {
        throw new Error('$axios is not defined!')
      }

      if (!ctx.app.$axios) {
        throw new Error('$axios is not defined!')
      }
    }
  }
}
