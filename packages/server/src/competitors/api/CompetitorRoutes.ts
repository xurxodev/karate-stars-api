import * as hapi from "@hapi/hapi";

import * as CompositionRoot from "../../CompositionRoot";
import { appDIKeys } from "../../CompositionRoot";
import { JwtAuthenticator } from "../../server";
import { CompetitorController } from "./CompetitorController";

export const CompetitorsEndpoint = "competitors";

export default function (apiPrefix: string): hapi.ServerRoute[] {
    const jwtAuthenticator = CompositionRoot.di.get<JwtAuthenticator>(appDIKeys.jwtAuthenticator);

    return [
        {
            method: "GET",
            path: `${apiPrefix}/${CompetitorsEndpoint}`,
            options: { auth: jwtAuthenticator.name },
            handler: (
                request: hapi.Request,
                h: hapi.ResponseToolkit
            ): hapi.Lifecycle.ReturnValue => {
                return CompositionRoot.di.get(CompetitorController).getAll(request, h);
            },
        },
        {
            method: "GET",
            path: `${apiPrefix}/${CompetitorsEndpoint}/{id}`,
            options: { auth: jwtAuthenticator.name },
            handler: (
                request: hapi.Request,
                h: hapi.ResponseToolkit
            ): hapi.Lifecycle.ReturnValue => {
                return CompositionRoot.di.get(CompetitorController).get(request, h);
            },
        },
        {
            method: "POST",
            path: `${apiPrefix}/${CompetitorsEndpoint}`,
            options: { auth: jwtAuthenticator.name },
            handler: (
                request: hapi.Request,
                h: hapi.ResponseToolkit
            ): hapi.Lifecycle.ReturnValue => {
                return CompositionRoot.di.get(CompetitorController).post(request, h);
            },
        },
        {
            method: "PUT",
            path: `${apiPrefix}/${CompetitorsEndpoint}/{id}`,
            options: { auth: jwtAuthenticator.name },
            handler: (
                request: hapi.Request,
                h: hapi.ResponseToolkit
            ): hapi.Lifecycle.ReturnValue => {
                return CompositionRoot.di.get(CompetitorController).put(request, h);
            },
        },
        {
            method: "DELETE",
            path: `${apiPrefix}/${CompetitorsEndpoint}/{id}`,
            options: { auth: jwtAuthenticator.name },
            handler: (
                request: hapi.Request,
                h: hapi.ResponseToolkit
            ): hapi.Lifecycle.ReturnValue => {
                return CompositionRoot.di.get(CompetitorController).delete(request, h);
            },
        },
    ];
}
