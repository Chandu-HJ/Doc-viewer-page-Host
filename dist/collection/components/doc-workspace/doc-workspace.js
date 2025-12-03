// src/components/doc-workspace/doc-workspace.tsx
import { h } from "@stencil/core";
export class DocWorkspace {
    files = [];
    activeId = null;
    // ⭐ Global theme state (affects viewer + workspace)
    theme = 'light';
    fileInput;
    // ------------------------------------------------------------
    // FILE UPLOAD
    // ------------------------------------------------------------
    onFileSelected = (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        const ext = file.name.toLowerCase();
        const id = Date.now().toString();
        let fileType = 'text';
        if (ext.endsWith('.pdf'))
            fileType = 'pdf';
        else if (ext.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/))
            fileType = 'image';
        const url = URL.createObjectURL(file);
        this.files = [
            ...this.files,
            {
                id,
                name: file.name,
                url,
                fileType,
            },
        ];
        this.activeId = id;
        input.value = '';
    };
    // ------------------------------------------------------------
    // CLOSE TAB
    // ------------------------------------------------------------
    closeFile(id) {
        this.files = this.files.filter((f) => f.id !== id);
        if (this.activeId === id) {
            this.activeId = this.files.length ? this.files[0].id : null;
        }
    }
    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------
    render() {
        const activeFile = this.files.find((f) => f.id === this.activeId);
        return (h("div", { key: 'f4dc64087c34375ff8d925d6fc21a25a79150e43', class: `workspace-container theme-${this.theme}` }, h("div", { key: 'd0d0d1f2decc5af7cfff2c1cb8acba3a714bd403', class: "workspace-toolbar" }, h("button", { key: 'f3703b4d9f3f0a617152f28c30cd52eb6aa741c9', class: "open-btn", onClick: () => this.fileInput?.click() }, "\uD83D\uDCC2 Open File"), h("input", { key: '3897c4dc09a3caa46c5e571b0176020fc300e345', type: "file", accept: ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.txt,.md", style: { display: 'none' }, ref: (el) => (this.fileInput = el), onChange: this.onFileSelected }), h("div", { key: '85dd3f27d82ab406d5b31893189295c32a0f2749', class: "toolbar-spacer" }), h("label", { key: '278e72e8cc95bd712c2f36cef7ef5a6c2fe2cb19', class: "theme-label" }, "Theme:"), h("select", { key: 'bfe26abdef7e66b8a0c2c071daec35fe375940e3', class: "theme-select", onChange: (e) => {
                this.theme = e.target.value;
            } }, h("option", { key: 'bf75d41592c58fc9fe761f8cc333b28b1782b6dc', value: "light", selected: this.theme === 'light' }, "Light"), h("option", { key: '7f56e86ee5e43ab1fb7d1741c20b6adc4b7597c8', value: "dark", selected: this.theme === 'dark' }, "Dark"), h("option", { key: 'df9a34f961fad8b854049785ca6195dcadf955be', value: "sepia", selected: this.theme === 'sepia' }, "Sepia"))), h("div", { key: '9a45bd30f54eabf21983708c2804225971c2c885', class: "workspace-tabs" }, this.files.map((file) => (h("div", { class: {
                tab: true,
                active: file.id === this.activeId,
            }, onClick: () => (this.activeId = file.id) }, file.name, h("span", { class: "close-x", onClick: (ev) => {
                ev.stopPropagation();
                this.closeFile(file.id);
            } }, "\u2716"))))), h("div", { key: 'bdbc5bdb6b5fd15ebb3bbe4c2b24ca487bea81bb', class: "workspace-viewer" }, activeFile ? (h("doc-viewer", { key: activeFile.id, src: activeFile.url, fileType: activeFile.fileType, scale: 1.2, theme: this.theme, mode: "editor" // default for workspace
        })) : (h("div", { class: "empty" }, "No file opened. Click ", h("b", null, "Open File"), ".")))));
    }
    static get is() { return "doc-workspace"; }
    static get originalStyleUrls() {
        return {
            "$": ["doc-workspace.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["doc-workspace.css"]
        };
    }
    static get states() {
        return {
            "files": {},
            "activeId": {},
            "theme": {}
        };
    }
}
//# sourceMappingURL=doc-workspace.js.map
