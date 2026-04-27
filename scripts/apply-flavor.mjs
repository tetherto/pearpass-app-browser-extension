#!/usr/bin/env node
// CI-only script that mutates the working tree to apply a build flavor.
// Mirrors pearpass-app-desktop/scripts/apply-flavor.mjs.
//
// Usage:
//   PEARPASS_FLAVOR=nightly node scripts/apply-flavor.mjs
//   PEARPASS_FLAVOR=release node scripts/apply-flavor.mjs   (no-op)
//
// Do not run `npm test` against a tree this script has touched — the
// firefoxExtensionId test compares public/manifest.json's gecko.id against
// FIREFOX_EXTENSION_ID from @tetherto/pearpass-lib-constants and will fail
// on a flavored manifest.

import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const flavor = process.env.PEARPASS_FLAVOR ?? 'release'

if (flavor === 'release') {
  console.log('[apply-flavor] flavor=release — no-op')
  process.exit(0)
}

if (flavor !== 'nightly') {
  console.error(
    `[apply-flavor] unknown PEARPASS_FLAVOR='${flavor}' (expected 'release' or 'nightly')`
  )
  process.exit(1)
}

console.log('[apply-flavor] flavor=nightly — mutating working tree')

const NIGHTLY_NAME = 'PearPass-nightly'
const NIGHTLY_DESCRIPTION = 'Password manager extension for PearPass-nightly'
const NIGHTLY_GECKO_ID = 'pass-nightly@pears.com'
const NIGHTLY_ICON = 'icon-nightly.png'

// Generated once with:
//   openssl genrsa 2048 | openssl rsa -pubout -outform DER | base64 | tr -d '\n'
// Pins the Chrome extension ID for nightly so unpacked/zipped builds always
// land on the same ID, distinct from the Web Store stable ID.
const NIGHTLY_CHROME_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxQO/1qZRjtKG7VZ0CaXxOyZ6lO3MyrWEAdMu9t6DdiolDRivkuLDciNPRirohlgNnQxuEJi7ehjVjyBr8gPRkz4FrvdqWZZZsoeV0o04BKQi593X+CJCHAeE7IyVp4S5gGyH2Yha6CdyQ4ajmAxFBgu2MwkG3od2GOvOvmQtslyQgNpZRIJWb79sCqR1GRAZNMiewGoBHkWQVauslPAvksJPWBqcEH09bHYrJP9k4v9NkBifggiICjCcp+vWURW8PAVMwNjOxTnktCVNkrORNijoxTEyi6oqV82xemlU93prdYSpOS4z2oMy3mwtw+T9Cvw8zSnq3cy/ZoVB52yArQIDAQAB'

const manifestPath = path.join(repoRoot, 'public', 'manifest.json')
const nightlyIconPath = path.join(repoRoot, 'public', NIGHTLY_ICON)

if (!existsSync(nightlyIconPath)) {
  console.error(
    `[apply-flavor] missing nightly icon at ${path.relative(repoRoot, nightlyIconPath)}`
  )
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

if (manifest.name !== 'PearPass') {
  console.error(
    `[apply-flavor] expected manifest.name='PearPass', got '${manifest.name}' — refusing to mutate (already flavored?)`
  )
  process.exit(1)
}

manifest.name = NIGHTLY_NAME
manifest.description = NIGHTLY_DESCRIPTION
manifest.browser_specific_settings.gecko.id = NIGHTLY_GECKO_ID
manifest.action.default_icon = {
  16: NIGHTLY_ICON,
  48: NIGHTLY_ICON,
  128: NIGHTLY_ICON
}
manifest.key = NIGHTLY_CHROME_KEY

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

console.log(`[apply-flavor] rewrote ${path.relative(repoRoot, manifestPath)}`)
console.log('[apply-flavor] done')
