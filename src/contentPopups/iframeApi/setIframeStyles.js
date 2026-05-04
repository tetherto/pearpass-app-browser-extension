/**
 *
 * @param {Object} params
 * @param {string} params.iframeId
 * @param {string} params.iframeType
 * @param {Object} params.style
 */
export const setIframeStyles = ({ iframeId, iframeType, style }) => {
  window.parent.postMessage(
    {
      type: 'setStyles',
      data: {
        iframeId,
        iframeType,
        style
      }
    },
    '*'
  )
}
