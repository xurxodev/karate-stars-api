import "@testing-library/jest-dom/extend-expect";
import { EntityData } from "karate-stars-core";
import { Method } from "./mockServerTest";
import { render, tl, screen, renderDetailPageToEdit } from "./testing_library/custom";
import * as mockServerTest from "./mockServerTest";
import { givenAValidAuthenticatedUser } from "./scenarios/UserTestScenarios";
import { DependenciesCreator, givenADependencies } from "./scenarios/GenericScenarios";

interface DataDetailCreator<TData extends EntityData> {
    givenAItem: () => TData;
}

export const commonDetailPageTests = <TData extends EntityData>(
    endpoint: string,
    dataCreator: DataDetailCreator<TData>,
    typeValidForm: () => void,
    component: React.ReactElement,
    dependenciesCreators?: DependenciesCreator<any>[]
) => {
    const apiEndpoint = `/api/v1/${endpoint}`;

    beforeEach(() => {
        givenAValidAuthenticatedUser();

        if (dependenciesCreators) givenADependencies(dependenciesCreators);
    });

    describe(`${endpoint} detail page`, () => {
        describe("to create", () => {
            describe("accept button", () => {
                it("should be disabled the first time", async () => {
                    await renderComponentToCreate();

                    expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled();
                });
                it("should be enabled after type required fields", async () => {
                    await renderComponentToCreate();

                    typeValidForm();

                    expect(screen.getByRole("button", { name: "Accept" })).toBeEnabled();
                });
            });
            describe("After submit", () => {
                it("should show invalid crentials message if the server response is unauthorized", async () => {
                    givenAErrorServerResponse("get", `${apiEndpoint}/:id`, 401);
                    await renderComponentToCreate();
                    typeValidForm();
                    tl.clickOnAccept();
                    await tl.verifyTextExistsAsync("Invalid credentials");
                });
                it("should show generic error if the server response is error", async () => {
                    givenAErrorServerResponse("get", `${apiEndpoint}/:id`, 404);
                    givenAErrorServerResponse("post", apiEndpoint, 500);
                    await renderComponentToCreate();
                    typeValidForm();
                    tl.clickOnAccept();
                    await tl.verifyTextExistsAsync(
                        "Sorry, an error has ocurred in the server. Please try later again"
                    );
                });
                it("should show success if the server response is success", async () => {
                    givenAErrorServerResponse("get", `${apiEndpoint}/:id`, 404);
                    givenASuccessServerResponse();
                    await renderComponentToCreate();
                    typeValidForm();
                    tl.clickOnAccept();
                    await tl.verifyAlertAsync("saved!", false);
                });
            });
        });
        describe("to edit", () => {
            let item: TData;

            beforeEach(() => (item = givenAItem()));

            describe("Accept button", () => {
                it("should be disabled the first time", async () => {
                    await renderComponentToEdit(item.id);

                    expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled();
                });
                it("should be enabled after type required field", async () => {
                    await renderComponentToEdit(item.id);

                    typeValidForm();

                    expect(screen.getByRole("button", { name: "Accept" })).toBeEnabled();
                });
            });
            describe("After submit", () => {
                it("should show invalid crentials message if the server response is unauthorized", async () => {
                    await renderComponentToEdit(item.id);
                    typeValidForm();
                    givenAErrorServerResponse("get", `${apiEndpoint}/:id`, 401);
                    tl.clickOnAccept();
                    await tl.verifyTextExistsAsync("Invalid credentials");
                });
                it("should show generic error if the server response is error", async () => {
                    await renderComponentToEdit(item.id);

                    typeValidForm();

                    givenAErrorServerResponse("put", `${apiEndpoint}/${item.id}`, 500);
                    tl.clickOnAccept();
                    await tl.verifyTextExistsAsync(
                        "Sorry, an error has ocurred in the server. Please try later again"
                    );
                });
                it("should show success if the server response is success", async () => {
                    await renderComponentToEdit(item.id);
                    typeValidForm();

                    givenASuccessServerResponse("put", `${apiEndpoint}/${item.id}`);
                    tl.clickOnAccept();
                    await tl.verifyAlertAsync("saved!", false);
                });
            });
        });
    });

    async function renderComponentToCreate() {
        render(component);

        await screen.findByRole("button", { name: "Accept" });
    }

    async function renderComponentToEdit(id: string) {
        renderDetailPageToEdit(endpoint, id, component);

        await screen.findByRole("button", { name: "Accept" });
    }

    function givenAErrorServerResponse(method: Method, endpoint: string, httpStatusCode: number) {
        mockServerTest.addRequestHandlers([
            {
                method,
                endpoint,
                httpStatusCode: httpStatusCode,
                response: {
                    statusCode: httpStatusCode,
                    error: "error",
                    message: "error message",
                },
            },
        ]);
    }

    function givenASuccessServerResponse(
        method: Method = "post",
        endpoint = apiEndpoint,
        httpStatusCode = 200
    ) {
        mockServerTest.addRequestHandlers([
            {
                method: method,
                endpoint,
                httpStatusCode: httpStatusCode,
                response: {
                    ok: true,
                    count: 1,
                },
            },
        ]);
    }

    function givenAItem(): TData {
        const item = dataCreator.givenAItem();

        mockServerTest.addRequestHandlers([
            {
                method: "get",
                endpoint: `${apiEndpoint}/${item.id}`,
                httpStatusCode: 200,
                response: item,
            },
        ]);

        return item;
    }
};

// just to avoid warning, that no tests in test file
describe("Common tests for CRUD routes", () => {
    test("should be used per implementation", () => {});
});
