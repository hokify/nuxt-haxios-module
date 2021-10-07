import Gaxios, { GaxiosOptions, GaxiosResponse } from 'gaxios'
import { InterceptorHandler, InterceptorManager, ResultFunction } from './InterceptorManager'
import { AxiosOptions } from '~/types'

interface AxiosRequestConfig<D = any> extends GaxiosOptions {
  progress?: boolean;
  data?: D;
  onDownloadProgress?: (progressEvent: any) => void;
  withCredentials?: boolean;
}

export interface AxiosResponse<T = unknown, D = any> extends GaxiosResponse<T> {
  config: AxiosRequestConfig<D>;
}

type Scope = 'common' | 'delete' | 'get' | 'head' | 'options' | 'post' | 'put' | 'patch';

export class AxiosWrapper {
  private gaxiosInstance: Gaxios.Gaxios;

  constructor (private config: AxiosOptions = {}) {
    this.gaxiosInstance = new Gaxios.Gaxios({
      ...config,
      baseURL: '',
      headers: {},
      retry: (config.retry === true),
      retryConfig: (typeof config.retry === 'object' && config.retry) || undefined
    })

    // Intercept to apply default headers
    this.onRequest((config) => {
      config.headers = { ...this.config.headers?.common, ...config.headers }
    })

    this.defaults = {
      ...this.gaxiosInstance.defaults,
      headers: {
        common: {
          ...this.config.headers?.common,
          ...this.gaxiosInstance.defaults.headers
        }
      }
    }
  }

  defaults: AxiosRequestConfig;

  interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  }

  request<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (requestParams: AxiosRequestConfig<D>): Promise<R> {
    if (!requestParams.url?.startsWith('http://') && !requestParams.url?.startsWith('https://')) {
      requestParams.baseURL = this.config.baseURL
      // sanitize baseURL
      if (!requestParams.baseURL?.endsWith('/')) {
        requestParams.baseURL += '/'
      }
    }
    // filter out skipped interceptors
    const requestInterceptorChain: any[] = []
    let synchronousRequestInterceptors = true
    this.interceptors.request.forEach(function unshiftRequestInterceptors (interceptor: InterceptorHandler) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(requestParams) === false) {
        return
      }

      synchronousRequestInterceptors = !!(synchronousRequestInterceptors && interceptor.synchronous)

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected)
    })

    const responseInterceptorChain: any[] = []
    this.interceptors.response.forEach(function pushResponseInterceptors (interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected)
    })

    let promise: Promise<any>

    if (!synchronousRequestInterceptors) {
      let chain = [this.gaxiosInstance.request.bind(this.gaxiosInstance), undefined]

      Array.prototype.unshift.apply(chain, requestInterceptorChain)
      chain = chain.concat(responseInterceptorChain)

      promise = Promise.resolve(requestParams)

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift())
      }

      return promise
    }

    let newConfig = { ...requestParams }
    while (requestInterceptorChain.length) {
      const onFulfilled = requestInterceptorChain.shift()
      const onRejected = requestInterceptorChain.shift()
      try {
        newConfig = onFulfilled(newConfig)
      } catch (error) {
        onRejected(error)
        break
      }
    }

    try {
      console.log('newConfig', newConfig)
      promise = this.gaxiosInstance.request(newConfig)
    } catch (error) {
      return Promise.reject(error)
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift())
    }

    return promise
  }

  async $request<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (requestParams: AxiosRequestConfig<D>): Promise<T> {
    return (await this.request<T, R, D>(requestParams)).data
  }

  getUri<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>> (config: AxiosRequestConfig): Promise<R> {
    return this.request(config)
  }

  get<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'GET', ...config })
  }

  async $get<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.get<T, R, D>(url, config)).data
  }

  delete<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'DELETE', ...config })
  }

  async $delete<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.delete<T, R, D>(url, config)).data
  }

  head<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'HEAD', ...config })
  }

  async $head<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.head<T, R, D>(url, config)).data
  }

  options<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'OPTIONS', ...config })
  }

  async $options<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.options<T, R, D>(url, config)).data
  }

  post<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'POST', ...config })
  }

  async $post<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.post<T, R, D>(url, data, config)).data
  }

  put<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'PUT', ...config })
  }

  async $put<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.put<T, R, D>(url, data, config)).data
  }

  patch<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
    return this.request({ url, method: 'PATCH', ...config })
  }

  async $patch<T = unknown, R extends AxiosResponse<T> = AxiosResponse<T>, D = any> (url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this.patch<T, R, D>(url, data, config)).data
  }

  setBaseURL (baseURL: string) {
    this.gaxiosInstance.defaults.baseURL = baseURL
  }

  setHeader (name: string, value: string, scopes: Scope | Scope[] = 'common') {
    for (const scope of (Array.isArray(scopes) ? scopes : [scopes])) {
      if (!value) {
        delete this.config.headers?.[scope]?.[name]
        continue
      }
      if (!this.config.headers) {
        this.config.headers = {}
      }
      if (!this.config.headers[scope]) {
        this.config.headers[scope] = {}
      }
      this.config.headers[scope]![name] = value
    }
  }

  setToken (token: string, type: string, scopes: Scope | Scope[] = 'common') {
    const value = !token ? null : (type ? type + ' ' : '') + token
    if (value) {
      this.setHeader('Authorization', value, scopes)
    }
  }

  onRequest (fn: ResultFunction<AxiosRequestConfig & {url: string ; baseURL: string}>) {
    this.interceptors.request.use(config => fn(config) || config)
  }

  onResponse (fn: ResultFunction<AxiosResponse>) {
    this.interceptors.response.use(response => fn(response) || response)
  }

  onRequestError (fn: ResultFunction<any>) {
    this.interceptors.request.use(undefined, error => fn(error) || Promise.reject(error))
  }

  onResponseError (fn: ResultFunction<any>) {
    this.interceptors.response.use(undefined, error => fn(error) || Promise.reject(error))
  }

  onError (fn: ResultFunction) {
    this.onRequestError(fn)
    this.onResponseError(fn)
  }

  create (config?: AxiosOptions) {
    return new AxiosWrapper(config)
  }
}

const instance = new AxiosWrapper()

export default {
  ...instance,
  request: instance.request.bind(instance),

  $request: instance.$request.bind(instance),
  getUri: instance.getUri.bind(instance),

  get: instance.get.bind(instance),
  $get: instance.$get.bind(instance),

  delete: instance.delete.bind(instance),
  $delete: instance.$delete.bind(instance),

  head: instance.head.bind(instance),
  $head: instance.$head.bind(instance),

  options: instance.options.bind(instance),
  $options: instance.$options.bind(instance),

  post: instance.post.bind(instance),
  $post: instance.$post.bind(instance),

  put: instance.put.bind(instance),
  $put: instance.$put.bind(instance),

  patch: instance.patch.bind(instance),
  $patch: instance.$patch.bind(instance),

  setBaseURL: instance.setBaseURL.bind(instance),
  setHeader: instance.setHeader.bind(instance),

  setToken: instance.setToken.bind(instance),
  onRequest: instance.onRequest.bind(instance),

  onResponse: instance.onResponse.bind(instance),
  onRequestError: instance.onRequestError.bind(instance),

  onResponseError: instance.onResponseError.bind(instance),
  onError: instance.onError.bind(instance),

  create: instance.create.bind(instance)
}
