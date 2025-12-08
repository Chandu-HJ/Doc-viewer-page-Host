import { p as proxyCustomElement, H, h } from './p-BoFG1DUe.js';
import { d as defineCustomElement$3 } from './p-zxZMLVxm.js';
import { d as defineCustomElement$2 } from './p-CtYdsUZ7.js';

const docWorkspaceCss = ".workspace-container{display:flex;flex-direction:column;height:100%;width:100%;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif}.theme-light.workspace-container{background:linear-gradient(145deg,\r\n    #dffcf4 0%,\r\n    #eaf8ff 40%,\r\n    #f4eaff 100%\r\n  );color:#0f1b27}.theme-dark.workspace-container{background:linear-gradient(145deg,\r\n    #0a1110 0%,\r\n    #080d0c 40%,\r\n    #050908 100%\r\n  );color:#e9f7f4}.theme-sepia.workspace-container{background:linear-gradient(145deg,\r\n    #f8efd9 0%,\r\n    #f4e3c3 40%,\r\n    #e7ceaa 100%\r\n  );color:#3e2a15}.workspace-toolbar{display:flex;align-items:center;padding:10px 16px;gap:12px;background:rgba(255, 255, 255, 0.45);border-bottom:1px solid rgba(255, 255, 255, 0.35);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 8px 22px rgba(0, 0, 0, 0.10);z-index:20}.theme-dark .workspace-toolbar{background:rgba(20, 28, 26, 0.45);border-bottom-color:rgba(70, 85, 80, 0.45);box-shadow:0 8px 22px rgba(0, 0, 0, 0.30)}.theme-sepia .workspace-toolbar{background:rgba(255, 245, 230, 0.55);border-bottom-color:rgba(180, 140, 100, 0.45)}.open-btn{padding:7px 16px;border-radius:999px;border:none;background:#0d9b82;color:white;cursor:pointer;box-shadow:0 10px 24px rgba(13, 155, 130, 0.35);transition:0.15s ease}.open-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(13, 155, 130, 0.45)}.theme-dark .open-btn{background:#0d9b82;box-shadow:none}.theme-sepia .open-btn{background:#c97b43;box-shadow:0 10px 22px rgba(175, 110, 60, 0.45)}.theme-select{padding:6px 12px;border-radius:999px;background:rgba(255, 255, 255, 0.65);border:1px solid rgba(255, 255, 255, 0.45);backdrop-filter:blur(12px);cursor:pointer;font-size:13px;color:inherit}.theme-dark .theme-select{background:rgba(25, 34, 32, 0.7);border-color:rgba(100, 120, 110, 0.55);color:#def3ed}.theme-sepia .theme-select{background:rgba(255, 245, 230, 0.75);border-color:rgba(180, 140, 100, 0.55);color:#3e2a15}.workspace-tabs{display:flex;overflow-x:auto;gap:6px;padding:6px 10px;background:rgba(255, 255, 255, 0.30);border-bottom:1px solid rgba(255, 255, 255, 0.25);backdrop-filter:blur(14px)}.theme-dark .workspace-tabs{background:rgba(25, 33, 31, 0.35);border-bottom-color:rgba(80, 95, 90, 0.45)}.theme-sepia .workspace-tabs{background:rgba(255, 245, 233, 0.55);border-bottom-color:rgba(180, 140, 100, 0.45)}.tab{padding:7px 14px;border-radius:12px;cursor:pointer;background:rgba(255, 255, 255, 0.75);border:1px solid rgba(255, 255, 255, 0.45);transition:0.15s ease}.tab:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(13, 155, 130, 0.15)}.theme-dark .tab{background:rgba(25, 33, 31, 0.8);border-color:rgba(80, 100, 95, 0.4);color:#def3ed}.theme-sepia .tab{background:rgba(255, 245, 233, 0.8);border-color:rgba(180, 140, 100, 0.4)}.tab.active{background:#0d9b82;color:white;border-color:transparent;box-shadow:0 10px 22px rgba(13, 155, 130, 0.35)}.theme-sepia .tab.active{background:#c77a42}.workspace-viewer{flex:1;overflow:hidden;position:relative}.empty{padding:40px;text-align:center;opacity:0.7;font-size:18px}";

const DocWorkspace$1 = /*@__PURE__*/ proxyCustomElement(class DocWorkspace extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
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
    static get style() { return docWorkspaceCss; }
}, [768, "doc-workspace", {
        "scale": [2],
        "files": [32],
        "activeId": [32],
        "theme": [32]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["doc-workspace", "doc-page", "doc-viewer"];
    components.forEach(tagName => { switch (tagName) {
        case "doc-workspace":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, DocWorkspace$1);
            }
            break;
        case "doc-page":
            if (!customElements.get(tagName)) {
                defineCustomElement$3();
            }
            break;
        case "doc-viewer":
            if (!customElements.get(tagName)) {
                defineCustomElement$2();
            }
            break;
    } });
}
defineCustomElement$1();

const DocWorkspace = DocWorkspace$1;
const defineCustomElement = defineCustomElement$1;

export { DocWorkspace, defineCustomElement };
//# sourceMappingURL=doc-workspace.js.map

//# sourceMappingURL=doc-workspace.js.map