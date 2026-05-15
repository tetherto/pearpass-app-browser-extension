import { fireEvent, render, screen } from '@testing-library/react'

import { AccessRemovedModalContent } from './index'
import { useModal } from '../../context/ModalContext'

jest.mock('../../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const liftTestID = ({ testID, ...rest }: any) =>
    testID ? { ...rest, 'data-testid': testID } : rest
  return {
    Button: ({ children, onClick, ...rest }: any) => (
      <button type="button" onClick={onClick} {...liftTestID(rest)}>
        {children}
      </button>
    ),
    Dialog: ({ children, footer, ...rest }: any) => {
      const lifted = liftTestID(rest)
      return (
        <div {...lifted}>
          {children}
          {footer}
        </div>
      )
    },
    Text: ({ children, ...rest }: any) => (
      <p {...liftTestID(rest)}>{children}</p>
    )
  }
})

const mockedUseModal = jest.mocked(useModal)

describe('AccessRemovedModalContent', () => {
  const closeModal = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseModal.mockReturnValue({ closeModal } as unknown as ReturnType<
      typeof useModal
    >)
  })

  it('renders a vaultName-only lead when no deviceName is provided', () => {
    render(<AccessRemovedModalContent vaultName="V1" />)
    const lead = screen.getByTestId('access-removed-lead')
    expect(lead.textContent).toContain('V1')
    expect(lead.textContent).not.toMatch(/ by /)
  })

  it('includes deviceName in the lead when provided', () => {
    render(<AccessRemovedModalContent vaultName="V1" deviceName="ios arm64" />)
    const lead = screen.getByTestId('access-removed-lead')
    expect(lead.textContent).toContain('V1')
    expect(lead.textContent).toContain('ios arm64')
  })

  it('calls closeModal on Understood when no onClose override is provided', () => {
    render(<AccessRemovedModalContent vaultName="V1" />)
    fireEvent.click(screen.getByTestId('access-removed-understood'))
    expect(closeModal).toHaveBeenCalledTimes(1)
  })

  it('prefers the onClose prop over closeModal', () => {
    const onClose = jest.fn()
    render(<AccessRemovedModalContent vaultName="V1" onClose={onClose} />)
    fireEvent.click(screen.getByTestId('access-removed-understood'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(closeModal).not.toHaveBeenCalled()
  })
})
