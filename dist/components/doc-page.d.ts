import type { Components, JSX } from "../types/components";

interface DocPage extends Components.DocPage, HTMLElement {}
export const DocPage: {
    prototype: DocPage;
    new (): DocPage;
};
/**
 * Used to define this component and all nested components recursively.
 */
export const defineCustomElement: () => void;
