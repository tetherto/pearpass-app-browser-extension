import { t } from '@lingui/core/macro'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { RECORD_COLOR_BY_TYPE } from '../../shared/constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../../shared/constants/recordIconByType'
import { isV2 } from '../utils/designVersion'

/**
 * @returns {{
 *   menuItems: Array<{ name: string, type: string }>,
 *   defaultItems: Array<{ name: string, type: string, icon: any, color: string }>,
 *   popupItems: Array<{ name: string, type: string, icon?: any, color?: string }>
 * }}
 */
export const useRecordMenuItems = () => {
  const defaultItems = [
    {
      name: t`Login`,
      type: RECORD_TYPES.LOGIN,
      icon: RECORD_ICON_BY_TYPE.login,
      color: RECORD_COLOR_BY_TYPE.login
    },
    {
      name: t`Identity`,
      type: RECORD_TYPES.IDENTITY,
      icon: RECORD_ICON_BY_TYPE.identity,
      color: RECORD_COLOR_BY_TYPE.identity
    },
    {
      name: t`Credit Card`,
      type: RECORD_TYPES.CREDIT_CARD,
      icon: RECORD_ICON_BY_TYPE.creditCard,
      color: RECORD_COLOR_BY_TYPE.creditCard
    },
    {
      name: t`Wifi`,
      type: RECORD_TYPES.WIFI_PASSWORD,
      icon: RECORD_ICON_BY_TYPE.wifiPassword,
      color: RECORD_COLOR_BY_TYPE.wifiPassword
    },
    {
      name: t`Recovery phrase`,
      type: RECORD_TYPES.PASS_PHRASE,
      icon: RECORD_ICON_BY_TYPE.passPhrase,
      color: RECORD_COLOR_BY_TYPE.passPhrase
    },
    {
      name: t`Note`,
      type: RECORD_TYPES.NOTE,
      icon: RECORD_ICON_BY_TYPE.note,
      color: RECORD_COLOR_BY_TYPE.note
    },
    {
      name: t`Custom`,
      type: RECORD_TYPES.CUSTOM,
      icon: RECORD_ICON_BY_TYPE.custom,
      color: RECORD_COLOR_BY_TYPE.custom
    }
  ]

  const menuItems = [
    {
      name: t`All`,
      type: 'all'
    },
    ...defaultItems
  ]

  const popupItems = [
    ...defaultItems,
    ...(isV2() && AUTHENTICATOR_ENABLED
      ? [
          {
            name: t`Authenticator`,
            type: 'authenticator',
            icon: RECORD_ICON_BY_TYPE.login,
            color: RECORD_COLOR_BY_TYPE.login
          }
        ]
      : []),
    {
      name: t`Password`,
      type: 'password'
    }
  ]

  return { menuItems, popupItems, defaultItems }
}
