<!doctype html>
<html>
	<head>
		<title>Code class JWT</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=" rel="icon" type="image/x-icon" />
		<style>
			body, input, button {
				font: 1em/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
				font-feature-settings: "kern", "liga";
			}
			h1, h2, h3, p, figure, ul, ol {
				margin: 0 0 1rem;
			}
			input {
				margin-bottom: 1rem;
			}
			label, button {
				display: block;
			}
		</style>
		<script>
			window.addEventListener('load', () => {
				const form = document.forms[0]
				if (window.location.search === '?logout') {
					window.sessionStorage.removeItem('auth_token')
				}
				if (form) {
					form.addEventListener('submit', event => {
						event.preventDefault()
						window.fetch(form.action, {
							method: 'post',
							body: new URLSearchParams(new FormData(form)) // https://github.com/github/fetch/issues/263#issuecomment-209530977
						})
						.then(response => response.json())
						.then(data => {
							if (data.auth_token) {
								window.sessionStorage.setItem('auth_token', data.auth_token)
								window.location.href = '/account'
							} else {
								window.location.reload()
							}
						})
					})
				}
			})
		</script>
	</head>
	<body>
		<h1>Code Class JWT</h1>
		<article>
			${ body }
		</article>
	</body>
</html>
