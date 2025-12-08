import { EventEmitter } from '../../stencil-public-runtime';
import { NormalizedRect } from '../../types/annotations';
import { PageComment, AnnotationKind } from '../../types/comments';
export declare class DocPage {
    host: HTMLElement;
    src: string;
    page: number;
    scale: number;
    fileType: 'pdf' | 'image' | 'text';
    activeTool: 'select' | 'highlight' | 'comment' | 'note';
    readOnly: boolean;
    visible: boolean;
    annotations: NormalizedRect[];
    comments: PageComment[];
    annotationCreated: EventEmitter<{
        page: number;
        rect: NormalizedRect;
    }>;
    commentAddRequested: EventEmitter<{
        page: number;
        x: number;
        y: number;
        kind: AnnotationKind;
    }>;
    commentIconClicked: EventEmitter<{
        page: number;
        commentId: string;
    }>;
    private viewerContainer;
    private annotationLayerEl;
    private isDrawing;
    private startX;
    private startY;
    private currentRectEl;
    private hasRendered;
    componentDidLoad(): Promise<void>;
    visibleChanged(): Promise<void>;
    annotationsChanged(): void;
    commentsChanged(): void;
    activeToolChanged(): void;
    readOnlyChanged(): void;
    private ensureRendered;
    private renderPdfPage;
    private renderImagePage;
    private renderTextPage;
    private setupAnnotationLayer;
    private updatePointerEvents;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private handleTextMouseUp;
    private redrawHighlightsFromProps;
    private redrawCommentsFromProps;
    render(): any;
}
