import {
    FormState,
    FormSectionState,
    statetoData,
    FormChildrenState,
    formChildrenStatetoData,
} from "../../../common/presentation/state/FormState";
import { Video, VideoData, Either, CompetitorData, VideoLink } from "karate-stars-core";
import { DataError } from "../../../common/domain/Errors";
import DetailBloc, { ValidationBlocError } from "../../../common/presentation/bloc/DetailBloc";
import GetVideoByIdUseCase from "../../domain/GetVideoByIdUseCase";
import SaveVideoUseCase from "../../domain/SaveVideoUseCase";
import GetCompetitorsUseCase from "../../../competitors/domain/GetCompetitorsUseCase";
import moment from "moment";
import { basicActions } from "../../../common/presentation/bloc/basicActions";

class VideoDetailBloc extends DetailBloc<VideoData> {
    constructor(
        private getVideoByIdUseCase: GetVideoByIdUseCase,
        private saveVideoUseCase: SaveVideoUseCase,
        private getCompetitorsUseCase: GetCompetitorsUseCase
    ) {
        super("Video");
    }

    protected getItem(id: string): Promise<Either<DataError, VideoData>> {
        return this.getVideoByIdUseCase.execute(id);
    }
    protected async mapItemToFormSectionsState(item?: VideoData): Promise<FormSectionState[]> {
        const competitors = (await this.getCompetitorsUseCase.execute()).fold(
            () => [],
            competitors => competitors
        );

        return initialFieldsState(competitors, item);
    }
    protected saveItem(item: VideoData): Promise<Either<DataError, true>> {
        return this.saveVideoUseCase.execute(Video.create(item).get());
    }

    protected validateFormState(state: FormState): ValidationBlocError[] | null {
        const result = Video.create(statetoData(state));
        const errors = result.fold(
            errors => errors,
            () => null
        );

        return errors;
    }

    protected validateChildrenFormState(
        field: keyof VideoData,
        state: FormChildrenState
    ): ValidationBlocError[] | null {
        if (field === "links") {
            const result = VideoLink.create(formChildrenStatetoData(state));
            const errors = result.fold(
                errors => errors,
                () => null
            );

            return errors;
        } else {
            return null;
        }
    }

    protected async mapItemToFormChildrenState(
        field: keyof VideoData,
        childrenId?: string,
        item?: VideoData
    ): Promise<FormChildrenState> {
        return initialChildrenFormState(field, childrenId, item);
    }
}

export default VideoDetailBloc;

const linkTypeOptions = [
    { id: "youtube", name: "Youtube" },
    { id: "facebook", name: "Facebook" },
];

const initialChildrenFormState = (
    field: keyof VideoData,
    childrenId?: string,
    item?: VideoData
): FormChildrenState => {
    if (field === "links") {
        debugger;
        const videoLink = item?.links.find(link => link.id === childrenId);
        return {
            title: "link",
            fields: [
                {
                    kind: "FormSingleFieldState",
                    name: "id",
                    label: "Id",
                    value: videoLink?.id,
                },
                {
                    kind: "FormSingleFieldState",
                    name: "type",
                    label: "Type",
                    selectOptions: linkTypeOptions,
                    value: videoLink?.type ?? linkTypeOptions[0].id,
                },
            ],
        };
    } else {
        throw new Error("Links is the unique children field for video");
    }
};

const initialFieldsState = (
    competitors: CompetitorData[],
    entity?: VideoData
): FormSectionState[] => {
    const competitorOptions = competitors.map(competitor => ({
        id: competitor.id,
        name: `${competitor.firstName} ${competitor.lastName}`,
    }));

    return [
        {
            fields: [
                {
                    kind: "FormSingleFieldState",
                    label: "Id",
                    name: "id",
                    value: entity?.id,
                    hide: true,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Title",
                    name: "title",
                    required: true,
                    value: entity?.title,
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Subtitle",
                    name: "subtitle",
                    required: true,
                    value: entity?.subtitle,
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Description",
                    name: "description",
                    required: true,
                    value: entity?.description,
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Order",
                    name: "order",
                    required: true,
                    value: entity?.order.toString(),
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Event Date",
                    name: "eventDate",
                    required: true,
                    type: "date",
                    value: moment(entity?.eventDate).format("YYYY-MM-DD"),
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormSingleFieldState",
                    label: "Competitors",
                    name: "competitors",
                    required: true,
                    value: entity?.competitors,
                    selectOptions: competitorOptions,
                    multiple: true,
                    md: 6,
                    xs: 12,
                },
                {
                    kind: "FormComplexFieldState",
                    listLabel: "Links",
                    formLabel: "Add link",
                    name: "links",
                    required: true,
                    md: 6,
                    xs: 12,
                    list: {
                        fields: [
                            { name: "id", text: "Id", type: "text" },
                            { name: "type", text: "Type", type: "text" },
                        ],
                        items: entity?.links || [],
                        selectedItems: [],
                        searchEnable: false,
                        actions: basicActions,
                    },
                    form: undefined,
                },
            ],
        },
    ];
};
