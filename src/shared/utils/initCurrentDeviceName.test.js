import { initCurrentDeviceName } from './initCurrentDeviceName'

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  setCurrentDeviceName: jest.fn()
}))

jest.mock('./logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('../services/messageBridge', () => ({
  platformMessages: {
    getPlatformInfo: jest.fn()
  }
}))

const { setCurrentDeviceName } = require('@tetherto/pearpass-lib-vault')

const { logger } = require('./logger')
const { platformMessages } = require('../services/messageBridge')

describe('initCurrentDeviceName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets device name as "os arch" when both os and arch are present', async () => {
    platformMessages.getPlatformInfo.mockResolvedValue({
      os: 'mac',
      arch: 'arm'
    })

    await initCurrentDeviceName()

    expect(setCurrentDeviceName).toHaveBeenCalledWith('mac arm')
  })

  it('sets device name as os only when arch is absent', async () => {
    platformMessages.getPlatformInfo.mockResolvedValue({ os: 'win' })

    await initCurrentDeviceName()

    expect(setCurrentDeviceName).toHaveBeenCalledWith('win')
  })

  it('does not set device name when os is absent', async () => {
    platformMessages.getPlatformInfo.mockResolvedValue({ arch: 'x86' })

    await initCurrentDeviceName()

    expect(setCurrentDeviceName).not.toHaveBeenCalled()
  })

  it('does not set device name when platform response is null', async () => {
    platformMessages.getPlatformInfo.mockResolvedValue(null)

    await initCurrentDeviceName()

    expect(setCurrentDeviceName).not.toHaveBeenCalled()
  })

  it('logs error and does not throw when getPlatformInfo rejects', async () => {
    const err = new Error('IPC failed')
    platformMessages.getPlatformInfo.mockRejectedValue(err)

    await expect(initCurrentDeviceName()).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith(
      'initCurrentDeviceName',
      'getPlatformInfo failed:',
      err
    )
  })
})
