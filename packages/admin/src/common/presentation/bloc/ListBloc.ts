import Bloc from "./Bloc";
import { IdentifiableObject, ListLoadedState, ListState } from "../state/ListState";
import { DataError } from "../../domain/Errors";

abstract class ListBloc<S extends IdentifiableObject> extends Bloc<ListState<S>> {
    items: S[] = [];

    constructor() {
        super({
            kind: "ListLoadingState",
        });
    }

    async search(search: string) {
        const currentstate = this.state as ListLoadedState<S>;

        const newItems = this.items.filter(item =>
            currentstate.fields.some(field => (item[field.name] as any).includes(search))
        );

        const state = {
            ...currentstate,
            items: newItems,
        };

        super.changeState(state);
    }

    selectChange(id: string) {
        if (this.state.kind === "ListLoadedState") {
            const exists = this.state.selectedItems.includes(id);

            const selectedItems = exists
                ? this.state.selectedItems.filter(selectedId => selectedId !== id)
                : [...this.state.selectedItems, id];

            this.changeState({ ...this.state, selectedItems: selectedItems });
        }
    }

    selectAllChange(value: boolean) {
        if (this.state.kind === "ListLoadedState") {
            const selectedItems = value ? [...this.state.items.map(item => item.id)] : [];

            this.changeState({ ...this.state, selectedItems });
        }
    }

    protected changeState(state: ListState<S>) {
        super.changeState(state);

        this.items.splice(0, this.items.length);

        if (state.kind === "ListLoadedState") {
            this.items.push(...state.items);
        }
    }

    protected handleError(error: DataError): ListState<S> {
        switch (error.kind) {
            case "Unauthorized": {
                return {
                    kind: "ListErrorState",
                    message: "Invalid credentials",
                };
            }
            case "ApiError": {
                return {
                    kind: "ListErrorState",
                    message: "Sorry, an error has ocurred in the server. Please try later again",
                };
            }
            case "UnexpectedError": {
                return {
                    kind: "ListErrorState",
                    message: "Sorry, an error has ocurred. Please try later again",
                };
            }
        }
    }
}

export default ListBloc;
