const npm = require('npm');
const chalk = require('chalk')

class _Library {
	constructor() {
		this.prefix = 'anka-dev/'
	}

	init() {
		return new Promise(resolve => {
			npm.load(error => {
				error ? process.exit(1) : resolve()
			}) 
		});
	}

	async search(pkg) {
		await this.init();
		return new Promise((resolve, reject) => {
			npm.commands.search([this.prefix + pkg], (error, data) => {
				error ? reject(error) : resolve(data)
			});
		})
	}

	async list() {
		await this.init();
		return new Promise((resolve, reject) => {
			npm.commands.search([this.prefix], (error, data) => {
				error ? reject(error) : resolve(data)
			});
		})
	}
}

async function searchPackage(package) {
	let library = new _Library();
	try {
		await library.search(package);
	} catch (err) {
		console.log('error' + err)
	}
}

async function listPackages(package, otherPackages) {
	let library = new _Library();
	try {
		await library.list();
	} catch (err) {
		console.log('error' + err)
	}
}

module.exports = { searchPackage, listPackages }