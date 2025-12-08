// src/utils/history.ts
export class HistoryManager {
    past = [];
    future = [];
    clone(state) {
        return JSON.parse(JSON.stringify(state));
    }
    pushState(state) {
        this.past.push(this.clone(state));
        this.future = []; // clear redo stack
    }
    undo(current) {
        if (this.past.length === 0)
            return null;
        const prev = this.past.pop();
        this.future.push(this.clone(current));
        return prev;
    }
    redo(current) {
        if (this.future.length === 0)
            return null;
        const next = this.future.pop();
        this.past.push(this.clone(current));
        return next;
    }
}
//# sourceMappingURL=history.js.map
