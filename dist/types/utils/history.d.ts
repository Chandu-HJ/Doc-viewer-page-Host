export declare class HistoryManager<T> {
    private past;
    private future;
    private clone;
    pushState(state: T): void;
    undo(current: T): T | null;
    redo(current: T): T | null;
}
