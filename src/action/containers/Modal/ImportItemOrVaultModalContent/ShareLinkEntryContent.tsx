import type { ChangeEvent } from 'react'

import { t } from '@lingui/core/macro'
import {
  Button,
  InputField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentPaste } from '@tetherto/pearpass-lib-ui-kit/icons'

export type ShareLinkEntryContentProps = {
  shareLink: string
  onShareLinkChange: (value: string) => void
  onPasteClick: () => void
  disabled?: boolean
}

export const ShareLinkEntryContent = ({
  shareLink,
  onShareLinkChange,
  onPasteClick,
  disabled
}: ShareLinkEntryContentProps) => {
  const { theme } = useTheme()
  const { colors } = theme

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onShareLinkChange(e.target.value)
  }

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <Text variant="caption" color={colors.colorTextSecondary}>
        {t`Share Link`}
      </Text>
      <InputField
        label={t`Item / Vault Link`}
        placeholder={t`Enter Share Link`}
        value={shareLink}
        onChange={handleChange}
        disabled={disabled}
        testID="import-share-link-input"
        rightSlot={
          <Button
            variant="tertiary"
            size="small"
            onClick={onPasteClick}
            disabled={disabled}
            aria-label={t`Paste from clipboard`}
            data-testid="import-share-link-paste"
            iconBefore={<ContentPaste color={colors.colorTextPrimary} />}
          />
        }
      />
    </div>
  )
}
