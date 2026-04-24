/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars -- ambient stubs for untyped JS packages; parameter names are documentation-only in type signatures */
// Untyped JS dependencies — keeps strict TS files importable project-wide
declare module '@tetherto/pear-apps-lib-ui-react-hooks'
declare module '@tetherto/pear-apps-utils-validator'
declare module '@tetherto/pear-apps-utils-avatar-initials' {
  export function generateAvatarInitials(text?: string): string
}
declare module '@tetherto/pearpass-lib-vault' {
  export interface Vault {
    id: string
    name: string
    createdAt?: string
  }

  export interface UseVaultsResult {
    isLoading: boolean
    isInitialized: boolean
    data: Vault[] | undefined
    refetch: () => Promise<Vault[]>
    initVaults: (params: {
      ciphertext?: string
      nonce?: string
      salt?: string
      hashedPassword?: string
      password?: string
    }) => Promise<void>
    resetState: () => void
  }

  export interface UseVaultResult {
    isLoading: boolean
    isInitialized: boolean
    data: Vault | undefined
    refetch: (
      vaultId?: string,
      params?: {
        password?: string
        ciphertext?: string
        nonce?: string
        hashedPassword?: string
      }
    ) => Promise<Vault | void>
    isVaultProtected: (vaultId: string | undefined) => Promise<boolean>
    addDevice: (deviceName: string) => Promise<void>
    resetState: () => void
    syncVault: () => Promise<boolean>
    updateUnprotectedVault: (
      vaultId: string,
      vaultUpdate: { name: string; password?: string }
    ) => Promise<void>
    updateProtectedVault: (
      vaultId: string,
      vaultUpdate: { name: string; password: string; currentPassword: string }
    ) => Promise<void>
  }

  export const setPearpassVaultClient: any
  export const VaultProvider: any
  export function useVaults(options?: {
    onCompleted?: (payload: Vault[]) => void
    onInitialize?: (payload: Vault[]) => void
  }): UseVaultsResult
  export function useVault(options?: {
    shouldSkip?: boolean
    variables?: { vaultId: string }
  }): UseVaultResult

  export function useCreateVault(): {
    isLoading: boolean
    createVault: (args: { name: string; password?: string }) => Promise<unknown>
  }

  export const useInvite: any
  export const usePair: any
  export const authoriseCurrentProtectedVault: any
  export const RECORD_TYPES: any
  export const OTP_TYPE: { TOTP: 'TOTP'; HOTP: 'HOTP' }

  export function useOtp(params: { recordId: string; otpPublic: any }): {
    code: string | null
    timeRemaining: number | null
    type: string | null
    period: number | null
    generateNext: (() => Promise<void>) | null
    isLoading: boolean
  }

  export const OtpRefreshProvider: any
  export function useOtpRefresh(): (() => void) | null

  export function useTimerAnimation(
    timeRemaining: number | null,
    period: number,
    animated?: boolean
  ): {
    noTransition: boolean
    expiring: boolean
    targetTime: number
  }

  export function formatOtpCode(code: string | null): string
  export function createAlignedInterval(callback: () => void): () => void
  export function isExpiring(timeRemaining: number | null): boolean
  export const EXPIRY_THRESHOLD_SECONDS: number

  export function useUserData(): {
    data: {
      hasPasswordSet: boolean
      isLoggedIn: boolean
      isVaultOpen: boolean
      masterPasswordStatus: {
        isLocked: boolean
        lockoutRemainingMs: number
        remainingAttempts: number
      }
    }
    isInitialized: boolean
    hasPasswordSet: boolean
    masterPasswordStatus: {
      isLocked: boolean
      lockoutRemainingMs: number
      remainingAttempts: number
    }
    isLoading: boolean
    logIn: (params: {
      ciphertext?: string
      nonce?: string
      salt?: string
      hashedPassword?: string
      password?: string
    }) => Promise<void>
    createMasterPassword: (password: string) => Promise<{
      ciphertext: string
      nonce: string
      salt: string
      hashedPassword: string
    }>
    updateMasterPassword: (params: {
      newPassword: string
      currentPassword: string
    }) => Promise<{
      ciphertext: string
      nonce: string
      salt: string
      hashedPassword: string
    }>
    refetch: () => Promise<{
      hasPasswordSet: boolean
      isLoggedIn: boolean
      isVaultOpen: boolean
    }>
    refreshMasterPasswordStatus: () => Promise<{
      isLocked: boolean
      lockoutRemainingMs: number
      remainingAttempts: number
    }>
  }

  export function useFavicon(params: { url: string }): {
    faviconSrc: string | null
    isLoading: boolean
    hasError: boolean
  }

  export interface FolderRecord {
    id: string
    folder?: string | null
    isFavorite?: boolean
    type: string
    [key: string]: unknown
  }

  export interface FolderEntry {
    name: string
    records: FolderRecord[]
  }

  export interface FoldersData {
    favorites: { records: FolderRecord[] }
    noFolder: { records: FolderRecord[] }
    customFolders: Record<string, FolderEntry>
  }

  export interface UseFoldersResult {
    isLoading: boolean
    data: FoldersData | undefined
    renameFolder: (name: string, newName: string) => Promise<void>
    deleteFolder: (name: string) => Promise<void>
  }

  export function useFolders(options?: {
    variables?: { searchPattern?: string }
  }): UseFoldersResult

  export interface UseCreateFolderResult {
    isLoading: boolean
    createFolder: (folderName: string) => Promise<void>
  }

  export function useCreateFolder(options?: {
    onCompleted?: (payload: string) => void
    onError?: (error: string) => void
  }): UseCreateFolderResult

  export interface UseRecordsResult {
    isLoading: boolean
    data: FolderRecord[] | undefined
    refetch: () => Promise<FolderRecord[]>
    deleteRecords: (recordIds: string[]) => Promise<void>
    updateRecords: (records: Array<Record<string, unknown>>) => Promise<void>
    updateFolder: (recordIds: string[], folder: string) => Promise<void>
    updateFavoriteState: (
      recordIds: string[],
      isFavorite: boolean
    ) => Promise<void>
  }

  export function decryptExportData(
    encryptedData: unknown,
    password: string
  ): Promise<unknown>
  export function useCreateRecord(options?: {
    onCompleted?: (payload: unknown) => void
    onError?: (error: Error) => void
  }): {
    createRecord: (
      record: unknown,
      onError?: (error: Error) => void
    ) => Promise<unknown>
    isLoading?: boolean
  }

  export const useRecords: any
  export const useBlindMirrors: any
}
