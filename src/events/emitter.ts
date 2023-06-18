import type {IDisposable} from "monaco-editor";

class Emitter<E extends Record<string, new (...args: any[]) => Event>> extends EventTarget {
    constructor(public events: E) {
        super();
    }

    on<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void): IDisposable {
        this.addEventListener(event as string, listener as (e: Event) => void);
        return {
            dispose: () => {
                this.off(event, listener);
            }
        };
    }

    once<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void): IDisposable {
        this.addEventListener(event as string, listener as (e: Event) => void, {once: true});
        return {
            dispose: () => {
                this.off(event, listener);
            }
        };
    }

    off<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void) {
        this.removeEventListener(event as string, listener as (e: Event) => void);
    }

    emit<T extends keyof E>(event: T, ...args: ConstructorParameters<E[T]>) {
        this.dispatchEvent(new this.events[event](...args));
    }

    static withName<A extends any[], E extends Event>(name: string, constructor: new (name: string, ...args: A) => E) {
        // @ts-expect-error
        return class Named extends constructor {
            constructor(...args: A) {
                super(name, ...args);
            }
        };
    }
}

export default Emitter;