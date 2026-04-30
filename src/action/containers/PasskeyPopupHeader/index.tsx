import { Button, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Close, PearpassLogo } from '@tetherto/pearpass-lib-ui-kit/icons'

type PasskeyPopupHeaderProps = {
  title: string
  onClose: () => void
}

export const PasskeyPopupHeader = ({
  title,
  onClose
}: PasskeyPopupHeaderProps) => {
  const { theme } = useTheme()
  return (
    <div className="flex items-center justify-between px-[var(--spacing12)] py-[var(--spacing10)]">
      <PearpassLogo
        width={20}
        height={20}
        color={theme.colors.colorAccentActive}
      />

      <Text variant="labelEmphasized" as="span">
        {title}
      </Text>

      <Button
        variant="tertiary"
        size="small"
        aria-label="Close"
        data-testid="passkey-popup-header-close"
        onClick={onClose}
        iconBefore={<Close />}
      />
    </div>
  )
}
