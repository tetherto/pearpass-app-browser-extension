import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockCloseModal = jest.fn()
const mockSetIsLoading = jest.fn()
const mockUpdateFolder = jest.fn(async () => undefined)

jest.mock('../../context/ModalContext', () => ({
  __esModule: true,
  useModal: () => ({ closeModal: mockCloseModal })
}))

jest.mock('../../context/LoadingContext', () => ({
  __esModule: true,
  useLoadingContext: () => ({
    isLoading: false,
    setIsLoading: mockSetIsLoading
  })
}))

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  __esModule: true,
  useRecords: () => ({
    updateFolder: mockUpdateFolder
  }),
  useFolders: () => ({
    isLoading: false,
    data: {
      customFolders: {
        zeta: { name: 'Zeta' },
        personal: { name: 'Personal' }
      }
    }
  })
}))

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  logger: { error: jest.fn() }
}))

jest.mock('@tetherto/pear-apps-utils-avatar-initials', () => ({
  __esModule: true,
  generateAvatarInitials: (title?: string) =>
    (title ?? '').slice(0, 2).toUpperCase()
}))

jest.mock('../../components/RecordAvatar', () => ({
  __esModule: true,
  RecordAvatar: ({ initials }: { initials: string }) => (
    <div data-testid="record-avatar">{initials}</div>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  __esModule: true,
  Folder: () => <span data-testid="icon-folder" />
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  __esModule: true,
  AlertMessage: ({
    title,
    description,
    testID
  }: {
    title?: string
    description?: string
    testID?: string
  }) => (
    <div data-testid={testID} role="alert">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    pressed,
    'data-testid': testID
  }: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    pressed?: boolean
    'data-testid'?: string
  }) => (
    <button
      data-testid={testID}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed ? 'true' : 'false'}
      type="button"
    >
      {children}
    </button>
  ),
  Dialog: ({
    title,
    children,
    footer,
    testID
  }: {
    title?: React.ReactNode
    children?: React.ReactNode
    footer?: React.ReactNode
    testID?: string
  }) => (
    <div data-testid={testID} role="dialog">
      <h2>{title}</h2>
      {children}
      <div>{footer}</div>
    </div>
  ),
  Text: ({
    children,
    variant
  }: {
    children?: React.ReactNode
    variant?: string
  }) => <span data-variant={variant}>{children}</span>,
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#fff',
        colorTextSecondary: '#888'
      }
    }
  })
}))

import { MoveFolderModalContentV2 } from './index'

const buildLoginRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'rec-1',
  type: 'login',
  folder: null as string | null,
  isFavorite: false,
  data: {
    title: 'LinkedIn',
    username: 'alex.k@example.com',
    websites: ['linkedin.com']
  },
  ...overrides
})

describe('MoveFolderModalContentV2', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the count-based title for a single record', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    expect(screen.getByTestId('move-folder-v2-dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Move 1 item' })
    ).toBeInTheDocument()
  })

  it('renders the count-based title for multiple records', () => {
    render(
      <MoveFolderModalContentV2
        records={[
          buildLoginRecord(),
          buildLoginRecord({ id: 'rec-2', data: { title: 'Netflix' } })
        ]}
      />
    )

    expect(
      screen.getByRole('heading', { name: 'Move 2 items' })
    ).toBeInTheDocument()
  })

  it('renders all selected records (not just a preview)', () => {
    render(
      <MoveFolderModalContentV2
        records={[
          buildLoginRecord(),
          buildLoginRecord({
            id: 'rec-2',
            data: { title: 'Netflix', username: 'simon@example.com' }
          })
        ]}
      />
    )

    const list = screen.getByTestId('move-folder-v2-items')
    expect(list).toHaveTextContent('LinkedIn')
    expect(list).toHaveTextContent('alex.k@example.com')
    expect(list).toHaveTextContent('Netflix')
    expect(list).toHaveTextContent('simon@example.com')
  })

  it('renders only custom folders sorted alphabetically (no All Items / Favorites)', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    const chips = screen.getByTestId('move-folder-v2-chips')
    const chipEls = chips.querySelectorAll(
      '[data-testid^="move-folder-v2-chip-"]'
    )
    const ids = Array.from(chipEls).map((el) => el.getAttribute('data-testid'))

    expect(ids).toEqual([
      'move-folder-v2-chip-Personal',
      'move-folder-v2-chip-Zeta'
    ])
  })

  it('disables Move when no destination is selected', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    expect(screen.getByTestId('move-folder-v2-submit')).toBeDisabled()
  })

  it('enables Move once a folder is picked', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))

    expect(screen.getByTestId('move-folder-v2-submit')).not.toBeDisabled()
  })

  it('toggling the same folder deselects it and disables submit again', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))
    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))

    expect(screen.getByTestId('move-folder-v2-submit')).toBeDisabled()
  })

  it('disables Move when every record is already in the chosen folder', () => {
    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ folder: 'Personal' })]}
      />
    )

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))

    expect(screen.getByTestId('move-folder-v2-submit')).toBeDisabled()
  })

  it('moving to a custom folder calls updateFolder with ids and folder name', async () => {
    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ folder: null })]}
        onCompleted={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))
    fireEvent.click(screen.getByTestId('move-folder-v2-submit'))

    await waitFor(() => {
      expect(mockUpdateFolder).toHaveBeenCalledWith(['rec-1'], 'Personal')
    })
    expect(mockCloseModal).toHaveBeenCalled()
  })

  it('Discard closes the modal without calling the vault API', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    fireEvent.click(screen.getByTestId('move-folder-v2-discard'))

    expect(mockCloseModal).toHaveBeenCalled()
    expect(mockUpdateFolder).not.toHaveBeenCalled()
  })

  it('shows the error alert when the vault API throws', async () => {
    mockUpdateFolder.mockRejectedValueOnce(new Error('boom'))

    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ folder: null })]}
      />
    )

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))
    fireEvent.click(screen.getByTestId('move-folder-v2-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('move-folder-v2-alert')).toBeInTheDocument()
    })
    expect(mockCloseModal).not.toHaveBeenCalled()
  })
})
