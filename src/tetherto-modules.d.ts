/* eslint-disable @typescript-eslint/no-explicit-any -- ambient stubs for untyped JS packages */
// Untyped JS dependencies — keeps strict TS files importable project-wide
declare module '@tetherto/pear-apps-lib-ui-react-hooks'
declare module '@tetherto/pear-apps-utils-validator'
declare module '@tetherto/pear-apps-utils-avatar-initials' {
  export function generateAvatarInitials(text?: string): string
}
declare module '@tetherto/pear-apps-utils-date'
declare module '@tetherto/pearpass-lib-constants' {
  export const UNSUPPORTED: boolean
  export const EXTENSION_DESIGN_VERSION: number
  export const AUTHENTICATOR_ENABLED: boolean
  export const PROTECTED_VAULT_ENABLED: boolean
  export const SAVE_CREDENTIALS_AFTER_LOGIN_ENABLED: boolean
  export const CLIPBOARD_CLEAR_TIMEOUT: number
  export const LANGUAGES: Record<string, string>
  export const MANIFEST_NAME: string
  export const MS_PER_SECOND: number
  export const FIREFOX_EXTENSION_ID: string
  export const PRIVACY_POLICY: string
  export const TERMS_OF_USE: string
  export const DATE_FORMAT: string
  export const PASSPHRASE_TYPE_OPTIONS: unknown
  export const PASSPHRASE_WORD_COUNTS: {
    STANDARD_12: number
    WITH_RANDOM_12: number
    STANDARD_24: number
    WITH_RANDOM_24: number
  }
  export const VALID_WORD_COUNTS: number[]
  export const DEFAULT_SELECTED_TYPE: number
}
declare module '@tetherto/pear-apps-utils-qr' {
  export function generateQRCodeSVG(
    data: string,
    options?: { type?: string; margin?: number }
  ): Promise<string>
}
declare module '@tetherto/pearpass-lib-vault' {
  export interface VaultDevice {
    id?: string
    name?: string
    createdAt?: string
  }

  export interface Vault {
    id: string
    name: string
    createdAt?: string
    devices?: VaultDevice[]
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
    createFolder: (folderName: string) => void
  }

  export function useCreateFolder(options?: {
    onCompleted?: (payload: { folder: string }) => void
    onError?: (error: string) => void
  }): UseCreateFolderResult

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

  export interface UseRecordCountsByTypeResult {
    isLoading: boolean
    data: Record<string, number> | undefined
  }
  export function useRecordCountsByType(): UseRecordCountsByTypeResult

  export const closeAllInstances: () => Promise<void>

  export function vaultGetFile(path: string): Promise<unknown>
}

declare module '@tetherto/pearpass-lib-constants' {
  export const UNSUPPORTED: boolean
  export const EXTENSION_DESIGN_VERSION: number
  export const AUTHENTICATOR_ENABLED: boolean
  export const PROTECTED_VAULT_ENABLED: boolean
  export const DELETE_VAULT_ENABLED: boolean
  export const SAVE_CREDENTIALS_AFTER_LOGIN_ENABLED: boolean
  export const CLIPBOARD_CLEAR_TIMEOUT: number
  export const LANGUAGES: Record<string, string>
  export const MANIFEST_NAME: string
  export const MS_PER_SECOND: number
  export const FIREFOX_EXTENSION_ID: string
  export const PRIVACY_POLICY: string
  export const TERMS_OF_USE: string
  export const DATE_FORMAT: string
  export const PASSPHRASE_TYPE_OPTIONS: unknown
}

declare module '@tetherto/pearpass-utils-password-generator' {
  export function generatePassphrase(
    capitalLetters: boolean,
    symbols: boolean,
    numbers: boolean,
    words: number
  ): string[]

  export function generatePassword(
    length: number,
    rulesConfig?: {
      includeSpecialChars?: boolean
      lowerCase?: boolean
      upperCase?: boolean
      numbers?: boolean
    }
  ): string
}

declare module '@tetherto/pearpass-utils-password-check' {
  export const PASSWORD_STRENGTH: {
    WEAK: string
    VULNERABLE: string
    SAFE: string
  }
  export function checkPassphraseStrength(
    words: string[],
    config?: unknown
  ): { type: string; [key: string]: unknown }
  export function checkPasswordStrength(
    password: string,
    config?: unknown
  ): { type: string; [key: string]: unknown }
  export const constantTimeHashCompare: unknown
  export const validatePasswordChange: unknown
}
