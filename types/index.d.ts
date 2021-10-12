import { AxiosError, HAxiosRequestConfig, AxiosRequestConfig, AxiosResponse, AxiosStatic, AxiosConfig } from 'haxios'
import Vue from 'vue'
import './vuex'

interface NuxtAxiosInstance extends AxiosStatic {
  $request<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>;
  $get<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $delete<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $head<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $options<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $post<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, data?: INPUT, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $put<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, data?: any, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>
  $patch<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(url: string, data?: any, config?: CONFIG): Promise<AxiosResponse<RETURN, INPUT, CONFIG>>

  setBaseURL(baseURL: string): void
  setHeader(name: string, value?: string | false, scopes?: string | string[]): void
  setToken(token: string | false, type?: string, scopes?: string | string[]): void

  onRequest(callback: (config: HAxiosRequestConfig) => void | HAxiosRequestConfig | Promise<HAxiosRequestConfig>): void
  onResponse<
    RETURN = any,
    INPUT = any,
    CONFIG extends HAxiosRequestConfig<INPUT> = HAxiosRequestConfig<INPUT>
    >(callback: (response: AxiosResponse<RETURN, INPUT, CONFIG>) => void | AxiosResponse<RETURN, INPUT, CONFIG> | Promise<AxiosResponse<RETURN, INPUT, CONFIG>> ): void
  onError(callback: (error: AxiosError) => any): void
  onRequestError(callback: (error: AxiosError) => any): void
  onResponseError(callback: (error: AxiosError) => any): void

  create(options?: HAxiosRequestConfig): NuxtAxiosInstance
}

interface AxiosOptions {
  baseURL?: string,
  browserBaseURL?: string,
  credentials?: boolean,
  debug?: boolean,
  host?: string,
  prefix?: string,
  progress?: boolean,
  proxyHeaders?: boolean,
  proxyHeadersIgnore?: string[],
  proxy?: boolean,
  port?: string | number,
  retry?: boolean | AxiosConfig['retryConfig'],
  https?: boolean,
  headers?: {
    common?: Record<string, string>,
    delete?: Record<string, string>,
    get?: Record<string, string>,
    head?: Record<string, string>,
    post?: Record<string, string>,
    put?: Record<string, string>,
    patch?: Record<string, string>,
  },
}

declare module 'haxios' {
  interface AxiosRequestConfig {
    progress?: boolean;
  }
}

declare module '@nuxt/vue-app' {
  interface Context {
    $axios: NuxtAxiosInstance
  }
  interface NuxtAppOptions {
    $axios: NuxtAxiosInstance
  }
}

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $axios: NuxtAxiosInstance
  }

  interface NuxtAppOptions {
    $axios: NuxtAxiosInstance
  }

  interface Configuration {
    axios?: AxiosOptions
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $axios: NuxtAxiosInstance
  }
}
