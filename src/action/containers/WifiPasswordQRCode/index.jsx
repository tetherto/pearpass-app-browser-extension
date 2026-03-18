import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react/macro'
import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'

import { logger } from '../../../shared/utils/logger'

/**
 * @param {{
 *   ssid: string
 *   password: string
 *   encryptionType?: string
 *   isHidden?: boolean
 * }} props
 */
export const WifiPasswordQRCode = ({
  ssid,
  password,
  encryptionType = 'WPA',
  isHidden = false
}) => {
  const { t } = useLingui()

  const [qrCodeSvg, setQrCodeSvg] = useState('')

  const generateWifiQRString = (
    ssid,
    password,
    encryptionType = 'WPA',
    isHidden = false
  ) => `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${isHidden};;`

  useEffect(() => {
    if (ssid && password) {
      const wifiString = generateWifiQRString(
        ssid,
        password,
        encryptionType,
        isHidden
      )

      generateQRCodeSVG(wifiString, { type: 'svg', margin: 0 })
        .then((svgString) => {
          setQrCodeSvg(svgString)
        })
        .catch((error) => {
          logger.error('Error generating QR code:', error)
        })
    }
  }, [ssid, password, encryptionType, isHidden])

  if (!ssid || !password || !qrCodeSvg) {
    return null
  }

  return (
    <div className="bg-grey500-mode1 flex w-full flex-col items-center gap-2.5 rounded-[10px] p-5 px-2.5">
      <div className="text-white-mode1 font-inter text-[14px] leading-normal font-bold">
        {t`Scan the QR-Code to connect to the Wi-Fi`}
      </div>
      <div className="flex items-center justify-center">
        <div
          className="bg-white-mode1 rounded-[10px] p-[15px]"
          style={{ width: '200px', height: '200px' }}
          dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
        />
      </div>
    </div>
  )
}
