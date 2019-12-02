const path = require('path');
const fs = require('fs');
const DomParser = require('dom-parser');
const HTMLtoJSX = require('htmltojsx');
const Dependency = require('./Dependency');
const replaceVariable = require('./replaceVariable');

const TYPE_LAYOUT = 'layout';
const TYPE_INCLUDE = 'include';
const TYPE_PAGE = 'page';

class ComponentFile {

	constructor(rootDestPath, sourcePath, contents) {
		this.rootDestPath = rootDestPath;
		this.sourcePath = sourcePath;
		this.contents = contents;
		this.originalContents = contents;
		this.propsArg = 'props';
		this.componentName = path.basename(sourcePath, '.ss');
		this.requirements = [
			new Dependency('React', 'react')
		];
		this.converter = new HTMLtoJSX({
			createClass: false,
		});		
	}

	getType() {
		const dir = path.dirname(this.sourcePath);		
		switch (dir) {
			case 'Layout':
				return TYPE_LAYOUT;
			case 'Includes':
				return TYPE_INCLUDE;
			default:
				return TYPE_PAGE;
		}
	}

	getSubdirectory(type) {
		switch (type) {
			case TYPE_LAYOUT:
				return 'Layout';
			case TYPE_INCLUDE:
				return 'components';
			default:
				return '';
		}
	}

	getDestPath() {
		return path.join(
			this.rootDestPath,
			this.getSubdirectory(this.getType()),
			`${this.componentName}.js`
		);
	}

	async requireComponent(name) {
		const componentPath = path.join(
			this.rootDestPath,
			this.getSubdirectory(TYPE_INCLUDE),
			name
		);
		this.requirements = [
			...this.requirements,
			new Dependency(
				name,
				path.relative(
					this.getDestPath(),
					componentPath
				)
			)
		];

		const requiredComponent = new ComponentFile(
			this.rootDestPath,
			`Includes/${name}.ss`,
			'<div>Placeholder</div>'
		);

		if (!requiredComponent.exists()) {
			console.log(`Component ${name} does not exist yet. Creating placeholder`);
			await requiredComponent.persist();
		}

		return this;
	}

	parseIncludes() {
    	this.contents = this.contents.replace(
    		/{\/\*\s+include\s+([A-Za-z0-9_\\]+)(\s+[A-Za-z0-9_,="'${}. ]+)?\s+\*\/}/ig,
    		(match, identifier, args) => {
				let propStr = '';
				if (typeof args === 'string') {
					const propNames = args.match(/([A-Za-z0-9_]+)=/g).map(match => {
						return match.match(/^([A-Za-z0-9_]+)/)[1];
					});
					const propValues = args.match(/="?(.+?)(,|$)"?/g).map(match => {
						return match.match(/=(.+?)(,|$)/)[1];
					})
					if (propNames.length !== propValues.length) {
						throw new Error(`Malformed include tag: ${match}. Prop names and values are not equal length`);
					}
					propStr = propNames.reduce((acc, curr, i) => {
						const arg = curr;
						const value = propValues[i];
						console.log(value);
						const valueExpr = value.startsWith('{')
							? value
							: `"${value}"`

						return `${acc} ${arg}=${valueExpr}`;
					}, '');
				}
    			const name = identifier.split('\\').pop().trim();
				this.requireComponent(name);				

    			return `<${name}${propStr} />`;
    		}
    	)
	}

	parseVariables() {
		// Attribute variables
		this.contents = this.contents.replace(
			/([a-zA-Z]+)="{?\$(.+?)"/igm,
			(_, attrName, attrValue) => `${attrName}={${this.propsArg}.${attrValue}}`
		);
		this.contents = replaceVariable(this.contents);
	}

	toJSX() {
        let jsx = this.contents.replace(/(<%)(.+?)(%>)/g,`<!-- $2 -->`);
        try {
            jsx = this.converter.convert(jsx);
            jsx = jsx.split("\n")
                    .map(line => `\t\t${line}`)
                    .join("\n");
        } catch (e) {
        	console.error(`Error processing HTML to JSX: ${e}`);
        }
        this.contents = jsx;		
	}

	exists() {
		return fs.existsSync(this.getDestPath());
	}

	persist() {
		return new Promise((resolve, reject) => {
			const dir = path.dirname(this.getDestPath());
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true});
			}
			fs.writeFile(this.getDestPath(), this.toString(), (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		})
	}
	

	toString() {
		this.toJSX();
		this.parseVariables();
		this.parseIncludes();
		const parser = new DomParser();
		const dom = parser.parseFromString(`<div id="___wrap">${this.originalContents.trim()}</div>`);
		const containerEl = dom.getElementById('___wrap');
		const needsFragment = !this.converter._onlyOneTopLevel(containerEl);
		const contents = needsFragment
			? this.contents
				.replace(
					/^(\s*)<div>/,
					(_, spaces) => `${spaces}<>`
				)
				.replace(
					/<\/div>(\s*)$/,
					(_, spaces) => `</>${spaces}`
				)
			: this.contents;
		const deps = this.requirements
			.map(r => r.toString())
			.join('\n');

		return `${deps}

const ${this.componentName} = (${this.propsArg}) => {
    return (
${contents}
    );
};

export default ${this.componentName};
`;

	}

}

module.exports = ComponentFile;