import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator
} from './index'
import '@testing-library/jest-dom'

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}))

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb()
    return 1
  })
})

afterEach(() => {
  window.requestAnimationFrame.mockRestore()
})

const renderMenu = (props = {}) =>
  render(
    <ThemeProvider>
      <Menu {...props}>
        <MenuTrigger>
          <button>Open Menu</button>
        </MenuTrigger>
        <MenuContent className="test-content">
          <MenuItem className="test-item" onClick={props.onItemClick}>
            Item 1
          </MenuItem>
          <MenuItem onClick={props.onItemClick}>Item 2</MenuItem>
          <MenuSeparator className="test-separator" />
          <MenuItem disabled>Disabled Item</MenuItem>
        </MenuContent>
      </Menu>
    </ThemeProvider>
  )

describe('Menu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Menu', () => {
    test('renders trigger correctly and matches snapshot', () => {
      const { getByText, container } = renderMenu()
      expect(getByText('Open Menu')).toBeInTheDocument()
      expect(container).toMatchSnapshot()
    })

    test('renders open menu and matches snapshot', async () => {
      const { getByText, container } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })
      expect(container).toMatchSnapshot()
    })

    test('menu content is not visible initially', () => {
      const { queryByText } = renderMenu()
      expect(queryByText('Item 1')).not.toBeInTheDocument()
    })

    test('opens menu when trigger is clicked', async () => {
      const { getByText } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })
    })

    test('closes menu when trigger is clicked again', async () => {
      const { getByText, queryByText } = renderMenu()

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(queryByText('Item 1')).not.toBeInTheDocument()
      })
    })

    test('works in controlled mode', async () => {
      const onOpenChange = jest.fn()
      const { getByText, rerender } = render(
        <ThemeProvider>
          <Menu open={false} onOpenChange={onOpenChange}>
            <MenuTrigger>
              <button>Open Menu</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Item 1</MenuItem>
            </MenuContent>
          </Menu>
        </ThemeProvider>
      )

      fireEvent.click(getByText('Open Menu'))
      expect(onOpenChange).toHaveBeenCalledWith(true)

      rerender(
        <ThemeProvider>
          <Menu open={true} onOpenChange={onOpenChange}>
            <MenuTrigger>
              <button>Open Menu</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Item 1</MenuItem>
            </MenuContent>
          </Menu>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })
    })

    test('closes menu when clicking outside', async () => {
      const { getByText, queryByText } = renderMenu()

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })

      fireEvent.mouseDown(document.body)
      await waitFor(() => {
        expect(queryByText('Item 1')).not.toBeInTheDocument()
      })
    })

    test('closes menu when Escape key is pressed', async () => {
      const { getByText, queryByText } = renderMenu()

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => {
        expect(queryByText('Item 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('MenuTrigger', () => {
    test('applies className', () => {
      const { container } = render(
        <ThemeProvider>
          <Menu>
            <MenuTrigger className="custom-trigger">
              <button>Trigger</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Item</MenuItem>
            </MenuContent>
          </Menu>
        </ThemeProvider>
      )

      expect(container.querySelector('.custom-trigger')).toBeInTheDocument()
    })

    test('throws error when used outside Menu', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(
          <MenuTrigger>
            <button>Trigger</button>
          </MenuTrigger>
        )
      }).toThrow('MenuTrigger must be used within a Menu')

      consoleError.mockRestore()
    })
  })

  describe('MenuContent', () => {
    test('applies className', async () => {
      const { getByText, container } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(container.querySelector('.test-content')).toBeInTheDocument()
      })
    })

    test('throws error when used outside Menu', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(
          <MenuContent>
            <div>Content</div>
          </MenuContent>
        )
      }).toThrow('MenuContent must be used within a Menu')

      consoleError.mockRestore()
    })
  })

  describe('MenuItem', () => {
    test('calls onClick when clicked', async () => {
      const onItemClick = jest.fn()
      const { getByText } = renderMenu({ onItemClick })

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })

      fireEvent.click(getByText('Item 1'))
      expect(onItemClick).toHaveBeenCalledTimes(1)
    })

    test('closes menu after click by default', async () => {
      const { getByText, queryByText } = renderMenu()

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Item 1')).toBeInTheDocument()
      })

      fireEvent.click(getByText('Item 1'))
      await waitFor(() => {
        expect(queryByText('Item 1')).not.toBeInTheDocument()
      })
    })

    test('does not close menu when closeOnClick is false', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Menu>
            <MenuTrigger>
              <button>Open Menu</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem closeOnClick={false}>Stay Open</MenuItem>
            </MenuContent>
          </Menu>
        </ThemeProvider>
      )

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Stay Open')).toBeInTheDocument()
      })

      fireEvent.click(getByText('Stay Open'))
      await waitFor(() => {
        expect(getByText('Stay Open')).toBeInTheDocument()
      })
    })

    test('does not call onClick when disabled', async () => {
      const onItemClick = jest.fn()
      const { getByText } = render(
        <ThemeProvider>
          <Menu>
            <MenuTrigger>
              <button>Open Menu</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem disabled onClick={onItemClick}>
                Disabled
              </MenuItem>
            </MenuContent>
          </Menu>
        </ThemeProvider>
      )

      fireEvent.click(getByText('Open Menu'))
      await waitFor(() => {
        expect(getByText('Disabled')).toBeInTheDocument()
      })

      fireEvent.click(getByText('Disabled'))
      expect(onItemClick).not.toHaveBeenCalled()
    })

    test('applies className', async () => {
      const { getByText, container } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(container.querySelector('.test-item')).toBeInTheDocument()
      })
    })

    test('throws error when used outside Menu', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(<MenuItem>Item</MenuItem>)
      }).toThrow('MenuItem must be used within a Menu')

      consoleError.mockRestore()
    })
  })

  describe('MenuSeparator', () => {
    test('renders with separator role', async () => {
      const { getByText, getByRole } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(getByRole('separator')).toBeInTheDocument()
      })
    })

    test('applies className', async () => {
      const { getByText, container } = renderMenu()

      fireEvent.click(getByText('Open Menu'))

      await waitFor(() => {
        expect(container.querySelector('.test-separator')).toBeInTheDocument()
      })
    })
  })
})

describe('calculatePosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true })
  })

  test('positions menu at bottom with start alignment', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="bottom" align="start">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })

  test('positions menu at bottom with end alignment', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="bottom" align="end">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })

  test('positions menu at top', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="top" align="start">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })

  test('positions menu at left', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="left">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })

  test('positions menu at right', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="right">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })

  test('positions menu with center alignment', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <Menu anchor="bottom" align="center">
          <MenuTrigger>
            <button>Open Menu</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      </ThemeProvider>
    )

    fireEvent.click(getByText('Open Menu'))

    await waitFor(() => {
      expect(getByText('Item')).toBeInTheDocument()
    })
  })
})
