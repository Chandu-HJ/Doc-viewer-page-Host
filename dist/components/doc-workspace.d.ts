import type { Components, JSX } from "../types/components";

interface DocWorkspace extends Components.DocWorkspace, HTMLElement {}
export const DocWorkspace: {
    prototype: DocWorkspace;
    new (): DocWorkspace;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
