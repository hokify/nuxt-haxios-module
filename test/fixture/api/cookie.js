export const getCookie = (cname, cookies) => {
  const name = `${cname}=`
  const decodedCookie = decodeURIComponent(cookies)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return undefined
}

export default (req, res) => {
  const reqCookie = getCookie('mycookie', req.headers.cookie).trim()
  res.end(reqCookie || '')
}
