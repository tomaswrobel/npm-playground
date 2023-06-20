import EventEmitter from "./event-emitter";

export default {
    create<T extends keyof HTMLElementTagNameMap, E extends EventEmitter.Init = {}, P = {}>({
        tag, 
        events = {} as E, 
        props = {} as P
    }: {tag: T; events?: E; props?: P}) {
        abstract class Component extends EventEmitter<E> {
            element = document.createElement(tag);

            constructor() {
                super(events);
                Object.assign(this, props);
                this.init();
                document.body.appendChild(this.element);
            }

            abstract init(): void;
        }

        return Component as unknown as new () => Component & P;
    }
};