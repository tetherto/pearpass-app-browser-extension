import { readFileSync } from 'fs'
import path from 'path'

import { FIREFOX_EXTENSION_ID } from '@tetherto/pearpass-lib-constants'

// Firefox requires the extension ID in browser_specific_settings.gecko.id to
// match allowed_extensions in the native messaging host manifest (written by
// the desktop app using FIREFOX_EXTENSION_ID). manifest.json is static JSON
// and cannot import the constant, so this test guards against drift.
describe('Firefox extension ID', () => {
  it('matches browser_specific_settings.gecko.id in public/manifest.json', () => {
    const manifestPath = path.resolve(
      __dirname,
      '../../../public/manifest.json'
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      FIREFOX_EXTENSION_ID
    )
  })
})
