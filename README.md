# Yare.io Bot Template

This is a template for creating bots for [yare.io](https://yare.io/), a programming game where you use Javascript to control your game units (called "spirits") and try to kill the enemy base. The template uses TypeScript and has Webpack set up to combine your source files into a nice output file.

## Development

This template uses a Git submodule to store typings; you will need to clone the repo with `git clone --recurse-submodules`, or run `git submodule update --init` after cloning.

You will need to install dependencies; to do that, install and run `yarn`.

To build the bot, run `yarn build`. The result will be stored in `dist/bot.js`. Note that if there are any errors during linting or building, nothing is output (warnings don't prevent building).

Source code is stored under `src`. The entry point for the bot is `src/index.ts`; in addition, the contents of `src/options.js` will be copied verbatim to the top of the final build file. TypeScript types are in `typings`.

You can run `eslint` with `yarn lint`, or even use ESLint's autofix feature with `yarn lint:fix`.

If you want to use [`yare-code-sync`](https://github.com/arikwex/yare-code-sync), you have two options:

* `yarn serve` will serve `bot.js` with `yare-code-sync`.
* `yarn watch` will watch your source files for changes, and then continuously rebuild your bot. It will also launch `yare-code-sync` to serve this file. Once again, no files are modified on error, so only valid code is sent to your browser.

To use `yare-code-sync`'s `RenderService`, place the following line at the top of your source file:

```javascript
import RenderService from 'yare-code-sync/client/RenderService';
```
