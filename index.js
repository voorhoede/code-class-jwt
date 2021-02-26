#!/usr/bin/env node

const fs = require('fs').promises
const http = require('http')
const url = require('url')

// Constants
const config = {
	PORT: process.argv[2] || 8080,
}
const routes = {
	HOME: 'home',
	LOGIN: 'login',
	NOT_FOUND: 'notfound'
}

/**
 * Implements routing using the request.url as input. Returns a function that
 * takes an http request and response object and does http-like stuff. If the
 * route is not defined, a 404 page is rendered.
 *
 * @param {String} url
 * @returns {Function}
 */
function router(_url) {
	const route = url.parse(_url).pathname
	const routeMap = {
		'/': routes.HOME,
		'/login': routes.LOGIN,
	}
	return {
		async home(req, res) {
			res.write(await render`<form method=post action=login><label>Handle</label><input name=handle><button>Join</button></form>`)
			res.end()
		},
		async login(req, res) {
			if (req.method !== 'POST') {
				res.writeHead(405, {
					'Allow': 'POST'
				})
				res.end()
			}
			const { handle } = await parseBody(req)
			const object = {}
			if (handle === 'john') {
				// send jwt!
			} else {
				res.statusCode = 401
			}
			res.setHeader('Content-Type', 'application/json')
			res.write(JSON.stringify(object))
			res.end()
		},
		async notfound(req, res) {
			res.statusCode = 404
			res.write(await render`Page not found`)
			res.end()
		}
	}[routeMap[route] || routes.NOT_FOUND]
}

/**
 * Parses an http request’s body into an object literal, where a field’s name
 * becomes the key and its value the value. Since the request’s body is received
 * as a stream and its interface is event based, we wrap it in a Promise for
 * simplicity and reusability.
 *
 * Example of request data in -> object out:
 *   username=azd&password=hunter2 -> { username: 'azd', password: 'hunter2' }
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
				return { ...collection, [key]: val }
			}, {}))
		})
		req.on('error', reject)
	})
}

/**
 * Render an HTML document. Reads a template file from disk and evaluates it
 * to a template string. This function should be used as a tagged template
 * (ex: render`Body text`). Note that input is not sanitized.
 *
 * @param  {String} body
 * @return {Tagged template}
 */
async function render(body) {
	const template = await fs.readFile(`./template.tpl`, 'utf8')
	return eval(`\`${template}\``)
}

/**
 * Run a server on localhost at user-defined or default port.
 */
try {
	const server = http.createServer((req, res) => {
		router(req.url)(req, res)
	}).listen(config.PORT, () => {
		console.log(`Server started on http://localhost:${config.PORT}. Press CTRL+C to quit`)
	})
} catch (error) {
	console.error(error)
	process.exit(1)
}
