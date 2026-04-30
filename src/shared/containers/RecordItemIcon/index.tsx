import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import { Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useFavicon } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './RecordItemIcon.styles'
import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'

type RecordLike = {
  type: string
  data?: {
    title?: string
    websites?: string[]
  }
}

type RecordItemIconProps = {
  record: RecordLike
  size?: number
  testId?: string
}

export const RecordItemIcon = ({
  record,
  size = 32,
  testId
}: RecordItemIconProps) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors, size)

  const websiteDomain =
    record.type === 'login' ? record.data?.websites?.[0] : undefined
  const { faviconSrc, isLoading } = useFavicon({ url: websiteDomain ?? '' })

  const showFavicon = !!faviconSrc && !isLoading
  const initials = generateAvatarInitials(record.data?.title ?? '')
  const color =
    RECORD_COLOR_BY_TYPE[record.type as keyof typeof RECORD_COLOR_BY_TYPE] ??
    theme.colors.colorTextPrimary

  return (
    <div style={styles.wrapper} data-testid={testId}>
      {showFavicon ? (
        <img src={faviconSrc} alt="" style={styles.image} />
      ) : (
        <Text
          variant={size >= 32 ? 'labelEmphasized' : 'caption'}
          color={color}
        >
          {initials}
        </Text>
      )}
    </div>
  )
}
