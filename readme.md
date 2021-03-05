# Code Class JWT

> Node.js app and exercises to learn about JWT

## Usage

Install dependencies and run the app:

```bash
$ npm i
$ node . [port]
```

The app expects an environment variable to be set containing a secret, so that we can sign the JWT:

```bash
$ export JWT_SECRET=<your secret string>
```

Replace `<your secret string>` with your secret string. [Inspiration here](https://randompassphrasegenerator.com/).

## Exercises

The `main` branch is 'broken' and will be fixed in exercises 2 and 3. Check out branches `exercise2` and `exercise3` for a good starting point for those. Check out branch `solution` for a working version.

### Exercise 1

- Go to [jwt.io](https://jwt.io) and fool around with the header, payload and secret.
- Roll your own by using `btoa` ("binary to ascii", ie. base64encode) on a JavaScript object and see how that works

### Exercise 2

- In `index.js`, find the `createToken` function. It is missing some important data. Go fix!
- Hint: if you omit the `JWT` type, decoding the jwt will not assume the payload is a parseable JSON object
- Note: the app expects an `email` claim, so that it can show your email in the front-end and add it to your FREE DOWNLOAD

### Exercise 3

- In `index.js`, add an expiry claim to the token (in `createToken`). Hint: use `Date.now()` and remember, it’s in milliseconds
- Then, go see the `verifyToken` function. It doesn’t check against the `exp` claim which means we can download the resource forever! Go fix
- If it works, you should be seeing a ‘Oh no’ page if you try to download the FREE DOWNLOAD after the expiry time
