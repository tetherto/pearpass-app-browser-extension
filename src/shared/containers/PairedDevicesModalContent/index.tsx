import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { formatDate } from '@tetherto/pear-apps-utils-date'
import {
  Button,
  Dialog,
  ListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Devices,
  LaptopMac,
  LaptopWindows,
  PhoneIphone,
  Tablet
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useVault } from '@tetherto/pearpass-lib-vault'

import { useModal } from '../../context/ModalContext'

type IconComponent = React.ComponentType<{
  width?: number
  height?: number
  color?: string
}>

const getDeviceDisplayName = (deviceName: string | undefined): string => {
  if (!deviceName) return t`Unknown Device`

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios')) return t`iPhone`
  if (lowerName.startsWith('android')) return t`Android`

  return deviceName
}

const getDeviceIcon = (deviceName?: string): IconComponent => {
  if (!deviceName) return Devices

  const lowerName = deviceName.toLowerCase()

  if (lowerName.startsWith('ios') || lowerName.includes('iphone'))
    return PhoneIphone
  if (lowerName.startsWith('android')) return PhoneIphone
  if (lowerName.includes('ipad') || lowerName.includes('tablet')) return Tablet
  if (
    lowerName.includes('mac') ||
    lowerName.includes('imac') ||
    lowerName.includes('darwin') ||
    lowerName.includes('macbook')
  )
    return LaptopMac
  if (lowerName.includes('windows')) return LaptopWindows

  return Devices
}

export const PairedDevicesModalContent = () => {
  const { closeModal } = useModal() as { closeModal: () => void }
  const { theme } = useTheme()

  const { data: vaultData } = useVault()

  const devices = useMemo(
    () => (Array.isArray(vaultData?.devices) ? vaultData.devices : []),
    [vaultData]
  )

  return (
    <Dialog
      title={t`Devices`}
      onClose={closeModal}
      testID="paired-devices-dialog"
      closeButtonTestID="paired-devices-close"
      footer={
        <Button
          size="small"
          type="button"
          onClick={closeModal}
          data-testid="paired-devices-close-button"
        >
          {t`Understood`}
        </Button>
      }
    >
      {devices.length === 0 ? (
        <div className="flex items-center justify-center p-[24px]">
          <Text as="p" variant="body" color={theme.colors.colorTextSecondary}>
            {t`No devices synced yet`}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">
          {devices.map(
            (
              device: { id?: string; name?: string; createdAt?: string },
              index: number
            ) => {
              const deviceName = getDeviceDisplayName(device.name)
              const DeviceIcon = getDeviceIcon(device.name)
              const createdAt = device.createdAt
                ? formatDate(device.createdAt, 'dd-mmm-yyyy', ' ')
                : null

              return (
                <ListItem
                  key={device.id ?? `${deviceName}-${index}`}
                  icon={
                    <div className="bg-surface-hover flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px]">
                      <DeviceIcon
                        width={16}
                        height={16}
                        color={theme.colors.colorAccentActive}
                      />
                    </div>
                  }
                  title={deviceName}
                  subtitle={
                    createdAt ? `${t`Paired on`} ${createdAt}` : undefined
                  }
                  testID={`paired-devices-item-${device.id ?? index}`}
                />
              )
            }
          )}
        </div>
      )}
    </Dialog>
  )
}
