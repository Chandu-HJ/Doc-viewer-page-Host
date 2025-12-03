'use strict';

var index = require('./index-BjGe-IOm.js');
var index$1 = require('./index.cjs.js');

const myComponentCss = ":host{display:block}";

const MyComponent = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
    }
    /**
     * The first name
     */
    first;
    /**
     * The middle name
     */
    middle;
    /**
     * The last name
     */
    last;
    getText() {
        return index$1.format(this.first, this.middle, this.last);
    }
    render() {
        return index.h("div", { key: 'ff454724b0810130162b6e4f8f8563f4e63d1419' }, "Hello, World! I'm ", this.getText());
    }
};
MyComponent.style = myComponentCss;

exports.my_component = MyComponent;
//# sourceMappingURL=my-component.entry.cjs.js.map
