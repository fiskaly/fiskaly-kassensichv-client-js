
// Copyright 2019 fiskaly GmbH. All rights reserved.

/* eslint-env browser */
/* globals Go, com */

(function () {
  const initialized = (async function () {
    const go = new Go()
    const input = fetch('com.fiskaly.kassensichv.sma-web.wasm')
    const { instance } = await WebAssembly.instantiateStreaming(input, go.importObject)
    go.run(instance)
  })()

  Object.defineProperty(window, 'com', { value: {} })
  Object.defineProperty(window.com, 'fiskaly', { value: {} })
  Object.defineProperty(window.com.fiskaly, 'kassensichv', { value: {} })
  Object.defineProperty(window.com.fiskaly.kassensichv, 'sma', { value: { invoke } })
  Object.defineProperty(window.com.fiskaly.kassensichv, 'client', { value: client })

  async function invoke (method, maybeParams) {
    await initialized
    return new Promise((resolve, reject) => {
      const params = Array.isArray(maybeParams)
        ? maybeParams
        : [maybeParams]
      const id = Math.floor(Date.now() + (Math.random() * 10000))
      const request = {
        jsonrpc: '2.0',
        method,
        params,
        id
      }
      const requestJson = JSON.stringify(request)
      com.fiskaly.kassensichv.sma.doInvoke(requestJson, responseJson => {
        const response = JSON.parse(responseJson)
        const { result, error } = response
        if (error != null) {
          const { message, ...props } = error
          const err = Object.assign(new Error(message), props)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  function client (
    apiKey,
    apiSecret,
    opts = {
      baseUrl: 'https://kassensichv.fiskaly.com/api/v0'
    }
  ) {
    const { baseUrl } = opts
    const authContext = {}

    const fetchRaw = async ({ method = 'GET', path, query, body, headers = {} }) => {
      const url = baseUrl + path
      const fetchOpts = { method, headers }
      if (body != null) {
        fetchOpts.body = JSON.stringify(body)
      }
      const res = await fetch(url, fetchOpts)
      return res
    }

    const fetchToken = async (body) => {
      const res = await fetchRaw({
        method: 'POST',
        path: '/auth',
        headers: {
          'content-type': 'application/json'
        },
        body
      })
      const result = await res.json()
      authContext.accessToken = result.access_token
      authContext.refreshToken = result.refresh_token
      authContext.refreshInterval = result.refresh_token_expires_in * 1000 / 10
    }

    const auth = async () => {
      clearInterval(authContext.timerId)
      await fetchToken({
        api_key: apiKey,
        api_secret: apiSecret
      })
      const { refreshInterval } = authContext
      authContext.timerId = setInterval(() => {
        fetchToken({ refresh_token: authContext.refreshToken })
      }, refreshInterval)
    }

    const overrideTxPath = (str) => {
      const [path, query] = str.split('?')
      const parts = [path, '/log', query && `?${query}`]
      return parts.filter(Boolean).join('')
    }

    const interceptTxRequest = async (options) => {
      const { body, path } = options
      const signedTx = await com.fiskaly.kassensichv.sma.invoke('sign-transaction', body)
      options.path = overrideTxPath(path)
      options.body = signedTx
    }

    const request = async (options, retry = 0) => {
      if (retry > 5) {
        throw new Error('reached maxmimum number of retries')
      }
      const { path, method } = options
      if (authContext.accessToken == null) {
        await auth()
      }
      const isPut = /put/i.test(method)
      const isTxPath = /^\/tss\/.+\/tx\/.+/i.test(path)
      if (isPut && isTxPath) {
        await interceptTxRequest(options)
      }
      const result = await fetchRaw({
        ...options,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${authContext.accessToken}`
        }
      })
      const { status } = result
      if (status === 401) {
        delete authContext.accessToken
        return request(options, retry + 1) // retry
      }
      const body = await result.json()
      const headers = Object.fromEntries(result.headers.entries())
      return { status, body, headers }
    }

    return request
  }
})()
