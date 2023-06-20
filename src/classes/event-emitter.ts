class EventEmitter<E extends EventEmitter.Init> extends EventTarget {
    constructor(public events: E) {
        super();
    }

    on<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void) {
        this.addEventListener(event as string, listener as (e: Event) => void);
        return this;
    }

    once<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void) {
        this.addEventListener(event as string, listener as (e: Event) => void, { once: true });
        return this;
    }

    off<T extends keyof E>(event: T, listener: (e: InstanceType<E[T]>) => void) {
        this.removeEventListener(event as string, listener as (e: Event) => void);
        return this;
    }

    emit<T extends keyof E>(event: T, ...args: ConstructorParameters<E[T]>) {
        this.dispatchEvent(new this.events[event](...args));
        return this;
    }

    static events<K extends string>(...names: K[]) {
        return names.reduce((events, name) => ({
            ...events,
            [name]: class extends Event {
                constructor() {
                    super(name);
                }
            }
        }), {} as Record<K, new () => Event>);
    }
}

declare namespace EventEmitter {
    interface Init {
        [x: string]: new (...args: any[]) => Event;
    }
}

export default EventEmitter;