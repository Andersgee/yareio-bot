# yareio-bot

My bot for yare.io

```bash
yarn watch
```

and then (when in a game) type this in console

```js
fetch("http://localhost:4000/code-sync")
  .then((r) => r.json())
  .then(eval);
```
