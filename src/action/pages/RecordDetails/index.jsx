import { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { generateAvatarInitials } from 'pear-apps-utils-avatar-initials'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useRecordById, useRecords } from 'pearpass-lib-vault'

import { ButtonLittle } from '../../../shared/components/ButtonLittle'
import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { Menu, MenuContent, MenuTrigger } from '../../../shared/components/Menu'
import { RecordActionsPopupContent } from '../../../shared/components/RecordActionsPopupContent'
import { RecordAvatar } from '../../../shared/components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../../shared/constants/recordColorByType'
import { useRouter } from '../../../shared/context/RouterContext'
import { useRecordActionItems } from '../../../shared/hooks/useRecordActionItems'
import { BrushIcon } from '../../../shared/icons/BrushIcon'
import { CollapseIcon } from '../../../shared/icons/CollapseIcon'
import { FolderIcon } from '../../../shared/icons/FolderIcon'
import { KebabMenuIcon } from '../../../shared/icons/KebabMenuIcon'
import { StarIcon } from '../../../shared/icons/StarIcon'
import { RecordDetailsContent } from '../../containers/RecordDetails/RecordDetailsContent'

export const RecordDetails = () => {
  const [isOpen, setIsOpen] = useState(false)

  const { params, navigate } = useRouter()

  const { data: record } = useRecordById({
    variables: { id: params.recordId }
  })

  const { updateFavoriteState } = useRecords()

  const { actions } = useRecordActionItems({
    excludeTypes: ['select', 'pin'],
    record: record,
    onClose: () => setIsOpen(false)
  })

  const handleEdit = () => {
    navigate('createOrEditCategory', { params: { recordId: record?.id } })
  }

  const handleCollapseRecordDetails = () => {
    navigate('vault', { state: { recordType: 'all' } })
  }

  useEffect(() => {
    if (!record) {
      handleCollapseRecordDetails()
    }
  }, [record])

  if (!record) {
    return null
  }

  const recordColorClass = RECORD_COLOR_BY_TYPE[record?.type]
  const isFavorite = record?.isFavorite

  const websiteDomain =
    record.type === 'login' ? record?.data?.websites?.[0] : null

  return (
    <div className="bg-grey500-mode1 flex h-full w-full flex-col gap-[15px] overflow-auto px-5 pt-5">
      <div className="flex justify-between">
        <div className="flex items-center gap-[10px]">
          <RecordAvatar
            websiteDomain={websiteDomain}
            initials={generateAvatarInitials(record?.data?.title)}
            isFavorite={isFavorite}
            color={recordColorClass}
          />

          <div>
            <div className="text-white-dark font-inter text-[16px] font-bold">
              {record?.data?.title}
            </div>

            {record?.folder && (
              <div className="text-grey200-dark font-inter mt-[2px] flex items-center gap-[5px] text-[12px] font-normal">
                <FolderIcon size="24" color={colors.grey200.dark} />
                {record?.folder}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <div
            className="flex cursor-pointer"
            onClick={() => updateFavoriteState([record?.id], !isFavorite)}
          >
            <StarIcon
              size="24"
              color={colors.primary400.mode1}
              fill={isFavorite}
            />
          </div>

          <ButtonLittle startIcon={BrushIcon} onClick={handleEdit}>
            {t`Edit`}
          </ButtonLittle>

          <div className="flex">
            <Menu open={isOpen} onOpenChange={setIsOpen}>
              <MenuTrigger>
                <ButtonRoundIcon
                  variant="secondary"
                  startIcon={KebabMenuIcon}
                />
                <MenuContent>
                  <RecordActionsPopupContent menuItems={actions} />
                </MenuContent>
              </MenuTrigger>
            </Menu>
          </div>

          <ButtonRoundIcon
            variant="secondary"
            startIcon={CollapseIcon}
            onClick={handleCollapseRecordDetails}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[15px] overflow-auto">
        <RecordDetailsContent record={record} />
      </div>
    </div>
  )
}
