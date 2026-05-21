describe('runtime', () => {
  afterEach(() => {
    jest.resetModules()
    delete global.chrome
    delete global.browser
  })

  it('exports chrome.runtime when chrome is defined', () => {
    const mockRuntime = { sendMessage: jest.fn() }
    global.chrome = { runtime: mockRuntime }

    jest.isolateModules(() => {
      const { runtime } = require('./runtime')
      expect(runtime).toBe(mockRuntime)
    })
  })

  it('exports browser.runtime when chrome is not defined', () => {
    delete global.chrome
    const mockRuntime = { sendMessage: jest.fn() }
    global.browser = { runtime: mockRuntime }

    jest.isolateModules(() => {
      const { runtime } = require('./runtime')
      expect(runtime).toBe(mockRuntime)
    })
  })
})
