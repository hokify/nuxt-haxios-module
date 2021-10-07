import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { AxiosWrapper } from './axios'
import { AxiosOptions } from '~/types'

const options = JSON.parse('<%= JSON.stringify(options) %>')

/*
const axiosExtra: any = {

}

// Request helpers ($get, $post, ...)
for (const method of ['request', 'delete', 'get', 'head', 'options', 'post', 'put', 'patch']) {
  axiosExtra['$' + method] = function () { return this[method].apply(this, arguments).then((res: any) => res && res.data) }
}

const extendAxiosInstance = (axios: any) => {
  for (const key in axiosExtra) {
    axios[key] = axiosExtra[key].bind(axios)
  }
} */

const createAxiosInstance = (axiosOptions: AxiosOptions) => {
  if (options.retry) { axiosOptions.retry = options.retry }

  // Create new axios instance
  const axios = new AxiosWrapper(axiosOptions)

  // Setup interceptors
  // <% if (options.debug) { %>setupDebugInterceptor(axios) <% } %>
  if (options.credentials) { setupCredentialsInterceptor(axios) }
  if (options.progress) { setupProgress(axios) }

  return axios
}

/*
const log = (level, ...messages) => console[level]('[Gaxios]', ...messages)

const setupDebugInterceptor = axios => {
  // request
  axios.onRequestError(error => {
    log('error', 'Request error:', error)
  })

  // response
  axios.onResponseError(error => {
    log('error', 'Response error:', error)
  })
  axios.onResponse(res => {
      log(
        'info',
        '[' + (res.status + ' ' + res.statusText) + ']',
        '[' + res.config.method.toUpperCase() + ']',
        res.config.url)

      if (process.browser) {
        console.log(res)
      } else {
        console.log(JSON.stringify(res.data, undefined, 2))
      }

      return res
  })
*/

const setupCredentialsInterceptor = (axios: AxiosWrapper) => {
  // Send credentials only to relative and API Backend requests
  axios.onRequest((config) => {
    if (config.withCredentials === undefined) {
      if (!/^https?:\/\//i.test(config.url) || config.url.indexOf(config.baseURL) === 0) {
        config.withCredentials = true
      }
    }
  })
}

const setupProgress = (axios: AxiosWrapper) => {
  if (process.server) {
    return
  }

  // A noop loading inteterface for when $nuxt is not yet ready
  const noopLoading = {
    finish: () => { },
    start: () => { },
    fail: () => { },
    set: () => { }
  }

  const $loading = () => {
    const $nuxt = typeof window !== 'undefined' && window[options.globalName] as any
    return ($nuxt && $nuxt.$loading && $nuxt.$loading.set) ? $nuxt.$loading : noopLoading
  }

  let currentRequests = 0

  axios.onRequest((config) => {
    if (config && config.progress === false) {
      return
    }

    currentRequests++
  })

  axios.onResponse((response) => {
    if (response && response.config && response.config.progress === false) {
      return
    }

    currentRequests--
    if (currentRequests <= 0) {
      currentRequests = 0
      $loading().finish()
    }
  })

  axios.onError((error) => {
    if (error && error.config && error.config.progress === false) {
      return
    }

    currentRequests--

    /*
    if (Gaxios.isCancel(error)) {
      if (currentRequests <= 0) {
        currentRequests = 0
        $loading().finish()
      }
      return
    } */

    $loading().fail()
    $loading().finish()
  })

  const onProgress = (e: { loaded: number; total: number }) => {
    if (!currentRequests || !e.total) {
      return
    }
    const progress = ((e.loaded * 100) / (e.total * currentRequests))
    $loading().set(Math.min(100, progress))
  }

  axios.defaults.onUploadProgress = onProgress
  axios.defaults.onDownloadProgress = onProgress
}

export default (ctx: Context, inject: Inject) => {
  // runtimeConfig
  const runtimeConfig = ctx.$config && ctx.$config.axios || {}
  // baseURL
  const baseURL = process.browser
    ? (runtimeConfig.browserBaseURL || runtimeConfig.browserBaseUrl || runtimeConfig.baseURL || runtimeConfig.baseUrl || options.browserBaseURL || '')
    : (runtimeConfig.baseURL || runtimeConfig.baseUrl || process.env._AXIOS_BASE_URL_ || options.baseURL || '')

  // Create fresh objects for all default header scopes
  // Gaxios creates only one which is shared across SSR requests!
  // https://github.com/mzabriskie/axios/blob/master/lib/defaults.js
  const headers:any = {} /** <%= JSON.stringify(options.headers2, null, 4) %> */

  const axiosOptions = {
    baseURL,
    headers
  }

  if (process.server && options.proxyHeaders && ctx.req && ctx.req.headers) {
    // Proxy SSR request headers headers
    const reqHeaders = { ...ctx.req.headers }
    for (const h of options.proxyHeadersIgnore) {
      delete reqHeaders[h]
    }
    if (!axiosOptions.headers) { axiosOptions.headers = {} }
    axiosOptions.headers.common = { ...reqHeaders, ...axiosOptions.headers.common }
  }

  if (process.server) {
    // Don't accept brotli encoding because Node can't parse it
    if (!axiosOptions.headers) { axiosOptions.headers = {} }
    if (!axiosOptions.headers.common) { axiosOptions.headers.common = {} }
    axiosOptions.headers.common['accept-encoding'] = 'gzip, deflate'
  }

  const axios = createAxiosInstance(axiosOptions)

  // Inject axios to the context as $axios
  ctx.$axios = axios
  inject('axios', axios)
}
