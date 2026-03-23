export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@tetherto/pearpass-lib-ui-theme-provider$':
      '<rootDir>/node_modules/@tetherto/pearpass-lib-ui-theme-provider/src/index.js',
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/client$': '<rootDir>/node_modules/react-dom/client'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.yalc/', '/packages/'],
  transformIgnorePatterns: [
    'node_modules/(?!(htm|@tetherto/pearpass-lib-constants|@tetherto/pearpass-lib-ui-theme-provider|@tetherto/pearpass-lib-ui-react-components|@tetherto/pear-apps-lib-ui-react-hooks|@tetherto/pear-apps-utils-validator|@tetherto/pearpass-lib-vault|@tetherto/pearpass-utils-password-check|@tetherto/pearpass-utils-password-generator|@tetherto/pear-apps-utils-pattern-search|@tetherto/pear-apps-utils-avatar-initials|@tetherto/pear-apps-lib-feedback|@tetherto/pear-apps-utils-generate-unique-id|@tetherto/pear-apps-utils-date|@tetherto/pear-apps-utils-qr)/)'
  ]
}
