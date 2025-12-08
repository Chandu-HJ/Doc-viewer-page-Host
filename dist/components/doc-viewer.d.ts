import type { Components, JSX } from "../types/components";

interface DocViewer extends Components.DocViewer, HTMLElement {}
export const DocViewer: {
    prototype: DocViewer;
    new (): DocViewer;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
