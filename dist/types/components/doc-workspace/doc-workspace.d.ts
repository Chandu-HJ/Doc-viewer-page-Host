import type { FileType } from '../doc-viewer/doc-viewer';
interface WorkspaceFile {
    id: string;
    name: string;
    url: string;
    fileType: FileType;
}
export declare class DocWorkspace {
    scale: number;
    files: WorkspaceFile[];
    activeId: string | null;
    theme: 'light' | 'dark' | 'sepia';
    private fileInput?;
    private onFileSelected;
    private closeFile;
    render(): any;
}
export {};
