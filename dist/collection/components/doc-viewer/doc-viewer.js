// src/components/doc-viewer/doc-viewer.tsx
import { h } from "@stencil/core";
import { HistoryManager } from "../../utils/history";
const pdfjsLib = window.pdfjsLib;
const TAG_OPTIONS = ['None', 'Important', 'Todo', 'Question', 'Idea'];
export class DocViewer {
    src;
    scale = 1.2;
    fileType = 'pdf';
    embedded = false;
    theme = 'light';
    mode = 'editor';
    numPages = 0;
    activeTool = 'select';
    annotations = {};
    comments = {};
    sidebarOpen = false;
    sidebarPage = null;
    sidebarSelectedId = null;
    sidebarDraftText = '';
    sidebarDraftTag = 'None';
    // virtual / lazy: which pages are visible
    visiblePages = { 1: true };
    history = new HistoryManager();
    fileInputEl;
    intersectionObserver;
    // ---------- STORAGE ----------
    storageKey(kind) {
        const base = this.src || 'default';
        const safe = base.replace(/[^a-z0-9]/gi, '_');
        return `dv_${kind}_${safe}`;
    }
    detectFileType(src) {
        const s = src.toLowerCase();
        if (s.endsWith('.pdf'))
            return 'pdf';
        if (s.match(/\.(png|jpe?g|gif|bmp|webp)$/))
            return 'image';
        if (s.match(/\.(txt|md)$/))
            return 'text';
        return 'text';
    }
    async componentDidLoad() {
        const url = new URL(window.location.href);
        if (url.searchParams.get('embedded') === 'true')
            this.embedded = true;
        const ann = localStorage.getItem(this.storageKey('annotations'));
        if (ann)
            this.annotations = JSON.parse(ann);
        const cm = localStorage.getItem(this.storageKey('comments'));
        if (cm)
            this.comments = JSON.parse(cm);
        if (!this.fileType)
            this.fileType = this.detectFileType(this.src);
        if (this.fileType === 'pdf') {
            const task = pdfjsLib.getDocument(this.src);
            const pdf = await task.promise;
            this.numPages = pdf.numPages;
        }
        else {
            this.numPages = 1;
        }
        this.history.pushState({
            annotations: this.annotations,
            comments: this.comments,
        });
        this.setupIntersectionObserver();
    }
    setupIntersectionObserver() {
        if (typeof IntersectionObserver === 'undefined')
            return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            const updated = { ...this.visiblePages };
            let changed = false;
            for (const entry of entries) {
                const el = entry.target;
                const pageStr = el.getAttribute('data-page');
                if (!pageStr)
                    continue;
                const page = parseInt(pageStr, 10);
                if (!page)
                    continue;
                if (entry.isIntersecting && !updated[page]) {
                    updated[page] = true;
                    changed = true;
                }
            }
            if (changed) {
                this.visiblePages = updated;
            }
        }, {
            threshold: 0.2,
        });
    }
    observePageContainer = (el, page) => {
        if (!el || !this.intersectionObserver)
            return;
        el.setAttribute('data-page', String(page));
        this.intersectionObserver.observe(el);
    };
    // ===== HISTORY =====
    pushHistory() {
        this.history.pushState({
            annotations: this.annotations,
            comments: this.comments,
        });
    }
    persist() {
        localStorage.setItem(this.storageKey('annotations'), JSON.stringify(this.annotations));
        localStorage.setItem(this.storageKey('comments'), JSON.stringify(this.comments));
    }
    undo = () => {
        const state = this.history.undo({
            annotations: this.annotations,
            comments: this.comments,
        });
        if (!state)
            return;
        this.annotations = state.annotations;
        this.comments = state.comments;
        this.persist();
    };
    redo = () => {
        const state = this.history.redo({
            annotations: this.annotations,
            comments: this.comments,
        });
        if (!state)
            return;
        this.annotations = state.annotations;
        this.comments = state.comments;
        this.persist();
    };
    // ===== EVENTS FROM PAGES =====
    handleAnnotationCreated = (ev) => {
        const { page, rect } = ev.detail;
        this.pushHistory();
        const clone = { ...this.annotations };
        const list = clone[page] ? [...clone[page]] : [];
        list.push(rect);
        clone[page] = list;
        this.annotations = clone;
        this.persist();
    };
    handleCommentAddRequested = (ev) => {
        this.pushHistory();
        const { page, x, y, kind } = ev.detail;
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        const updated = { ...this.comments };
        const list = updated[page] ? [...updated[page]] : [];
        list.push({
            id,
            kind,
            x,
            y,
            text: '',
            tag: 'None',
            createdAt: new Date().toISOString(),
        });
        updated[page] = list;
        this.comments = updated;
        this.persist();
        this.sidebarOpen = true;
        this.sidebarPage = page;
        this.sidebarSelectedId = id;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    handleCommentIconClicked = (ev) => {
        const { page, commentId } = ev.detail;
        this.sidebarOpen = true;
        this.sidebarPage = page;
        this.sidebarSelectedId = commentId;
        const c = this.getComment(page, commentId);
        if (c) {
            this.sidebarDraftText = c.text;
            this.sidebarDraftTag = c.tag;
        }
    };
    getComment(page, id) {
        const list = this.comments[page] || [];
        return list.find((c) => c.id === id) || null;
    }
    // ===== TOOLBAR =====
    setTool(tool) {
        this.activeTool = tool;
    }
    // ===== SIDEBAR HELPERS =====
    getSidebarComments() {
        if (!this.sidebarPage)
            return [];
        return this.comments[this.sidebarPage] || [];
    }
    selectSidebarComment(id) {
        this.sidebarSelectedId = id;
        const c = this.sidebarPage ? this.getComment(this.sidebarPage, id) : null;
        if (c) {
            this.sidebarDraftText = c.text;
            this.sidebarDraftTag = c.tag;
        }
    }
    saveSidebarAnnotation = () => {
        if (!this.sidebarPage || !this.sidebarSelectedId)
            return;
        this.pushHistory();
        const page = this.sidebarPage;
        const list = [...(this.comments[page] || [])];
        const idx = list.findIndex((c) => c.id === this.sidebarSelectedId);
        if (idx < 0)
            return;
        list[idx] = {
            ...list[idx],
            text: this.sidebarDraftText,
            tag: this.sidebarDraftTag,
        };
        this.comments = { ...this.comments, [page]: list };
        this.persist();
    };
    async mockAITag(text) {
        const t = text.toLowerCase();
        if (!t.trim())
            return 'None';
        if (t.includes('?'))
            return 'Question';
        if (t.includes('important') || t.length > 80)
            return 'Important';
        if (t.includes('todo') || t.includes('fix'))
            return 'Todo';
        if (t.includes('idea'))
            return 'Idea';
        return 'Idea';
    }
    deleteSidebarAnnotation = () => {
        if (!this.sidebarPage || !this.sidebarSelectedId)
            return;
        this.pushHistory();
        const page = this.sidebarPage;
        const list = [...(this.comments[page] || [])];
        const updated = list.filter((c) => c.id !== this.sidebarSelectedId);
        this.comments = { ...this.comments, [page]: updated };
        this.persist();
        this.sidebarSelectedId = null;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    closeSidebar = () => {
        this.sidebarOpen = false;
        this.sidebarPage = null;
        this.sidebarSelectedId = null;
        this.sidebarDraftText = '';
        this.sidebarDraftTag = 'None';
    };
    // ===== EXPORT / IMPORT (STATE) =====
    exportJson = () => {
        const data = {
            version: 1,
            src: this.src,
            fileType: this.fileType,
            theme: this.theme,
            mode: this.mode,
            activeTool: this.activeTool,
            annotations: this.annotations,
            comments: this.comments,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doc-viewer-state.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    onImportFileChange = (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                this.pushHistory();
                this.annotations = data.annotations || {};
                this.comments = data.comments || {};
                if (data.theme)
                    this.theme = data.theme;
                if (data.mode)
                    this.mode = data.mode;
                if (data.activeTool)
                    this.activeTool = data.activeTool;
                this.persist();
            }
            catch {
                // ignore
            }
            finally {
                input.value = '';
            }
        };
        reader.readAsText(file);
    };
    // ===== SIDEBAR UI =====
    renderSidebar() {
        if (!this.sidebarOpen || !this.sidebarPage)
            return null;
        const pageComments = this.getSidebarComments();
        const readOnly = this.mode === 'viewer' || this.embedded;
        const selected = this.sidebarSelectedId &&
            pageComments.find((c) => c.id === this.sidebarSelectedId);
        return (h("div", { class: "comment-sidebar" }, h("div", { class: "sidebar-header" }, h("strong", null, "Annotations \u2013 Page ", this.sidebarPage), h("button", { class: "close-btn", onClick: this.closeSidebar }, "\u2715")), h("div", { class: "comment-list" }, pageComments.length === 0 ? (h("div", { class: "empty" }, "No comments or notes yet.")) : (pageComments.map((c) => (h("div", { class: {
                'comment-item': true,
                selected: c.id === this.sidebarSelectedId,
            }, onClick: () => this.selectSidebarComment(c.id) }, h("div", { class: "comment-meta" }, h("span", { class: "kind-pill" }, c.kind === 'comment' ? 'Comment' : 'Note'), h("span", { class: "meta-time" }, " \u2022 ", new Date(c.createdAt).toLocaleString())), h("div", { class: "comment-meta tag-line" }, "Tag: ", c.tag), h("div", { class: "comment-text-preview" }, c.text ? c.text.slice(0, 80) : '(no text yet)')))))), h("div", { class: "comment-editor" }, selected ? (h(h.Fragment, null, h("div", { class: "editor-meta" }, "Editing ", selected.kind, " created ", new Date(selected.createdAt).toLocaleString()), h("label", { class: "tag-label" }, "Tag:", h("select", { disabled: readOnly, onChange: (e) => (this.sidebarDraftTag = e.target.value) }, TAG_OPTIONS.map((t) => (h("option", { value: t, selected: this.sidebarDraftTag === t }, t))))), h("textarea", { value: this.sidebarDraftText, disabled: readOnly, onInput: (e) => (this.sidebarDraftText = e.target.value), placeholder: "Type annotation details here..." }), h("div", { class: "editor-buttons" }, h("button", { disabled: readOnly, onClick: this.saveSidebarAnnotation }, "Save"), h("button", { class: "ai-tag-btn", disabled: readOnly, onClick: async () => {
                this.sidebarDraftTag = await this.mockAITag(this.sidebarDraftText);
                this.saveSidebarAnnotation();
            } }, "\uD83E\uDD16 Auto-Tag"), h("button", { class: "delete-btn", disabled: readOnly, onClick: this.deleteSidebarAnnotation }, "\uD83D\uDDD1 Delete")))) : (h("div", { class: "editor-meta" }, "Click a comment or note icon on the doc.")))));
    }
    // ===== MAIN RENDER =====
    render() {
        const readOnly = this.mode === 'viewer' || this.embedded;
        const pages = Array.from({ length: this.numPages || 0 }, (_, i) => i + 1);
        return (h("div", { key: '223069720ac91636227a6a33069a1afbe7abdf2e', class: `viewer-container theme-${this.theme}` }, !this.embedded && (h("div", { key: '5ef94daff315d0347db65261fdb93f597902048d', class: "toolbar" }, h("button", { key: '7bfbcc711d5a62ff7b1a5df9e113b76b2bedf1f9', disabled: readOnly, class: this.activeTool === 'select' ? 'active' : '', onClick: () => this.setTool('select') }, "Select"), h("button", { key: 'cf2613b858e8c581f99159758850e722522b953e', disabled: readOnly, class: this.activeTool === 'highlight' ? 'active' : '', onClick: () => this.setTool('highlight') }, "Highlight"), h("button", { key: 'cb86bcb6622c3ffa9daa878e2a40d66244420281', disabled: readOnly, class: this.activeTool === 'comment' ? 'active' : '', onClick: () => this.setTool('comment') }, "Comment"), h("button", { key: '56ca7c23e4d339c663a09098282279a03d856d5a', disabled: readOnly, class: this.activeTool === 'note' ? 'active' : '', onClick: () => this.setTool('note') }, "Note"), h("div", { key: '4a98f6db2a15b5e0c52f586b344be406ad071d37', class: "toolbar-spacer" }), h("button", { key: '7a574acb41a8c3db81d31325f3bc6bb926a80aa7', disabled: readOnly, onClick: this.undo }, "\u293A Undo"), h("button", { key: 'd4bb6113e31041b52e5c18aa1cfa23f2606c8a90', disabled: readOnly, onClick: this.redo }, "\u293C Redo"), h("div", { key: '8d359e25665d72d2d046916aa7df97607f493ae8', class: "toolbar-spacer" }), h("button", { key: '5bd424113a03f321d78adadd524416cfe9bdbf9f', onClick: this.exportJson }, "\u2B06 Export"), h("button", { key: '642033dbcacdd6076e4f4905eceb28b3fdc1aec2', disabled: readOnly, onClick: () => this.fileInputEl?.click() }, "\u2B07 Import"), h("input", { key: '8e83a854e66fca389fb45dfe9b6dea0494de4e8f', type: "file", accept: "application/json", style: { display: 'none' }, ref: (el) => (this.fileInputEl = el), onChange: this.onImportFileChange }), h("label", { key: 'f3fb274f9c1ceacff2d5b2b3f72a5c812590ab6d' }, "Theme:"), h("select", { key: 'c9a01eea00d6a6eaf8b1ea5a81e801b469a52d38', onChange: (e) => (this.theme = e.target.value) }, h("option", { key: 'e7be10f8e778afe989ae8ac8839a393215aa85b8', value: "light", selected: this.theme === 'light' }, "Light"), h("option", { key: 'dc4b07530a737a3cedb5d77b0e93721f2d1fece2', value: "dark", selected: this.theme === 'dark' }, "Dark"), h("option", { key: '191782ace171d381600a523c0b2ef68b0674995d', value: "sepia", selected: this.theme === 'sepia' }, "Sepia")), h("label", { key: '72f7bb2dad4adade8378e3961f9b6c48435b3b37' }, "Mode:"), h("select", { key: '9f2b4ed099bbe61aca1daa8c2eac097c69dd9b7b', onChange: (e) => (this.mode = e.target.value) }, h("option", { key: '765a980587716ed7f37f0081cb600443e53fab5b', value: "editor", selected: this.mode === 'editor' }, "Editor"), h("option", { key: 'a7e5e6b11d88c74f10d47af5687d8442d581f191', value: "viewer", selected: this.mode === 'viewer' }, "Viewer")))), h("div", { key: '56284ffda518bbdb201ca2be2ec233d205ba4396', class: "viewer-main" }, h("div", { key: '1c81e83ade1da038adef7e53936ecfc90976a21e', class: {
                'pdf-panel': true,
                'has-sidebar': this.sidebarOpen,
            } }, h("div", { key: 'f06332e958946313e6af80c72e70049043136d69', class: "pages-container" }, pages.map((pageNum) => (h("div", { class: "virtual-page-wrapper", ref: (el) => this.observePageContainer(el, pageNum) }, h("doc-page", { src: this.src, page: pageNum, key: pageNum, scale: this.scale, fileType: this.fileType, readOnly: readOnly, activeTool: this.activeTool, visible: !!this.visiblePages[pageNum], annotations: this.annotations[pageNum] || [], comments: this.comments[pageNum] || [], onAnnotationCreated: this.handleAnnotationCreated, onCommentAddRequested: this.handleCommentAddRequested, onCommentIconClicked: this.handleCommentIconClicked })))))), !this.embedded && this.renderSidebar())));
    }
    static get is() { return "doc-viewer"; }
    static get originalStyleUrls() {
        return {
            "$": ["doc-viewer.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["doc-viewer.css"]
        };
    }
    static get properties() {
        return {
            "src": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": true,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "src"
            },
            "scale": {
                "type": "number",
                "mutable": false,
                "complexType": {
                    "original": "number",
                    "resolved": "number",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "scale",
                "defaultValue": "1.2"
            },
            "fileType": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "FileType",
                    "resolved": "\"image\" | \"pdf\" | \"text\"",
                    "references": {
                        "FileType": {
                            "location": "local",
                            "path": "D:/ProgrammingPractice/stencilmainProject/my-pdf/src/components/doc-viewer/doc-viewer.tsx",
                            "id": "src/components/doc-viewer/doc-viewer.tsx::FileType"
                        }
                    }
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "file-type",
                "defaultValue": "'pdf'"
            },
            "embedded": {
                "type": "boolean",
                "mutable": true,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "embedded",
                "defaultValue": "false"
            },
            "theme": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "'light' | 'dark' | 'sepia'",
                    "resolved": "\"dark\" | \"light\" | \"sepia\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "theme",
                "defaultValue": "'light'"
            },
            "mode": {
                "type": "string",
                "mutable": true,
                "complexType": {
                    "original": "'viewer' | 'editor'",
                    "resolved": "\"editor\" | \"viewer\"",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": true,
                "attribute": "mode",
                "defaultValue": "'editor'"
            }
        };
    }
    static get states() {
        return {
            "numPages": {},
            "activeTool": {},
            "annotations": {},
            "comments": {},
            "sidebarOpen": {},
            "sidebarPage": {},
            "sidebarSelectedId": {},
            "sidebarDraftText": {},
            "sidebarDraftTag": {},
            "visiblePages": {}
        };
    }
}
//# sourceMappingURL=doc-viewer.js.map
