import React, { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import {
  Button,
  ContextMenu,
  ItemScreenHeader,
  NavbarListItem,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ArrowBackOutined,
  ContentPaste,
  DriveFileMoveOutlined,
  EditOutlined,
  MoreVert,
  StarBorder,
  StarFilled,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
// @ts-expect-error - declaration file is incomplete
import { useRecordById } from '@tetherto/pearpass-lib-vault'

import { RecordAvatar } from '../../../shared/components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../../shared/constants/recordColorByType'
import { useRouter } from '../../../shared/context/RouterContext'
import { useRecordActionItems } from '../../../shared/hooks/useRecordActionItems'
import { HEADER_MIN_HEIGHT } from '../MainViewHeader/MainViewHeader.styles'
import { RecordDetailsContentV2 } from './RecordDetailsContent/RecordDetailsContentV2'

type RecordAction = {
  type: string
  name: string
  click?: () => void
}

const ACTION_ICON_BY_TYPE: Record<
  string,
  React.ComponentType<{ color?: string }>
> = {
  autofill: ContentPaste,
  move: DriveFileMoveOutlined,
  edit: EditOutlined,
  delete: TrashOutlined
}

const getActionIcon = (
  action: RecordAction,
  isFavorite: boolean,
  textColor: string,
  destructiveColor: string
): React.ReactElement => {
  if (action.type === 'favorite') {
    const FavoriteIcon = isFavorite ? StarFilled : StarBorder
    return <FavoriteIcon color={textColor} />
  }
  const Icon = ACTION_ICON_BY_TYPE[action.type] ?? MoreVert
  const iconColor = action.type === 'delete' ? destructiveColor : textColor
  return <Icon color={iconColor} />
}

type RecordShape = {
  id: string
  type: string
  isFavorite?: boolean
  folder?: string
  data?: {
    title?: string
    websites?: string[]
  }
}

type RecordDetailsV2Props = {
  recordId?: string
  onClose?: () => void
}

export const RecordDetailsV2 = ({
  recordId: recordIdProp,
  onClose
}: RecordDetailsV2Props = {}) => {
  const { theme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { params, navigate } = useRouter()

  const isInline = !!onClose
  const recordId = recordIdProp ?? params.recordId

  const { data: record } = useRecordById({
    variables: { id: recordId }
  }) as { data?: RecordShape }

  const { actions } = useRecordActionItems({
    excludeTypes: ['select', 'pin'],
    record: record as { id: string; isFavorite?: boolean },
    onClose: () => setIsMenuOpen(false)
  })

  const handleCollapse = () => {
    if (onClose) {
      onClose()
      return
    }
    if (params.source === 'authenticator') {
      navigate('authenticator', { params: {} })
    } else {
      // @ts-expect-error - navigate signature in RouterContext is JSDoc-typed and omits state
      navigate('vault', { state: { recordType: 'all' } })
    }
  }

  useEffect(() => {
    if (!record) handleCollapse()
  }, [record])

  if (!record) return null

  const title = record?.data?.title ?? ''
  const websiteDomain =
    record.type === 'login' ? record?.data?.websites?.[0] : null

  const avatar = (
    <RecordAvatar
      websiteDomain={websiteDomain ?? ''}
      initials={generateAvatarInitials(title)}
      isFavorite={!!record?.isFavorite}
      color={
        RECORD_COLOR_BY_TYPE[record.type as keyof typeof RECORD_COLOR_BY_TYPE]
      }
      size="sm"
    />
  )

  const headerActions = (
    <div className="flex items-center gap-[var(--spacing4)]">
      <ContextMenu
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        trigger={
          <Button
            variant="tertiary"
            size="small"
            type="button"
            aria-label={t`More actions`}
            iconBefore={<MoreVert color={theme.colors.colorTextPrimary} />}
            data-testid="details-button-actions-v2"
          />
        }
      >
        {(actions as RecordAction[]).map((action, index, list) => (
          <NavbarListItem
            key={action.name}
            label={action.name}
            icon={getActionIcon(
              action,
              !!record?.isFavorite,
              theme.colors.colorTextPrimary,
              theme.colors.colorSurfaceDestructiveElevated
            )}
            variant={action.type === 'delete' ? 'destructive' : 'default'}
            showDivider={list[index + 1]?.type === 'delete'}
            onClick={() => {
              setIsMenuOpen(false)
              action.click?.()
            }}
            testID={`details-actions-item-${action.type}-v2`}
          />
        ))}
      </ContextMenu>

      {!isInline && (
        <Button
          variant="tertiary"
          size="small"
          type="button"
          aria-label={t`Back`}
          iconBefore={
            <ArrowBackOutined color={theme.colors.colorTextPrimary} />
          }
          onClick={handleCollapse}
          data-testid="details-button-collapse-v2"
        />
      )}
    </div>
  )

  return (
    <div
      data-testid="details-screen-v2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.colorSurfacePrimary,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: `${HEADER_MIN_HEIGHT}px`,
          paddingInline: `${rawTokens.spacing12}px`,
          borderBottom: `1px solid ${theme.colors.colorBorderPrimary}`,
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <ItemScreenHeader title={title} icon={avatar} actions={headerActions} />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${rawTokens.spacing8}px`,
          padding: `${rawTokens.spacing16}px`
        }}
      >
        <RecordDetailsContentV2 record={record} />
      </div>
    </div>
  )
}
