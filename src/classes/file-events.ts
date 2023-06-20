export class FileOpenEvent extends Event {
    constructor(public file: string) {
        super("open");
    }
}

export class FileDeleteEvent extends Event {
    constructor(public file: string) {
        super("delete");
    }
}