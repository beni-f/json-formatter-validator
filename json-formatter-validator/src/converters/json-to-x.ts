export class JsonToXConverter {
    toTypeScript(jsonObj: any, rootName = 'Root'): string {
        const interfaceDef = this.generateTsInterface(jsonObj, rootName);
        const example = `const data: ${rootName} = ${JSON.stringify(jsonObj, null, 2)};`;
        return `${interfaceDef}\n\n${example}`;
    }

    toGo(jsonObj: any, rootName = 'Root'): string {
        let goCode = `type ${rootName} struct {\n`;
        // ✅ FIXED: Inline implementation
        for (const [key, value] of Object.entries(jsonObj)) {
            const goType = this.inferGoType(value);
            goCode += `  ${this.toGoFieldName(key)} ${goType} \`json:"${key}"\`\n`;
        }
        goCode += `}\n\n// JSON example:\n// ${JSON.stringify(jsonObj, null, 2).replace(/\n/g, '\n// ')}`;
        return goCode;
    }

    toSql(jsonObj: any, tableName = 'data_table'): string {
        let sql = `-- Auto-generated SQL schema from JSON\n`;
        sql += `CREATE TABLE ${tableName} (\n`;
        sql += `  id SERIAL PRIMARY KEY,\n`;
        // ✅ FIXED: Inline implementation
        for (const [key, value] of Object.entries(jsonObj)) {
            const sqlType = this.inferSqlType(value);
            sql += `  ${this.toSqlColumnName(key)} ${sqlType},\n`;
        }
        return sql.replace(/,\n$/, '\n') + `);`;
    }

    toRust(jsonObj: any, rootName = 'RootStruct'): string {
        let rustCode = `[derive(Debug, serde::Deserialize)]\npub struct ${rootName} {\n`;
        for (const [key, value] of Object.entries(jsonObj)) {
            const rustType = this.inferRustType(value);
            rustCode += `  pub ${this.toRustFieldName(key)}: ${rustType},\n`;
        }
        rustCode += `}\n\n// JSON example:\n// ${JSON.stringify(jsonObj, null, 2).replace(/\n/g, '\n// ')}`;
        return rustCode;
    }

    // ✅ All helper methods (unchanged)
    private generateTsInterface(obj: any, name: string): string {
        let ts = `interface ${name} {\n`;
        for (const [key, value] of Object.entries(obj)) {
            const tsType = this.inferTsType(value);
            ts += `  /** ${typeof value} */\n  ${key}: ${tsType};\n`;
        }
        return ts + `}`;
    }

    private inferTsType(value: any): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) {
            const itemType = this.inferTsType(value[0] ?? {});
            return `${itemType}[]`;
        }
        switch (typeof value) {
            case 'string': return 'string';
            case 'number': return Number.isInteger(value) ? 'number' : 'number';
            case 'boolean': return 'boolean';
            case 'object': return 'Record<string, any>';
            default: return 'unknown';
        }
    }

    private inferGoType(value: any): string {
        if (value === null) return 'interface{}';
        if (Array.isArray(value)) return '[]interface{}';
        switch (typeof value) {
            case 'string': return 'string';
            case 'number': return 'float64';
            case 'boolean': return 'bool';
            case 'object': return 'map[string]interface{}';
            default: return 'interface{}';
        }
    }

    private inferSqlType(value: any): string {
        if (Array.isArray(value)) return 'JSONB[]';
        switch (typeof value) {
            case 'string': return 'TEXT';
            case 'number': return Number.isInteger(value) ? 'BIGINT' : 'DECIMAL(15,2)';
            case 'boolean': return 'BOOLEAN';
            case 'object': return 'JSONB';
            default: return 'TEXT';
        }
    }

    private inferRustType(value: any): string {
        if (value === null) return 'Option<()>';
        if (Array.isArray(value)) return 'Vec<serde_json::Value>';
        switch (typeof value) {
            case 'string': return 'String';
            case 'number': return 'f64';
            case 'boolean': return 'bool';
            case 'object': return 'serde_json::Value';
            default: return 'serde_json::Value';
        }
    }

    private toGoFieldName(key: string): string {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    private toSqlColumnName(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }

    private toRustFieldName(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '_');
    }
}
