import { AxiosWrapper, HAxiosResponse, HAxiosRequestConfig, AxiosConfig } from 'haxios'
import { NuxtAxiosOptions, Scope } from '~/types'

export class NuxtAxiosWrapper extends AxiosWrapper {
  constructor (config: NuxtAxiosOptions = {}) {
    super({
      ...config,
      headers: {},
      proxy: undefined,
      retry: (config.retry === true),
      retryConfig: (typeof config.retry === 'object' && config.retry) || undefined
    })

    // Intercept to apply default headers
    this.onRequest((config) => {
      config.headers = { ...this.defaults.headers?.common, ...config.headers }
    })

    this.defaults = {
      ...config,
      headers: {
        common: {
          ...config.headers?.common
        }
      }
    }
  }

  defaults: NuxtAxiosOptions & Omit<AxiosConfig, 'headers' | 'proxy' | 'retry'>;

  async $request<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (requestParams: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.request<T, R, D>(requestParams)).data
  }

  async $get<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.get<T, R, D>(url, config)).data
  }

  async $delete<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.delete<T, R, D>(url, config)).data
  }

  async $head<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.head<T, R, D>(url, config)).data
  }

  async $options<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.options<T, R, D>(url, config)).data
  }

  async $post<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, data?: D, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.post<T, R, D>(url, data, config)).data
  }

  async $put<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, data?: D, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.put<T, R, D>(url, data, config)).data
  }

  async $patch<T = unknown, R extends HAxiosResponse<T> = HAxiosResponse<T>, D = any> (url: string, data?: D, config?: HAxiosRequestConfig<D>): Promise<T> {
    return (await this.patch<T, R, D>(url, data, config)).data
  }

  setHeader (name: string, value: string, scopes: Scope | Scope[] = 'common') {
    for (const scope of (Array.isArray(scopes) ? scopes : [scopes])) {
      if (!value) {
        delete this.defaults.headers?.[scope]?.[name]
        continue
      }
      if (!this.defaults.headers) {
        this.defaults.headers = {}
      }
      if (!this.defaults.headers[scope]) {
        this.defaults.headers[scope] = {}
      }
      this.defaults.headers[scope]![name] = value
    }
  }

  setToken (token: string, type: string, scopes: Scope | Scope[] = 'common') {
    const value = !token ? null : (type ? type + ' ' : '') + token
    if (value) {
      this.setHeader('Authorization', value, scopes)
    }
  }

  onRequest (callback: (config: HAxiosRequestConfig & {url: string ; baseURL: string}) => void | HAxiosRequestConfig | Promise<HAxiosRequestConfig>): void {
    this.interceptors.request.use(config => callback(config) || config)
  }

  onResponse<T = any> (callback: (response: HAxiosResponse<T>) => void | HAxiosResponse<T> | Promise<HAxiosResponse<T>>): void {
    this.interceptors.response.use(response => callback(response) || response)
  }

  // AxiosError
  onRequestError (callback: (error: any) => any): void {
    this.interceptors.request.use(undefined, error => callback(error) || Promise.reject(error))
  }

  // AxiosError
  onResponseError (callback: (error: any) => any): void {
    this.interceptors.response.use(undefined, error => callback(error) || Promise.reject(error))
  }

  onError (callback: (error: any) => any): void {
    this.onRequestError(callback)
    this.onResponseError(callback)
  }

  create (config?: AxiosConfig) {
    return new NuxtAxiosWrapper({
      ...config,
      proxy: undefined,
      headers: {
        common: {
          ...config?.headers
        }
      }
    })
  }
}

const instance = new NuxtAxiosWrapper()

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
