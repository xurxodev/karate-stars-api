type Subscription<T> = (state: T) => void;

abstract class Bloc<T> {

    private state: T;
    private listener?: Subscription<T>;

    constructor(initalState: T) {
        this.state = initalState;
    }

    public get getState(): T {
        return this.state;
    }

    changeState(state: T) {
        this.state = state;

        if (this.listener) {
            this.listener(this.state);
        }
    }

    subscribe(listener: Subscription<T>) {
        this.listener = listener;
    }

    protected dispose() {
        //Override on derivated  vaclass dispose if 
        //you need clear subscriptions for example
    }
}

export default Bloc;