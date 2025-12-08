// src/components/doc-workspace/doc-workspace.tsx
import { h } from "@stencil/core";
export class DocWorkspace {
    scale = 1.2;
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
        return (h("div", { key: '1fe9a7de7abb1d3f694bd757ac638b709677327c', class: `workspace-container theme-${this.theme}` }, h("div", { key: 'd6a3873178e1b4f2068e3342bd45db031b06cd12', class: "workspace-toolbar" }, h("button", { key: '2f1e333c61ac0fd18f6f03fb0b306dab7a26e385', class: "open-btn", onClick: () => this.fileInput?.click() }, "\uD83D\uDCC2 Open File"), h("input", { key: 'ea9daeb88184063b7d5c2075ec59979094cacfa9', type: "file", accept: ".pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp,.txt,.md", style: { display: 'none' }, ref: (el) => (this.fileInput = el), onChange: this.onFileSelected }), h("div", { key: '5fefbf76312251ebd641af0358bc5762a0309e55', class: "toolbar-spacer" }), h("label", { key: 'd7e9206aa459270475b0c01b29cec4c0c89cdae1', class: "theme-label" }, "Theme:"), h("select", { key: '86e27cc8a67fe702a51bf9d2d595aaacb7cb50b6', class: "theme-select", onChange: (e) => {
                this.theme = e.target.value;
            } }, h("option", { key: 'b80c6cbe732d0d0602901e95d5127ace554db2c0', value: "light", selected: this.theme === 'light' }, "Light"), h("option", { key: '94b284488b10ee8ff1bac868a953877565391a16', value: "dark", selected: this.theme === 'dark' }, "Dark"), h("option", { key: '0f65f78f34bf6e5c2ff3c34367310aca0bb9934c', value: "sepia", selected: this.theme === 'sepia' }, "Sepia"))), h("div", { key: '30d0c57310f183618b069f56315493cb6de43a3c', class: "workspace-tabs" }, this.files.map((file) => (h("div", { class: {
                tab: true,
                active: file.id === this.activeId,
            }, onClick: () => (this.activeId = file.id) }, file.name, h("span", { class: "close-x", onClick: (ev) => {
                ev.stopPropagation();
                this.closeFile(file.id);
            } }, "\u2716"))))), h("div", { key: '2d6c9175ecf8e96bfc2719375337efe1bce9fda0', class: "workspace-viewer" }, activeFile ? (h("doc-viewer", { key: activeFile.id, src: activeFile.url, fileType: activeFile.fileType, scale: this.scale, theme: this.theme, mode: "editor" // default for workspace
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
    static get properties() {
        return {
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
            }
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
