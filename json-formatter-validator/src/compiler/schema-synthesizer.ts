export class SchemaSynthesizer {
    synthesize(jsonObj: any): any {
        return {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            title: 'Root',  // ✅ FIXED: Always "Root"
            properties: this.synthesizeProperties(jsonObj),
            required: Object.keys(jsonObj),
            additionalProperties: false
        };
    }

    private synthesizeProperties(obj: any): Record<string, any> {
        const props: Record<string, any> = {};

        Object.entries(obj).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
                // ✅ NESTED OBJECT - RECURSIVE
                props[key] = {
                    type: 'object',
                    properties: this.synthesizeProperties(value),
                    required: Object.keys(value),
                    additionalProperties: false
                };
            } else if (Array.isArray(value) && value.length > 0) {
                // ✅ ARRAY WITH ITEMS
                props[key] = {
                    type: 'array',
                    items: { type: this.inferPrimitiveType(value[0]) },
                    minItems: 1
                };
            } else {
                // ✅ PRIMITIVE
                props[key] = {
                    type: this.inferPrimitiveType(value),
                    ...this.synthesizeConstraints(value)
                };
            }
        });

        return props;
    }

    private inferPrimitiveType(value: any): string {
        if (value === null) return 'null';
        return typeof value;
    }

    private synthesizeConstraints(value: any): any {
        const constraints: any = {};
        if (typeof value === 'string') {
            if (value.includes('@')) constraints.format = 'email';
            constraints.minLength = 1;
        }
        if (typeof value === 'number') {
            constraints.minimum = value - 1;
            constraints.maximum = value + 1;
        }
        return constraints;
    }
}
