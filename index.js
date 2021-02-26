#!/usr/bin/env node

// Modules
const http = require('http')
const url = require('url')
const fs = require('fs').promises

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
function router(url) {
	const route = url.parse(url).pathname
	const routeMap = {
		'/': routes.HOME,
		'/login': routes.LOGIN,
	}
	return {
		async home(req, res) {
			res.write(await render`<a href="/login">Login</a>`)
			res.end()
		},
		async login(req, res) {
			res.writeHead(200, {
				'Content-Type': 'application/json',
			})
			res.write(JSON.stringify({ status: 200 }))
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
