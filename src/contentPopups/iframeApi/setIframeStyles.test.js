import { setIframeStyles } from './setIframeStyles'

describe('setIframeStyles', () => {
  beforeEach(() => {
    jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should send the correct data object with iframeId, iframeType and style', () => {
    const iframeId = 'testIframeId'
    const iframeType = 'testIframeType'
    const style = { width: '300px', height: '55px', borderRadius: '12px' }

    setIframeStyles({ iframeId, iframeType, style })

    expect(window.parent.postMessage).toHaveBeenCalledWith(
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
  })

  it('should handle missing iframeId, iframeType and style gracefully', () => {
    setIframeStyles({})

    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        type: 'setStyles',
        data: {
          iframeId: undefined,
          iframeType: undefined,
          style: undefined
        }
      },
      '*'
    )
  })
})
