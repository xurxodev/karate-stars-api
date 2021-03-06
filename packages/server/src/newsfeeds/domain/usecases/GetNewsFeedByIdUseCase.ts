import { Either, NewsFeedData } from "karate-stars-core";
import { ResourceNotFoundError, UnexpectedError } from "../../../common/api/Errors";
import { AdminUseCase, AdminUseCaseArgs } from "../../../common/domain/AdminUseCase";
import { createIdOrResourceNotFound } from "../../../common/domain/utils";
import UserRepository from "../../../users/domain/boundaries/UserRepository";
import NewsFeedsRepository from "../boundaries/NewsFeedRepository";

export interface GetNewsFeedByIdArg extends AdminUseCaseArgs {
    id: string;
}

type GetNewsFeedByIdUError = ResourceNotFoundError | UnexpectedError;

export class GetNewsFeedByIdUseCase extends AdminUseCase<
    GetNewsFeedByIdArg,
    GetNewsFeedByIdUError,
    NewsFeedData
> {
    constructor(private newsFeedsRepository: NewsFeedsRepository, userRepository: UserRepository) {
        super(userRepository);
    }

    public async run({
        id,
    }: GetNewsFeedByIdArg): Promise<Either<GetNewsFeedByIdUError, NewsFeedData>> {
        const result = await createIdOrResourceNotFound<GetNewsFeedByIdUError>(id)
            .flatMap(id => this.newsFeedsRepository.getById(id))
            .map(newsFeed => newsFeed.toData())
            .run();

        return result;
    }
}
