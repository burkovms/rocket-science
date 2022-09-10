import fs from 'fs';
import { resolve } from 'path';

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Rocket Science',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }],
    script: [
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js',
      },
    ],
  },

  publicRuntimeConfig: {
    marketContract: process.env.VUE_APP_MARKET_CONTRACT,
    marketContractNew: process.env.VUE_APP_MARKET_CONTRACT_NEW,
    networkId: Number(process.env.VUE_APP_NETWORK_ID),
    infuraId: process.env.VUE_APP_INFURA_ID,
    host: process.env.VUE_APP_HOST,
    port: process.env.VUE_APP_PORT,
    mode: process.env.VUE_APP_MODE,
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/assets/styles/main.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/directives/click-outside'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/composition-api/module',
    '@nuxtjs/device',
    '@nuxtjs/svg-sprite',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/toast',
  ],

  toast: {
    position: 'bottom-right',
    duration: 5000,
    className: 'rocket-toast',
    register: [
      // Register custom toasts
      {
        name: 'my-error',
        message: 'Oops...Something went wrong',
        options: {
          type: 'error',
        },
      },
    ],
  },

  device: {
    refreshOnResize: true,
  },
  // SVG sprite module https://github.com/nuxt-community/svg-sprite-module
  svgSprite: {
    input: '~/assets/sprite/svg',
    output: '~/assets/sprite/gen',
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    proxy: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    loaders: {
      sass: {
        implementation: require('sass'),
      },
      scss: {
        implementation: require('sass'),
      },
    },
  },

  server: {
    host: process.env.VUE_APP_HOST || '0.0.0.0',
    port: process.env.VUE_APP_PORT || '8000',
    timing: false,
    https: {
      key: fs.readFileSync(resolve(__dirname, './server/localhost.key')),
      cert: fs.readFileSync(resolve(__dirname, './server/localhost.crt')),
    },
  },
};
