import { SchemaSynthesizer } from './schema-synthesizer';
import { CodeGenerator, CompilerOutput } from './codegen';

export interface FullCompilerOutput {
    schema: any;
    code: CompilerOutput;
    metadata: {
        compiledAt: string;
        duration: string;
        inputSize: number;
        complexity: number;
    };
}

export class JsonCompilerPipeline {
    private synthesizer = new SchemaSynthesizer();
    private generator = new CodeGenerator();

    compile(jsonObj: any): FullCompilerOutput {
        const start = performance.now();

        const schema = this.synthesizer.synthesize(jsonObj);
        const code = this.generator.generate(schema);

        const duration = performance.now() - start;

        return {
            schema,
            code,
            metadata: {
                compiledAt: new Date().toISOString(),
                duration: `${duration.toFixed(2)}ms`,
                inputSize: JSON.stringify(jsonObj).length,
                complexity: this.analyzeComplexity(jsonObj)
            }
        };
    }

    private analyzeComplexity(obj: any): number {
        return Object.keys(obj || {}).length;
    }
}
