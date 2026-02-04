const runtime = typeof chrome !== 'undefined' ? chrome.runtime : browser.runtime
const script = document.createElement('script')
script.src = runtime.getURL('inject.js')
script.onload = () => script.remove()
;(document.head || document.documentElement).appendChild(script)
