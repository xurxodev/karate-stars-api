import { ListField } from "../../../common/presentation/state/ListState";
import { NewsFeedData } from "karate-stars-core";
import GetNewsFeedsUseCase from "../../domain/GetNewsFeedsUseCase";
import ListBloc, { defaultPagination } from "../../../common/presentation/bloc/ListBloc";
import { DetailPageConfig, pages } from "../../../common/presentation/PageRoutes";
import DeleteNewsFeedsUseCase from "../../domain/DeleteNewsFeedsUseCase";

class NewsFeedListBloc extends ListBloc<NewsFeedData> {
    constructor(
        private getNewsFeedsUseCase: GetNewsFeedsUseCase,
        private deleteNewsFeedsUseCase: DeleteNewsFeedsUseCase
    ) {
        super(pages.newsFeedDetail as DetailPageConfig);

        this.loadData();
    }

    async confirmDelete() {
        if (this.state.kind === "ListLoadedState" && this.state.itemsToDelete) {
            const response = await this.deleteNewsFeedsUseCase.execute(this.state.itemsToDelete[0]);

            response.fold(
                async error => this.changeState({ ...this.handleError(error) }),
                () => this.loadData()
            );
        }
    }

    private async loadData() {
        const response = await this.getNewsFeedsUseCase.execute();

        response.fold(
            error => this.changeState(this.handleError(error)),
            feeds =>
                this.changeState({
                    kind: "ListLoadedState",
                    items: feeds,
                    fields: fields,
                    selectedItems: [],
                    pagination: { ...defaultPagination, total: feeds.length },
                    sorting: { field: "name", order: "asc" },
                    actions: this.actions,
                })
        );
    }
}

export default NewsFeedListBloc;

const fields: ListField<NewsFeedData>[] = [
    { name: "id", text: "Id", type: "text" },
    {
        name: "image",
        text: "Image",
        type: "avatar",
        alt: "name",
        sortable: false,
        searchable: false,
    },
    { name: "name", text: "Name", type: "text" },
    { name: "language", text: "Language", type: "text" },
    { name: "type", text: "Type", type: "text" },
    {
        name: "url",
        text: "Url",
        type: "url",
    },
];
