import React from "react";
import "@testing-library/jest-dom/extend-expect";

import {
    render,
    tl,
    screen,
    renderDetailPageToEdit,
} from "../../../../common/testing/testing_library/custom";
import EventDetailPage from "../EventDetailPage";
import { EventData } from "karate-stars-core";
import { commonDetailPageTests } from "../../../../common/testing/commonDetailPageTests.spec";
import * as mockServerTest from "../../../../common/testing/mockServerTest";
import { givenAValidAuthenticatedUser } from "../../../../common/testing/scenarios/UserTestScenarios";
import data from "./data.json";
import { givenADependencies } from "../../../../common/testing/scenarios/GenericScenarios";

const dataCreator = {
    givenAItem: (): EventData => {
        return data.events[0];
    },
};

const dependenciesCreators = [
    {
        endpoint: "event-types",
        items: () => data.eventTypes,
    },
];

function typeValidForm() {
    tl.typeByLabelText("Name (*)", "Example Example");
    tl.typeByLabelText("Year (*)", "2010");
    tl.selectOption("Type (*)", data.eventTypes[1].id);
}

const component = <EventDetailPage />;
const endpoint = "events";
const apiEndpoint = `/api/v1/${endpoint}`;

commonDetailPageTests(endpoint, dataCreator, typeValidForm, component, dependenciesCreators);

describe(`${endpoint} detail page`, () => {
    beforeEach(() => {
        givenAValidAuthenticatedUser();
        givenADependencies(dependenciesCreators);
    });

    describe("to create", () => {
        describe("validation messages", () => {
            it("should be visible with text name is required if name has value and then is clear it", async () => {
                await renderComponentToCreate();

                tl.typeAndClear("Name (*)", "example");

                tl.verifyTextExists("Name cannot be blank");
            });
        });
    });
    describe("to edit", () => {
        let item: EventData;

        beforeEach(() => (item = givenAItem()));

        describe("initial values should be the expected values", () => {
            it("should have he expected values to load", async () => {
                await renderComponentToEdit(item.id);

                tl.verifyValueInField("Name (*)", item.name);
                tl.verifyValueInField("Type (*)", item.typeId);
            });
        });
        describe("validation messages", () => {
            it("should be visible with text name is required if name has value and then is clear it", async () => {
                await renderComponentToEdit(item.id);

                await tl.verifyValueInFieldAsync("Name (*)", item.name);
                tl.clear("Name (*)");
                tl.verifyTextExists("Name cannot be blank");
            });
            it("should any validation text visible if type valid all mandatory fields", async () => {
                await renderComponentToEdit(item.id);

                await tl.verifyValueInFieldAsync("Name (*)", item.name);
                typeValidForm();
                tl.verifyTextNotExists("Name cannot be blank");
            });
        });
    });
});

function givenAItem(): EventData {
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

async function renderComponentToCreate() {
    render(component);

    await screen.findByRole("button", { name: "Accept" });
}

async function renderComponentToEdit(id: string) {
    renderDetailPageToEdit(endpoint, id, component);

    await screen.findByRole("button", { name: "Accept" });
}
