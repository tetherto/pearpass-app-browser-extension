import { t } from '@lingui/core/macro'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { Button, Text, Title, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Add, ImportExport } from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './EmptyCollectionViewV2.styles'
import { useRouter } from '../../../shared/context/RouterContext'

export const EmptyCollectionViewV2 = () => {
  const { theme } = useTheme()
  const { state: routerState, navigate } = useRouter() as {
    state: { recordType?: string } | undefined
    navigate: (
      page: string,
      opts?: { params?: Record<string, unknown> }
    ) => void
  }
  const styles = createStyles()

  const defaultRecordType =
    routerState?.recordType && routerState.recordType !== 'all'
      ? routerState.recordType
      : RECORD_TYPES.LOGIN

  const handleAddItem = () => {
    navigate('createOrEditCategory', {
      params: { recordType: defaultRecordType }
    })
  }

  const handleImport = () => {
    navigate('settings', { params: {} })
  }

  return (
    <div style={styles.container} data-testid="empty-collection-v2">
      <div style={styles.content}>
        <div style={styles.textBlock}>
          <Title as="h3" data-testid="empty-collection-v2-title">
            {t`No item saved`}
          </Title>
          <Text
            as="p"
            variant="label"
            color={theme.colors.colorTextSecondary}
            style={
              styles.descriptionParagraph as unknown as React.ComponentProps<
                typeof Text
              >['style']
            }
          >
            {t`Start using PearPass by creating your first item`}
          </Text>
          <Text
            as="p"
            variant="label"
            color={theme.colors.colorTextSecondary}
            style={
              styles.descriptionParagraph as unknown as React.ComponentProps<
                typeof Text
              >['style']
            }
          >
            {t`or import your items from a different password manager`}
          </Text>
        </div>

        <div style={styles.ctas}>
          <div style={styles.ctaButton}>
            <Button
              variant="primary"
              size="small"
              fullWidth
              data-testid="empty-collection-v2-add"
              iconBefore={<Add width={16} height={16} />}
              onClick={handleAddItem}
            >
              {t`Add Item`}
            </Button>
          </div>
          <div style={styles.ctaButton}>
            <Button
              variant="secondary"
              size="small"
              fullWidth
              data-testid="empty-collection-v2-import"
              iconBefore={
                <ImportExport
                  width={16}
                  height={16}
                  color={theme.colors.colorTextPrimary}
                />
              }
              onClick={handleImport}
            >
              {t`Import Items`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
