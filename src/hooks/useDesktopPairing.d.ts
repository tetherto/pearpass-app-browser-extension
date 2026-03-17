/* eslint-disable no-unused-vars */

export interface UseDesktopPairingParams {
  onPairSuccess: () => void
  handleBack: () => void
  setStep: (step: string) => void
}

export interface UseDesktopPairingReturn {
  pairingToken: string
  setPairingToken: (token: string) => void
  identity: unknown
  loading: boolean
  fetchIdentity: () => Promise<void>
  completePairing: (password: string) => Promise<void>
  error: string | null
}

export declare const PAIRING_STEP: {
  TOKEN: string
  PASSWORD: string
}

export declare function useDesktopPairing(
  params: UseDesktopPairingParams
): UseDesktopPairingReturn
