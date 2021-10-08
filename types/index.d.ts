import Vue from 'vue'
import './vuex'
import { AxiosConfig } from 'haxios'
import { NuxtAxiosWrapper } from '../src/axios'

export type Scope = 'common' | 'delete' | 'get' | 'head' | 'options' | 'post' | 'put' | 'patch';

interface NuxtAxiosOptions extends Omit<AxiosConfig, 'headers' | 'proxy'> {
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
  https?: boolean,
  headers?: {
    common?: Record<string, string>,
    delete?: Record<string, string>,
    get?: Record<string, string>,
    head?: Record<string, string>,
    post?: Record<string, string>,
    options?: Record<string, string>,
    put?: Record<string, string>,
    patch?: Record<string, string>,
  },
}

declare module 'haxios' {
    interface HAxiosRequestConfig {
        progress?: boolean;
    }
}

declare module '@nuxt/vue-app' {
  interface Context {
    $axios: NuxtAxiosWrapper
  }
  interface NuxtAppOptions {
    $axios: NuxtAxiosWrapper
  }
}

// Nuxt 2.9+
declare module '@nuxt/types' {
  interface Context {
    $axios: NuxtAxiosWrapper
  }

  interface NuxtAppOptions {
    $axios: NuxtAxiosWrapper
  }

  interface Configuration {
    axios?: NuxtAxiosOptions
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $axios: NuxtAxiosWrapper
  }
}
