import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { useModal } from '../../shared/context/ModalContext'
import { useRouter } from '../../shared/context/RouterContext'
import { isV2 } from '../../shared/utils/designVersion'
import { CreateOrEditCategoryWrapper } from '../containers/Modal/CreateOrEditCategoryWrapper'
import type { CreateOrEditCategoryWrapperProps } from '../containers/Modal/CreateOrEditCategoryWrapper'
import { GeneratePasswordModalContentV2 } from '../containers/Modal/GeneratePasswordModalContentV2/GeneratePasswordModalContentV2'

const SUPPORTED_V2_TYPES = new Set<string>([
  RECORD_TYPES.LOGIN,
  RECORD_TYPES.NOTE,
  RECORD_TYPES.WIFI_PASSWORD,
  RECORD_TYPES.CUSTOM,
  RECORD_TYPES.IDENTITY,
  RECORD_TYPES.CREDIT_CARD,
  RECORD_TYPES.PASS_PHRASE
])

// 'authenticator' isn't a real record type; it's a menu shortcut that opens
// the LOGIN form with a narrowed field set (Title + OTP secret + Comments).
const AUTHENTICATOR_TYPE = 'authenticator'
const PASSWORD_TYPE = 'password'

export type CreateOrEditRecordOptions = {
  recordType?: string
  initialRecord?: CreateOrEditCategoryWrapperProps['initialRecord']
  selectedFolder?: string
  isFavorite?: boolean
  source?: string
  mode?: 'authenticator'
  /** Optional callback for the password-generator flow — receives the chosen
   * password and lets the caller (e.g. Login / Wi-Fi V2 modal) write it into
   * its own form state. */
  setValue?: (value: string) => void
}

/**
 * Opens the v2 Add/Edit Record dialog when `isV2()` and the type is supported.
 * Falls back to the v1 `createOrEditCategory` route otherwise so callers stay
 * agnostic of the design-version flag.
 */
export const useCreateOrEditRecord = () => {
  const { setModal } = useModal()
  const { navigate } = useRouter()

  const handleCreateOrEditRecord = (
    options: CreateOrEditRecordOptions = {}
  ) => {
    const {
      recordType,
      initialRecord,
      selectedFolder,
      isFavorite,
      source,
      mode,
      setValue
    } = options

    // `recordType: 'password'` is a v2-only menu shortcut — the action
    // popup's "+" picker uses it for "Generate Password". The v1 path
    // doesn't share this affordance from inside the hook: callers that
    // still need a v1 password generator (today only RecordList's v1 +
    // picker) open `<PasswordGeneratorModalContent />` inline. So when
    // `!isV2()`, the hook intentionally no-ops here and lets the caller
    // handle it. Don't degrade to navigate('createOrEditCategory') —
    // there's no "password" record type at the route layer.
    if (recordType === PASSWORD_TYPE) {
      if (isV2()) {
        setModal(<GeneratePasswordModalContentV2 onPasswordInsert={setValue} />)
      }
      return
    }

    if (isV2() && recordType === AUTHENTICATOR_TYPE) {
      setModal(
        <CreateOrEditCategoryWrapper
          recordType={RECORD_TYPES.LOGIN}
          initialRecord={initialRecord}
          selectedFolder={selectedFolder}
          isFavorite={isFavorite}
          mode="authenticator"
        />
      )
      return
    }

    if (isV2() && recordType && SUPPORTED_V2_TYPES.has(recordType)) {
      setModal(
        <CreateOrEditCategoryWrapper
          recordType={recordType}
          initialRecord={initialRecord}
          selectedFolder={selectedFolder}
          isFavorite={isFavorite}
          mode={mode}
        />
      )
      return
    }

    // v1 fallback — mirror the existing call sites: edit uses recordId,
    // create uses recordType. Don't send both, the v1 route resolves the
    // record's type internally via useRecordById in edit mode. Carry
    // selectedFolder + isFavorite through so the v1 form can prefill them
    // (the v1 AppHeader picker used to pass these via params; preserve
    // parity for any caller that still hits this branch).
    const folderParam = selectedFolder ? { folder: selectedFolder } : {}
    const favoriteParam = isFavorite ? { isFavorite: true } : {}

    if (initialRecord?.id) {
      navigate('createOrEditCategory', {
        params: {
          recordId: initialRecord.id,
          ...folderParam,
          ...favoriteParam,
          ...(source ? { source } : {})
        }
      })
      return
    }

    navigate('createOrEditCategory', {
      params: {
        ...(recordType ? { recordType } : {}),
        ...folderParam,
        ...favoriteParam,
        ...(source ? { source } : {})
      }
    })
  }

  return { handleCreateOrEditRecord }
}
