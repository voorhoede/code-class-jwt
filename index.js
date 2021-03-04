#!/usr/bin/env node

const fs = require('fs').promises
const http = require('http')
const url = require('url')

const { sign, verify, decode } = require('jws')

const config = {
	PORT: process.argv[2] || 8080,
	ALG: 'HS256',
	SECRET: process.env.JWT_SECRET,
}

/**
 * Run a server on localhost at user-defined or default port. Before starting
 * the server, it checks the presence of a secret, which should be set as an
 * environment variable. If omitted, the process will exit.
 */
try {
	if (!config.SECRET) {
		console.log('You should set a secret; check the readme!')
		process.exit(0)
	}
	const server = http.createServer((req, res) => {
		router(req.url)(req, res)
	}).listen(config.PORT, () => {
		console.log(`Server started on http://localhost:${config.PORT}. Press CTRL+C to quit`)
	})
} catch (error) {
	console.error(error)
	process.exit(1)
}

/**
 * Implements routing using the request.url as input. Returns a function that
 * takes an http request and response object and does http-like stuff. If the
 * route is not defined, 404 is returned.
 *
 * Note that the front-end is a single page app, which means it implements
 * its own routing.
 *
 * @param {String} url
 * @returns {Function}
 */
function router(_url) {
	const route = url.parse(_url).pathname
	const routeMap = {
		'/': 'default',
		'/thanks': 'default',
		'/download': 'download',
		'/signup': 'signup',
	}
	return {
		async default(req, res) {
			await sendPage(res)
		},
		async download(req, res) {
			const token = url.parse(_url).query
			if (verifyToken(token)) {
				const { email } = decode(token).payload
				res.setHeader('Content-Disposition', `attachment; filename=codeclass_jwt_download_${email}.md`)
				res.setHeader('Content-Type', 'text/plain')
				res.write(`# Awesome! Your free download\n\nYour email address ${email} is safe with usssszzzhhahaaa 🐍`)
				res.end()
			} else {
				await sendPage(res, 403)
			}
		},
		async signup(req, res) {
			allowPost(req, res)
			const { email } = await parseBody(req)
			const token = createToken(email)
			res.setHeader('Content-Type', 'application/json')
			res.write(JSON.stringify({ token }))
			res.end()
		},
		async notfound(req, res) {
			await sendPage(res, 404)
		}
	}[routeMap[route] || 'notfound']
}

/**
 * Reads an HTML file from disk and sends it as response. Optionally sets a
 * http statuscode
 *
 * @param {HTTP Response} res
 * @param {Number} statusCode default 200
 * @return {String}
 */
async function sendPage(res, statusCode = 200) {
	res.statusCode = statusCode
	res.write(await fs.readFile(`./index.html`, 'utf8'))
	res.end()
}

/**
 * 'Middleware' to allow only POST method, and end response otherwise.
 *
 * @param {HTTP Request} req
 * @param {HTTP Response} res
 */
function allowPost(req, res) {
	if (req.method !== 'POST') {
		res.writeHead(405, {
			'Allow': 'POST'
		})
		res.end()
	}
}

/**
 * Verifies JWT based on secret and chosen algorithm and checks if it hasn’t
 * expired yet. Since the jws package’s verification only verifies the JWT
 * and does not check payload claims (iat/exp etc), we do a manual check.
 *
 * @param  {String} token (JWT)
 * @return {Boolean}
 */
function verifyToken(token) {
	// verify throws when `token` is null, but url.parse stupidly returns null
	// instead of undefined or an empty string if no query is present in the url
	// so we explicitly check for null and return false immediately
	if (token === null) return false
	if (verify(token, config.ALG, config.SECRET)) {
		// Exercise 3
		// You should check for an expiration claim. Perhaps the decode
		// function can be of help?
		return true
	}
	return false
}

/**
 * Create a JWT with an expiry timestamp and email address as payload.
 *
 * @param  {String} email
 * @return {String}
 */
function createToken(email) {
	try {
		return sign({
			header: {
				alg: config.ALG,
				typ: 'JWT',
			},
			payload: { // Exercise 3; go add a claim here
			  	email,
			},
			secret: config.SECRET,
		})
	} catch(error) {
		console.error(error)
		return ''
	}
}

/**
 * Parses an http request’s body into an object literal, where a field’s name
 * becomes the key and its value the value. Since the request’s body is received
 * as a stream and its interface is event based, we wrap it in a Promise for
 * simplicity and reusability.
 *
 * Example of request data in -> object out:
 *   email=a%40bc.de&password=hunter2 -> { email: 'a@bc.de', password: 'hunter2' }
 *
 * @param  {HTTP Request} req
 * @return {Promise}
 */
function parseBody(req) {
	return new Promise((resolve, reject) => {
		let body = ''
		req.on('data', chunk => body += chunk)
		req.on('end', () => {
			return resolve(body.split(/&/).reduce((collection, item) => {
				const [ key, val ] = item.split(/=/)
				return { ...collection, [key]: decodeURIComponent(val) }
			}, {}))
		})
		req.on('error', reject)
	})
}
