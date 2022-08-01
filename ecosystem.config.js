module.exports = {
	apps : [{
		name: 'Static Server',
		script: 'server.js',
		instances: 1,
		detached: true,
		watch: true,
		ignore_watch : [
			".git"
		]
	}]
}
