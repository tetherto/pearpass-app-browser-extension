import { t } from '@lingui/core/macro'
import { RECORD_TYPES } from 'pearpass-lib-vault'

import { ButtonCreate } from '../../../shared/components/ButtonCreate'
import { RECORD_ICON_BY_TYPE } from '../../../shared/constants/recordIconByType'
import { useRouter } from '../../../shared/context/RouterContext'

/**
 * @param {{
 *  isSearchActive?: boolean
 * }} props
 */
export const EmptyCollectionView = ({ isSearchActive }) => {
  const { state, navigate } = useRouter()

  const createCollectionOptions = [
    { text: t`Create a login`, type: RECORD_TYPES.LOGIN },
    { text: t`Create an identity`, type: RECORD_TYPES.IDENTITY },
    { text: t`Create a credit card`, type: RECORD_TYPES.CREDIT_CARD },
    { text: t`Create a note`, type: RECORD_TYPES.NOTE },
    { text: t`Save Wifi`, type: RECORD_TYPES.WIFI_PASSWORD },
    { text: t`Save a Recovery phrase`, type: RECORD_TYPES.PASS_PHRASE },
    { text: t`Create a custom element`, type: RECORD_TYPES.CUSTOM }
  ]

  return (
    <div
      className={`flex w-full justify-center ${isSearchActive ? 'items-start pt-[20%]' : 'items-center'}`}
    >
      <div className="flex w-[300px] flex-col gap-2.5 pb-2">
        <div className="text-white-mode1 font-inter mb-2.5 flex flex-col gap-1.5 text-center text-xs font-semibold">
          <span className="font-semibold">
            {isSearchActive
              ? t`No result found.`
              : t`This collection is empty.`}
          </span>
          {!isSearchActive && (
            <p className="font-normal">
              {t`Create a new element or pass to another collection`}
            </p>
          )}
        </div>

        {!isSearchActive &&
          createCollectionOptions
            .filter(
              (option) =>
                state.recordType === 'all' || option.type === state.recordType
            )
            .map((option) => (
              <ButtonCreate
                key={option.type}
                startIcon={RECORD_ICON_BY_TYPE[option.type]}
                onClick={() =>
                  navigate('createOrEditCategory', {
                    params: { recordType: option.type }
                  })
                }
              >
                {option.text}
              </ButtonCreate>
            ))}
      </div>
    </div>
  )
}
