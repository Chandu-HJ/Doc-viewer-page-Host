import { NormalizedRect } from '../../types/annotations';
import { PageComment, AnnotationKind } from '../../types/comments';
export type FileType = 'pdf' | 'image' | 'text';
export declare class DocViewer {
    src: string;
    scale: number;
    fileType: FileType;
    embedded: boolean;
    theme: 'light' | 'dark' | 'sepia';
    mode: 'viewer' | 'editor';
    numPages: number;
    activeTool: 'select' | 'highlight' | 'comment' | 'note';
    annotations: Record<number, NormalizedRect[]>;
    comments: Record<number, PageComment[]>;
    sidebarOpen: boolean;
    sidebarPage: number | null;
    sidebarSelectedId: string | null;
    sidebarDraftText: string;
    sidebarDraftTag: string;
    visiblePages: {
        [page: number]: boolean;
    };
    private history;
    private fileInputEl?;
    private intersectionObserver?;
    private storageKey;
    private detectFileType;
    componentDidLoad(): Promise<void>;
    private setupIntersectionObserver;
    private observePageContainer;
    private pushHistory;
    private persist;
    undo: () => void;
    redo: () => void;
    handleAnnotationCreated: (ev: CustomEvent<{
        page: number;
        rect: NormalizedRect;
    }>) => void;
    handleCommentAddRequested: (ev: CustomEvent<{
        page: number;
        x: number;
        y: number;
        kind: AnnotationKind;
    }>) => void;
    handleCommentIconClicked: (ev: CustomEvent<{
        page: number;
        commentId: string;
    }>) => void;
    private getComment;
    setTool(tool: 'select' | 'highlight' | 'comment' | 'note'): void;
    private getSidebarComments;
    private selectSidebarComment;
    saveSidebarAnnotation: () => void;
    private mockAITag;
    deleteSidebarAnnotation: () => void;
    closeSidebar: () => void;
    exportJson: () => void;
    onImportFileChange: (e: Event) => void;
    renderSidebar(): any;
    render(): any;
}
