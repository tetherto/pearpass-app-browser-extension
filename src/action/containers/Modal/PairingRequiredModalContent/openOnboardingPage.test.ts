import { openOnboardingPage } from './PairingRequiredModalContentV2'

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  Title: () => null,
  Text: () => null,
  Button: () => null
}))
jest.mock('@tetherto/pearpass-lib-ui-kit/components/PasswordField', () => ({
  PasswordField: () => null
}))
jest.mock('../../../../hooks/useDesktopPairing', () => ({
  useDesktopPairing: () => ({})
}))

const ONBOARDING_URL = 'chrome-extension://mock-id/onboarding.html'

const setupChromeMock = ({
  currentTab,
  allExtensionTabs
}: {
  currentTab: Partial<chrome.tabs.Tab>
  allExtensionTabs: Partial<chrome.tabs.Tab>[]
}) => {
  global.chrome = {
    runtime: {
      getURL: (path: string) => `chrome-extension://mock-id/${path}`,
      onMessage: { addListener: jest.fn() },
      sendMessage: jest.fn(),
      lastError: undefined
    },
    tabs: {
      query: jest
        .fn()
        .mockImplementation(({ active }: { active?: boolean }) => {
          if (active) return Promise.resolve([currentTab])
          return Promise.resolve(allExtensionTabs)
        }),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({})
    },
    windows: {
      update: jest.fn().mockResolvedValue({})
    }
  } as unknown as typeof chrome
}

describe('openOnboardingPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does nothing when current tab is already onboarding', async () => {
    setupChromeMock({
      currentTab: { url: ONBOARDING_URL },
      allExtensionTabs: []
    })

    await openOnboardingPage()

    expect(chrome.tabs.create).not.toHaveBeenCalled()
    expect(chrome.tabs.update).not.toHaveBeenCalled()
  })

  it('focuses existing onboarding tab when one already exists', async () => {
    const existingTab = { id: 42, url: ONBOARDING_URL, windowId: 99 }

    setupChromeMock({
      currentTab: { url: 'chrome-extension://mock-id/action.html' },
      allExtensionTabs: [existingTab]
    })

    await openOnboardingPage()

    expect(chrome.tabs.update).toHaveBeenCalledWith(42, { active: true })
    expect(chrome.windows.update).toHaveBeenCalledWith(99, { focused: true })
    expect(chrome.tabs.create).not.toHaveBeenCalled()
  })

  it('opens a new onboarding tab when no existing onboarding tab is found', async () => {
    setupChromeMock({
      currentTab: { url: 'chrome-extension://mock-id/action.html' },
      allExtensionTabs: []
    })

    await openOnboardingPage()

    expect(chrome.tabs.create).toHaveBeenCalledWith({ url: ONBOARDING_URL })
    expect(chrome.tabs.update).not.toHaveBeenCalled()
  })

  it('focuses existing tab but skips window focus when windowId is missing', async () => {
    const existingTab = { id: 42, url: ONBOARDING_URL }

    setupChromeMock({
      currentTab: { url: 'chrome-extension://mock-id/action.html' },
      allExtensionTabs: [existingTab]
    })

    await openOnboardingPage()

    expect(chrome.tabs.update).toHaveBeenCalledWith(42, { active: true })
    expect(chrome.windows.update).not.toHaveBeenCalled()
  })
})
