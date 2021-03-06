import { Either, EitherAsync, Id } from "karate-stars-core";
import { Entity, EntityData } from "karate-stars-core/build/entities/Entity";
import { ActionResult } from "../api/ActionResult";
import { ConflictError, ResourceNotFoundError, UnexpectedError } from "../api/Errors";
import { createIdOrResourceNotFound } from "./utils";

export type DeleteResourceError = UnexpectedError | ResourceNotFoundError | ConflictError;

export function deleteResource<TData extends EntityData, TEntity extends Entity<TData>>(
    id: string,
    getEntityById: (id: Id) => Promise<Either<ResourceNotFoundError | UnexpectedError, TEntity>>,
    deleteEntity: (id: Id) => Promise<Either<UnexpectedError, ActionResult>>,
    validateAsForeingKey?: (entity: TEntity) => Promise<Either<ConflictError, TEntity>>
) {
    return createIdOrResourceNotFound<DeleteResourceError>(id)
        .flatMap(async id => getEntityById(id))
        .flatMap(async entity => {
            if (validateAsForeingKey) {
                return validateAsForeingKey(entity);
            } else {
                return Either.right<DeleteResourceError, TEntity>(entity);
            }
        })
        .flatMap(entity => deleteEntity(entity.id))
        .run();
}

export function deleteResourceWithImage<TData extends EntityData, TEntity extends Entity<TData>>(
    id: string,
    getEntityById: (id: Id) => Promise<Either<ResourceNotFoundError | UnexpectedError, TEntity>>,
    deleteImage: (entity: TEntity) => EitherAsync<UnexpectedError, true>,
    deleteEntity: (id: Id) => Promise<Either<UnexpectedError, ActionResult>>,
    validateAsForeingKey?: (entity: TEntity) => Promise<Either<ConflictError, TEntity>>
) {
    return createIdOrResourceNotFound<DeleteResourceError>(id)
        .flatMap(async id => getEntityById(id))
        .flatMap(async entity => {
            if (validateAsForeingKey) {
                return validateAsForeingKey(entity);
            } else {
                return Either.right<DeleteResourceError, TEntity>(entity);
            }
        })
        .flatMap<Id>(async entity =>
            deleteImage(entity)
                .map(() => entity.id)
                .run()
        )
        .flatMap(id => deleteEntity(id))
        .run();
}
