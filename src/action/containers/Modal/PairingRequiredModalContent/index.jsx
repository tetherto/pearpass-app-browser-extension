import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import {
  useDesktopPairing,
  PAIRING_STEP
} from '../../../../hooks/useDesktopPairing.js'
import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ModalCard } from '../../../../shared/components/ModalCard'

/**
 *
 * @param {Object} props
 * @param {Function} props.onPairSuccess
 */
export const PairingRequiredModalContent = ({ onPairSuccess }) => {
  const [step, setStep] = useState(PAIRING_STEP.TOKEN)
  const [masterPassword, setMasterPassword] = useState('')

  const handleBack = () => {
    setStep(PAIRING_STEP.TOKEN)
    setMasterPassword('')
  }

  const {
    pairingToken,
    setPairingToken,
    identity,
    loading,
    fetchIdentity,
    completePairing
  } = useDesktopPairing({ onPairSuccess, handleBack, setStep })

  return (
    <ModalCard>
      <span className="font-inter text-white-mode1 text-2xl font-semibold">
        <Trans>Complete Pairing</Trans>
      </span>

      {step === PAIRING_STEP.TOKEN && (
        <>
          <div className="font-inter text-grey200-mode1 space-y-1 text-center text-sm">
            <p>
              <Trans>1. Open PearPass desktop app</Trans>
            </p>
            <p>
              <Trans>2. Go to Settings → Advanced → Custom settings</Trans>
            </p>
            <p>
              <Trans>3. Activate extension and copy the pairing token</Trans>
            </p>
          </div>

          <input
            type="text"
            value={pairingToken}
            onChange={(e) => setPairingToken(e.target.value)}
            placeholder={t`Enter pairing token`}
            className="bg-grey600-mode1 text-white-mode1 focus:ring-primary400-mode1 w-full rounded-lg p-3 font-mono text-sm focus:border-transparent focus:ring-2 focus:outline-none"
            disabled={loading}
            autoFocus
          />

          <div className="mt-2 flex w-full items-center justify-center">
            <ButtonPrimary
              disabled={loading || !pairingToken}
              onClick={fetchIdentity}
            >
              <Trans>{loading ? t`Verifying...` : t`Verify`}</Trans>
            </ButtonPrimary>
          </div>
        </>
      )}

      {step === PAIRING_STEP.PASSWORD && identity && (
        <>
          <div className="w-full rounded-lg bg-green-500/10 p-2">
            <div className="text-white-mode1 text-sm font-medium">
              <Trans>✓ Desktop Verified</Trans>
            </div>
            <div
              className="truncate font-mono text-xs text-green-400"
              title={identity.fingerprint}
            >
              {identity.fingerprint?.slice(0, 32)}...
            </div>
          </div>

          <span className="font-inter text-white-mode1 text-center text-base font-light">
            <Trans>Enter your master password to complete pairing</Trans>
          </span>

          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder={t`Master password`}
            className="bg-grey600-mode1 text-white-mode1 focus:ring-primary400-mode1 w-full rounded-lg p-3 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
            disabled={loading}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && masterPassword && !loading) {
                void completePairing(masterPassword)
              }
            }}
          />

          <div className="mt-2 flex w-full items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="text-grey200-mode1 hover:text-white-mode1 text-sm underline"
            >
              <Trans>Back</Trans>
            </button>
            <ButtonPrimary
              disabled={loading || !masterPassword}
              onClick={() => completePairing(masterPassword)}
            >
              <Trans>{loading ? t`Completing...` : t`Complete Pairing`}</Trans>
            </ButtonPrimary>
          </div>
        </>
      )}
    </ModalCard>
  )
}
