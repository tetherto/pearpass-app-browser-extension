import { rawTokens, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { t } from '@lingui/core/macro'

const createStyles = () => ({
  container: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    gap: `${rawTokens.spacing16}px`,
    paddingInline: `${rawTokens.spacing16}px`,
    paddingBlock: `${rawTokens.spacing24}px`,
    width: '100%'
  }
})

export const EmptyResultsViewV2 = () => {
  const { theme } = useTheme()
  const styles = createStyles()

  return (
    <div style={styles.container} data-testid="empty-results-v2">
      <Text variant="bodyEmphasized" color={theme.colors.colorTextPrimary}>
        {t`No result found.`}
      </Text>
    </div>
  )
}
