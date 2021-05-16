import { CompetitorRepository } from "./Boundaries";
import { Either } from "karate-stars-core";
import { DataError } from "../../common/domain/Errors";
import { createIdOrUnexpectedError } from "../../common/domain/utils";

export default class DeleteCompetitorUseCase {
    constructor(private competitorrepository: CompetitorRepository) {}

    async execute(id: string): Promise<Either<DataError, true>> {
        const result = await createIdOrUnexpectedError(id)
            .flatMap(async id => this.competitorrepository.deleteById(id))
            .run();

        return result;
    }
}
