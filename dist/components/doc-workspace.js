import { p as proxyCustomElement, H, h } from './p-BoFG1DUe.js';
import { d as defineCustomElement$3 } from './p-zxZMLVxm.js';
import { d as defineCustomElement$2 } from './p-738nk2jD.js';

const docWorkspaceCss = ".workspace-container{display:flex;flex-direction:column;height:100%;width:100%;font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;background:radial-gradient(circle at top left, #070b19 0%, #050817 40%, #02020a 100%);color:#f5f7ff}.theme-light.workspace-container{background:radial-gradient(circle at top left, #e7f0ff 0%, #f7faff 40%, #dfe8ff 100%);color:#0d1020}.theme-dark.workspace-container{background:radial-gradient(circle at top left, #060814 0%, #050811 40%, #020207 100%);color:#f5f7ff}.theme-sepia.workspace-container{background:radial-gradient(circle at top left, #f8efd9 0%, #f3e0c0 40%, #e3c79c 100%);color:#3d2712}.workspace-toolbar{display:flex;align-items:center;padding:10px 16px;gap:12px;border-bottom:1px solid rgba(255, 255, 255, 0.18);background:linear-gradient(120deg,\r\n    rgba(255, 255, 255, 0.18),\r\n    rgba(255, 255, 255, 0.04));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 10px 26px rgba(0, 0, 0, 0.28);z-index:20}.theme-dark .workspace-toolbar{background:linear-gradient(120deg,\r\n    rgba(16, 22, 50, 0.9),\r\n    rgba(9, 13, 32, 0.93));border-bottom-color:rgba(80, 90, 160, 0.7)}.theme-sepia .workspace-toolbar{background:linear-gradient(120deg,\r\n    rgba(255, 248, 232, 0.96),\r\n    rgba(248, 232, 205, 0.96));border-bottom-color:rgba(190, 150, 110, 0.75)}.open-btn{background:radial-gradient(circle at top left, #4c8dff, #7d5cff);color:white;padding:7px 16px;border-radius:999px;border:none;cursor:pointer;font-weight:600;box-shadow:0 12px 24px rgba(60, 100, 230, 0.7),\r\n    0 0 16px rgba(110, 145, 255, 0.9);transition:transform 0.12s ease, box-shadow 0.18s ease}.open-btn:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(60, 100, 230, 0.85),\r\n    0 0 20px rgba(130, 160, 255, 0.95)}.toolbar-spacer{flex:1}.theme-label{font-weight:500;font-size:13px;opacity:0.85}.theme-select{padding:6px 12px;border-radius:999px;border:1px solid rgba(220, 225, 250, 0.9);background:rgba(255, 255, 255, 0.9);cursor:pointer;font-size:13px;box-shadow:0 8px 18px rgba(40, 60, 140, 0.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}.theme-dark .theme-select{background:rgba(18, 24, 48, 0.96);border-color:rgba(110, 130, 210, 0.9);color:#f3f4ff}.theme-sepia .theme-select{background:rgba(255, 248, 234, 0.96);border-color:rgba(190, 150, 110, 0.9);color:#3c2916}.workspace-tabs{display:flex;border-bottom:1px solid rgba(255, 255, 255, 0.18);background:linear-gradient(90deg,\r\n    rgba(255, 255, 255, 0.08),\r\n    rgba(255, 255, 255, 0.02));overflow-x:auto;padding:4px 8px;gap:6px}.theme-dark .workspace-tabs{background:linear-gradient(90deg,\r\n    rgba(15, 22, 52, 0.9),\r\n    rgba(10, 14, 32, 0.95));border-bottom-color:rgba(80, 90, 160, 0.7)}.theme-sepia .workspace-tabs{background:linear-gradient(90deg,\r\n    rgba(255, 248, 235, 0.96),\r\n    rgba(246, 233, 210, 0.96));border-bottom-color:rgba(190, 150, 110, 0.75)}.tab{padding:7px 14px;cursor:pointer;position:relative;border-radius:10px;border:1px solid transparent;font-size:13px;white-space:nowrap;background:rgba(255, 255, 255, 0.82);box-shadow:0 8px 16px rgba(40, 60, 140, 0.22);transition:transform 0.12s ease, box-shadow 0.18s ease, background 0.16s ease,\r\n    border-color 0.16s ease}.theme-dark .tab{background:rgba(15, 20, 50, 0.98);box-shadow:0 10px 22px rgba(0, 0, 0, 0.75)}.theme-sepia .tab{background:rgba(255, 248, 234, 0.96);box-shadow:0 8px 18px rgba(170, 130, 90, 0.35)}.tab:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(40, 60, 140, 0.28)}.theme-dark .tab:hover{box-shadow:0 12px 26px rgba(0, 0, 0, 0.85)}.tab.active{background:radial-gradient(circle at top left, #4c8dff, #7d5cff);color:white;border-color:rgba(255, 255, 255, 0.9);box-shadow:0 14px 30px rgba(60, 100, 230, 0.9),\r\n    0 0 18px rgba(120, 160, 255, 0.95)}.theme-sepia .tab.active{background:radial-gradient(circle at top left, #ffb36a, #ff7c52)}.close-x{margin-left:8px;cursor:pointer;font-size:12px;opacity:0.8;transition:transform 0.12s ease, color 0.16s ease, opacity 0.12s ease}.close-x:hover{color:#ff3b3b;transform:scale(1.1);opacity:1}.workspace-viewer{flex:1;overflow:hidden;position:relative}.empty{padding:40px;text-align:center;opacity:0.7;font-size:18px}";

const DocWorkspace$1 = /*@__PURE__*/ proxyCustomElement(class DocWorkspace extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
    }
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
    static get style() { return docWorkspaceCss; }
}, [768, "doc-workspace", {
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