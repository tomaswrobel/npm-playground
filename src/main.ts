import "./assets/style.css";
import * as monaco from 'monaco-editor';
import CodeEditor from './components/code-editor';

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    module: monaco.languages.typescript.ModuleKind.ES2015,
    jsx: monaco.languages.typescript.JsxEmit.Preserve,
	moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs
})
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.addExtraLib('declare module "*";');

new CodeEditor();