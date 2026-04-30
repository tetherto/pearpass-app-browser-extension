import { useMemo } from 'react'
import type { ComponentType, SVGProps } from 'react'

import { t } from '@lingui/core/macro'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import {
  AccountCircleFilled,
  AccountCircleOutlined,
  AssignmentInd,
  CreditCard,
  FormatQuote,
  GridView,
  LayerFilled,
  Layers,
  Note,
  WiFi
} from '@tetherto/pearpass-lib-ui-kit/icons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export type RecordMenuItemV2 = {
  type: string
  label: string
  OutlinedIcon: IconComponent
  FilledIcon: IconComponent
}

export const ALL_ITEMS_TYPE = 'all'

export const useRecordMenuItemsV2 = () => {
  const defaultItems: RecordMenuItemV2[] = useMemo(
    () => [
      {
        type: RECORD_TYPES.LOGIN,
        label: t`Logins`,
        OutlinedIcon: AccountCircleOutlined,
        FilledIcon: AccountCircleFilled
      },
      {
        type: RECORD_TYPES.CREDIT_CARD,
        label: t`Credit Card`,
        OutlinedIcon: CreditCard,
        FilledIcon: CreditCard
      },
      {
        type: RECORD_TYPES.IDENTITY,
        label: t`Identities`,
        OutlinedIcon: AssignmentInd,
        FilledIcon: AssignmentInd
      },
      {
        type: RECORD_TYPES.NOTE,
        label: t`Notes`,
        OutlinedIcon: Note,
        FilledIcon: Note
      },
      {
        type: RECORD_TYPES.PASS_PHRASE,
        label: t`Recovery Phrases`,
        OutlinedIcon: FormatQuote,
        FilledIcon: FormatQuote
      },
      {
        type: RECORD_TYPES.WIFI_PASSWORD,
        label: t`Wi-Fi`,
        OutlinedIcon: WiFi,
        FilledIcon: WiFi
      },
      {
        type: RECORD_TYPES.CUSTOM,
        label: t`Other`,
        OutlinedIcon: GridView,
        FilledIcon: GridView
      }
    ],
    []
  )

  const categoriesItems: RecordMenuItemV2[] = useMemo(
    () => [
      {
        type: ALL_ITEMS_TYPE,
        label: t`All Items`,
        OutlinedIcon: Layers,
        FilledIcon: LayerFilled
      },
      ...defaultItems
    ],
    [defaultItems]
  )

  return { categoriesItems, defaultItems }
}
