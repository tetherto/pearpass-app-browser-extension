export interface UseDesktopPairingParams {
  onPairSuccess: () => void
  handleBack: () => void
  setStep: (step: string) => void
  showVerifiedToast?: boolean
  hydrateFromStore?: boolean
}

export interface UseDesktopPairingReturn {
  pairingToken: string
  setPairingToken: (token: string) => void
  identity: unknown
  loading: boolean
  fetchIdentity: () => Promise<void>
  completePairing: (password: string) => Promise<void>
  error: string | null
  passwordError: string | null
  clearPasswordError: () => void
  hydrated: boolean
}

export declare const PAIRING_STEP: {
  TOKEN: string
  PASSWORD: string
}

export declare function useDesktopPairing(
  params: UseDesktopPairingParams
): UseDesktopPairingReturn
