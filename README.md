# Variational API address form

A one-field page where members of the cp0x community leave an EVM address for the Variational trading API whitelist.

The page is in Russian at the root and in English at `en/` (https://cp0x-org.github.io/variational-api-form/en/); both post to the same script.

Privacy: the page loads nothing from third parties (fonts and images are inline, strict CSP), sets no cookies, sends no referrer, and posts only the address to a Google Apps Script web app. The script stores only the lowercased address in a Google Sheet and writes no timestamps and no logs (`apps-script/Code.gs`).
