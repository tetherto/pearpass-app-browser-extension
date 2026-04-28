import React, { cloneElement, useId, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Button, Snackbar, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  DriveFileMoveOutlined,
  StarFilled,
  StarOutlined,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './MultiSelectActionsBar.styles'

type MultiSelectActionsBarProps = {
  selectedCount: number
  allSelectedFavorited: boolean
  canMove: boolean
  onMove: () => void
  onToggleFavorite: () => void
  onDelete: () => void
}

type HoverButtonProps = {
  tooltip: string
  tooltipTestId: string
  children: React.ReactElement<{ 'aria-describedby'?: string }>
  wrapperStyle: React.CSSProperties
  tooltipStyle: React.CSSProperties
}

const HoverButton = ({
  tooltip,
  tooltipTestId,
  children,
  wrapperStyle,
  tooltipStyle
}: HoverButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const tooltipId = useId()

  return (
    <span
      style={wrapperStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {cloneElement(children, { 'aria-describedby': tooltipId })}
      {isHovered && (
        <div
          id={tooltipId}
          style={tooltipStyle}
          role="tooltip"
          data-testid={tooltipTestId}
        >
          <Snackbar text={tooltip} />
        </div>
      )}
    </span>
  )
}

export const MultiSelectActionsBar = ({
  selectedCount,
  allSelectedFavorited,
  canMove,
  onMove,
  onToggleFavorite,
  onDelete
}: MultiSelectActionsBarProps) => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const hasSelection = selectedCount > 0
  const isMoveDisabled = !hasSelection || !canMove
  const isFavoriteDisabled = !hasSelection
  const isDeleteDisabled = !hasSelection
  const FavoriteIcon = allSelectedFavorited ? StarFilled : StarOutlined

  const iconColor = (disabled: boolean) =>
    disabled ? theme.colors.colorTextDisabled : theme.colors.colorTextPrimary

  const moveIconStyle = { color: iconColor(isMoveDisabled) }
  const favoriteIconStyle = { color: iconColor(isFavoriteDisabled) }
  const deleteIconStyle = { color: iconColor(isDeleteDisabled) }

  const selectedLabel =
    selectedCount === 1
      ? t`1 Item selected`
      : t`${selectedCount} Items selected`

  const favoriteLabel = allSelectedFavorited
    ? t`Remove from Favorites`
    : t`Add to Favorites`

  return (
    <div style={styles.container} data-testid="multi-select-actions-bar">
      <div style={styles.label}>
        <Text variant="labelEmphasized" data-testid="multi-select-count">
          {selectedLabel}
        </Text>
      </div>

      <div style={styles.actions}>
        <HoverButton
          tooltip={t`Move to Another Folder`}
          tooltipTestId="multi-select-move-tooltip"
          wrapperStyle={styles.buttonWrapper}
          tooltipStyle={styles.tooltip}
        >
          <Button
            variant="tertiary"
            size="small"
            onClick={onMove}
            disabled={isMoveDisabled}
            data-testid="multi-select-move"
            aria-label={t`Move items`}
            iconBefore={<DriveFileMoveOutlined style={moveIconStyle} />}
          />
        </HoverButton>

        <HoverButton
          tooltip={favoriteLabel}
          tooltipTestId="multi-select-favorite-tooltip"
          wrapperStyle={styles.buttonWrapper}
          tooltipStyle={styles.tooltip}
        >
          <Button
            variant="tertiary"
            size="small"
            onClick={onToggleFavorite}
            disabled={isFavoriteDisabled}
            data-testid="multi-select-favorite"
            aria-label={favoriteLabel}
            iconBefore={<FavoriteIcon style={favoriteIconStyle} />}
          />
        </HoverButton>

        <div style={styles.destructiveDivider} aria-hidden="true" />

        <Button
          variant="destructive"
          size="small"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          data-testid="multi-select-delete"
          aria-label={t`Delete items`}
          iconBefore={<TrashOutlined style={deleteIconStyle} />}
        />
      </div>
    </div>
  )
}
