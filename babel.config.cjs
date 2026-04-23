const path = require('node:path')

const dev = process.env.NODE_ENV !== 'production'
const isTest = process.env.NODE_ENV === 'test'

const resolvePaths = [
  __dirname,
  path.resolve(
    __dirname,
    'node_modules/@tetherto/pearpass-lib-ui-kit/node_modules'
  )
]

const rsdBabelPreset = require.resolve('react-strict-dom/babel-preset', {
  paths: resolvePaths
})

module.exports = {
  compact: false,
  plugins: ['@lingui/babel-plugin-lingui-macro'],
  presets: isTest
    ? [
        [
          '@babel/preset-env',
          {
            targets: { node: 'current' },
            modules: 'commonjs'
          }
        ],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    : [
        ['@babel/preset-env', { targets: 'defaults', modules: false }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
        [
          rsdBabelPreset,
          {
            debug: dev,
            dev,
            rootDir: __dirname,
            platform: 'web'
          }
        ]
      ]
}
