class Dependency {

	constructor(name, path) {
		this.name = name;
		this.path = path;
	}

	toString() {
		return `import ${this.name} from '${this.path}';`
	}
}

module.exports = Dependency;