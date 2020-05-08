export abstract class Either<L, R> {
    constructor(readonly value: L | R) {
        this.value = value;
    }

    isLeft(): boolean {
        return this instanceof Left;
    };
    isRight(): boolean {
        return this instanceof Right;
    };

    map<T>(fn: (r: R) => T): Either<L, T> {
        return this.flatMap((r) => new Right<T>(fn(r)))
    }

    flatMap<T>(fn: (right: R) => Either<L, T>): Either<L, T> {
        return this.isLeft() ? new Left<L>(this.value as L) : fn(this.value as R);
    }

    fold<T>(leftFn: (left: L) => T, rightFn: (right: R) => T): T {
        return this.isLeft() ?
            leftFn(this.value as L) :
            rightFn(this.value as R)
    }

    static left<L>(left: L) {
        return new Left<L>(left);
    }

    static right<R>(right: R) {
        return new Right<R>(right);
    }
}


class Left<L> extends Either<L, never> { }

class Right<R> extends Either<never, R> { }