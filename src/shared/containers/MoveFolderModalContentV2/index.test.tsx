import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const mockCloseModal = jest.fn()
const mockSetIsLoading = jest.fn()
const mockUpdateFolder = jest.fn(async () => undefined)
const mockUpdateFavoriteState = jest.fn(async () => undefined)
const mockUpdateRecords = jest.fn(async () => undefined)

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
    updateFolder: mockUpdateFolder,
    updateFavoriteState: mockUpdateFavoriteState,
    updateRecords: mockUpdateRecords
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
  Folder: () => <span data-testid="icon-folder" />,
  Layers: () => <span data-testid="icon-layers" />,
  StarBorder: () => <span data-testid="icon-star" />
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
    'data-testid': testID
  }: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'data-testid'?: string
  }) => (
    <button
      data-testid={testID}
      onClick={onClick}
      disabled={disabled}
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

  it('renders the Figma dialog title', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    expect(screen.getByTestId('move-folder-v2-dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Move to another Folder' })
    ).toBeInTheDocument()
  })

  it('renders the record preview (title + login username)', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    const preview = screen.getByTestId('move-folder-v2-preview')
    expect(preview).toHaveTextContent('LinkedIn')
    expect(preview).toHaveTextContent('alex.k@example.com')
  })

  it('renders All Items, Favorites, and custom folders sorted alphabetically', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    const chips = screen.getByTestId('move-folder-v2-chips')
    const chipEls = chips.querySelectorAll(
      '[data-testid^="move-folder-v2-chip-"]'
    )
    const ids = Array.from(chipEls).map((el) => el.getAttribute('data-testid'))

    expect(ids).toEqual([
      'move-folder-v2-chip-__all__',
      'move-folder-v2-chip-__favorites__',
      'move-folder-v2-chip-Personal',
      'move-folder-v2-chip-Zeta'
    ])
  })

  it('disables Move Item when the record is already at the default (All Items)', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    expect(screen.getByTestId('move-folder-v2-submit')).toBeDisabled()
  })

  it('enables Move Item once a different destination is picked', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-Personal'))

    expect(screen.getByTestId('move-folder-v2-submit')).not.toBeDisabled()
  })

  it('moving to a custom folder calls updateFolder with ids and name', async () => {
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
    expect(mockUpdateFavoriteState).not.toHaveBeenCalled()
    expect(mockUpdateRecords).not.toHaveBeenCalled()
    expect(mockCloseModal).toHaveBeenCalled()
  })

  it('moving to Favorites toggles favorite without touching the folder (option c)', async () => {
    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ folder: 'Personal', isFavorite: false })]}
      />
    )

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-__favorites__'))
    fireEvent.click(screen.getByTestId('move-folder-v2-submit'))

    await waitFor(() => {
      expect(mockUpdateFavoriteState).toHaveBeenCalledWith(['rec-1'], true)
    })
    expect(mockUpdateFolder).not.toHaveBeenCalled()
    expect(mockUpdateRecords).not.toHaveBeenCalled()
  })

  it('moving to All Items clears the folder via updateRecords', async () => {
    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ folder: 'Personal' })]}
      />
    )

    // All Items is the default; the record has a folder so submit is enabled.
    fireEvent.click(screen.getByTestId('move-folder-v2-submit'))

    await waitFor(() => {
      expect(mockUpdateRecords).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'rec-1', folder: null })
      ])
    })
    expect(mockUpdateFolder).not.toHaveBeenCalled()
    expect(mockUpdateFavoriteState).not.toHaveBeenCalled()
  })

  it('Discard closes the modal without calling any vault API', () => {
    render(<MoveFolderModalContentV2 records={[buildLoginRecord()]} />)

    fireEvent.click(screen.getByTestId('move-folder-v2-discard'))

    expect(mockCloseModal).toHaveBeenCalled()
    expect(mockUpdateFolder).not.toHaveBeenCalled()
    expect(mockUpdateFavoriteState).not.toHaveBeenCalled()
    expect(mockUpdateRecords).not.toHaveBeenCalled()
  })

  it('disables Favorites when the record is already a favorite', () => {
    render(
      <MoveFolderModalContentV2
        records={[buildLoginRecord({ isFavorite: true, folder: 'Personal' })]}
      />
    )

    fireEvent.click(screen.getByTestId('move-folder-v2-chip-__favorites__'))

    expect(screen.getByTestId('move-folder-v2-submit')).toBeDisabled()
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
