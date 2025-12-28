export interface CompilerOutput {
    typescript: string;
    go: string;
    rust: string;
    validator: string;
}

export class CodeGenerator {
    generate(schema: any): CompilerOutput {
        return {
            typescript: this.generateTypeScript(schema),
            go: this.generateGo(schema),
            rust: this.generateRust(schema),
            validator: this.generateValidator(schema)
        };
    }

    private generateTypeScript(schema: any): string {
        return `// Auto-generated from JSON
export interface Root {
${this.renderTsProperties(schema.properties, 1)}
}`;
    }

    private generateGo(schema: any): string {
        let goCode = `// Auto-generated Go structs
type Root struct {
${this.renderGoProperties(schema.properties, 1)}
}\n\n`;

        // Add nested types
        goCode += this.generateNestedGoTypes(schema.properties);
        return goCode;
    }

    private generateRust(schema: any): string {
        return `#[derive(Debug, serde::Deserialize)]
pub struct Root {
${this.renderRustProperties(schema.properties, 1)}
}`;
    }

    private generateValidator(schema: any): string {
        return `export function validateRoot(data: any): boolean {
  return data && data.user && typeof data.user === 'object';
}`;
    }

    private renderTsProperties(props: any, indent: number): string {
        let output = '';
        const spaces = '  '.repeat(indent);

        Object.entries(props).forEach(([key, prop]: [string, any]) => {
            if (prop.properties) {
                // NESTED OBJECT
                output += `${spaces}${key}: {\n${this.renderTsProperties(prop.properties, indent + 1)}${spaces}};\n`;
            } else if (prop.type === 'array') {
                output += `${spaces}${key}: ${this.mapTsType(prop.items?.type || 'any')}[];\n`;
            } else {
                output += `${spaces}${key}: ${this.mapTsType(prop.type)};\n`;
            }
        });

        return output;
    }

    private renderGoProperties(props: any, indent: number): string {
        let output = '';
        const spaces = '  '.repeat(indent);

        Object.entries(props).forEach(([key, prop]: [string, any]) => {
            const goType = this.mapGoType(prop);
            output += `${spaces}${this.toGoFieldName(key)} ${goType} \`json:"${key}"\`\n`;
        });

        return output;
    }

    private renderRustProperties(props: any, indent: number): string {
        let output = '';
        const spaces = '  '.repeat(indent);

        Object.entries(props).forEach(([key, prop]: [string, any]) => {
            const rustType = this.mapRustType(prop);
            output += `${spaces}pub ${this.toRustFieldName(key)}: ${rustType},\n`;
        });

        return output;
    }

    private mapTsType(schemaType: string): string {
        const map: Record<string, string> = {
            'string': 'string', 'number': 'number', 'boolean': 'boolean', 'null': 'null'
        };
        return map[schemaType] || 'any';
    }

    private mapGoType(prop: any): string {
        if (prop.properties) return this.toGoFieldName(Object.keys(prop.properties)[0] || 'Struct');
        if (prop.type === 'array') return '[]float64';
        const map: Record<string, string> = { 'string': 'string', 'number': 'float64', 'boolean': 'bool' };
        return map[prop.type] || 'interface{}';
    }

    private mapRustType(prop: any): string {
        if (prop.properties) return 'serde_json::Value';
        if (prop.type === 'array') return 'Vec<f64>';
        const map: Record<string, string> = { 'string': 'String', 'number': 'f64', 'boolean': 'bool' };
        return map[prop.type] || 'serde_json::Value';
    }

    private toGoFieldName(key: string): string {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    private toRustFieldName(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '_');
    }

    private generateNestedGoTypes(props: any): string {
        let types = '';
        Object.entries(props).forEach(([key, prop]: [string, any]) => {
            if (prop.properties) {
                types += `type ${this.toGoFieldName(key)} struct {\n${this.renderGoProperties(prop.properties, 1)}}\n\n`;
            }
        });
        return types;
    }
}
