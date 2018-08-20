const npm = require('npm');
const fs = require('fs')
const chalk = require('chalk')
const ncp = require('ncp').ncp

const LIB_CONFIG = '/lib.config.json'
const ANKA_CONFIG = '/anka.config.json'
const COMPONENT_DIR = '/miniprogram_dist'

class _Installer {

	constructor(packages) {
		this.packages = packages;
	}

	init() {
		this.config = JSON.parse(fs.readFileSync(__dirname + LIB_CONFIG, 'utf8'));
		let ankaModulesDir = `${process.cwd()}` + this.config.installPath;
		if (!fs.existsSync(ankaModulesDir)){
		    fs.mkdirSync(ankaModulesDir);
		}

		return new Promise(resolve => {
			npm.load(error => {
				console.log(chalk.green('========== Anka Installer Initialization Completed! =========='))
				error ? process.exit(1) : resolve()
			}) 
		});
	}

	async install() {
		await this.init();
		return new Promise((resolve, reject) => {
			npm.commands.install(this.packages, (error, data) => {
				error ? reject(error) : resolve(data)
			});
		})
	}

	async uninstall() {
		await this.init();
		return new Promise((resolve, reject) => {
			npm.commands.uninstall(this.packages, (error, data) => {
				error ? reject(error) : resolve(data)
			});
		}) 
	}

	inject(paths) {
		Promise.all(paths.map(item => {
			let packagePaths = item[1].split('/');
			let configPath = item[1] + ANKA_CONFIG;
			let componentPath = item[1] + COMPONENT_DIR;

			if (fs.existsSync(configPath)) {
				let obj = JSON.parse(fs.readFileSync(configPath, 'utf8'));
				if (obj.type === 'component') {
					let destination = `${process.cwd()}` + this.config.installPath + packagePaths[packagePaths.length - 1];
					if (!fs.existsSync(destination)){
					    fs.mkdirSync(destination);
					}
					console.log('Injecting: ' + chalk.yellow(packagePaths[packagePaths.length - 1]));
					ncp(componentPath, destination, function (err) {
						if (err) {
							return console.error(err);
						}
						console.log(chalk.green('========== Cheers! Now You Can Start Acting! =========='))
					});
				}
			}
		})) 
	}
}

async function installPackages(package, otherPackages) {
	let packages = [package, ...otherPackages];
	let installer = new _Installer([package, ...otherPackages]);
	console.log('Now Installing Packages: ' + chalk.yellow(...packages));
	try {
		let result = await installer.install();
		console.log(chalk.green('========== Install Finished, Now Injecting Anka Packages into Miniprogram =========='))
		installer.inject(result);
	} catch (err) {
		console.log('error' + err)
	}
}

async function uninstallPackages(package, otherPackages) {
	let installer = new _Installer([package, ...otherPackages]);
	try {
		let result = await installer.uninstall();
	} catch (err) {
		console.log('error' + err);
	}
}

module.exports = { installPackages, uninstallPackages }