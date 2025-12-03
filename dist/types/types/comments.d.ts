export type AnnotationKind = 'comment' | 'note';
export interface PageComment {
    id: string;
    kind: AnnotationKind;
    x: number;
    y: number;
    text: string;
    tag: string;
    createdAt: string;
}
