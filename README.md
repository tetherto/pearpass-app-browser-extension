<p align="center">
  <img src="public/logo.png" alt="Pearpass logo" width="264"/>
</p>

# pearpass-app-browser-extension

This is the browser extension for Pearpass, a secure password and data vault. It allows you to manage your logins, identities, credit cards, notes, and passkeys directly in your browser, and integrates with the Pearpass desktop application.

## Features

*   **Vault Management**: Create, unlock, and manage multiple secure vaults.
*   **Record Management**: Store and manage various types of records including logins, identities, credit cards, and secure notes.
*   **Passkey Support**: Seamlessly create and use passkeys for websites that support them.
*   **Browser Integration**: Autofill login credentials and other data on websites.
*   **Native App Communication**: Securely communicates with the Pearpass desktop application for vault operations.
*   **Password Generator**: Generate strong, unique passwords.
*   **Internationalization**: Support for multiple languages using `lingui`.

## Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd pearpass-app-browser-extension
    ```

2.  **Install dependencies:**
    This project uses `npm`.
    ```sh
    npm install
    ```

3.  **Build the extension:**
    ```sh
    npm run build
    ```
    This will create a `dist` directory with the packed extension files.

    For development with hot-reloading:
    ```sh
    npm run build:watch
    ```
    This will watch for file changes and rebuild automatically.

4.  **Load the extension in your browser:**
    *   Open your browser's extension management page (e.g., `chrome://extensions` in Chrome).
    *   Enable "Developer mode".
    *   Click "Load unpacked" and select the `dist` directory.

## Testing

This project uses Jest for unit and integration testing.

To run the tests, use the following command:
```sh
npm test
```

## Usage Examples

*   **Unlock Vault**: Click the Pearpass icon in your browser toolbar and enter your master password to unlock your vaults.
*   **Create a Login**: Navigate to the "Create" section and select "Login". Fill in the details and save. The extension will offer to autofill these credentials on the specified website.
*   **Use a Passkey**: When a website prompts for a passkey, the extension will open a dialog to either save the new passkey to your vault or use an existing one.
*   **Autofill Forms**: The extension will show an icon in input fields on web pages where it can fill in saved information (logins, identities, etc.).

## Dependencies

*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [LinguiJS](https://lingui.dev/) for internationalization
*   [Jest](https://jestjs.io/) for testing
*   [pearpass-lib-vault](.yalc/pearpass-lib-vault) for core vault logic

## Related Projects

- [@tetherto/pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password manager
- [@tetherto/pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [@tetherto/tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers
- [@tetherto/pearpass-lib-vault](https://github.com/tetherto/pearpass-lib-vault) - A library for managing password vaults

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
