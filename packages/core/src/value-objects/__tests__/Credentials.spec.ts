import { Credentials } from "../Credentials";

const validEmailInput = "info@xurxodev.com";
const validPasswordInput = "39893898";
const invalidEmailInput = "xurxodev.com";

describe("Credentials", () => {
    it("should return success reponse if email and password are valid", () => {
        const result = Credentials.create({ email: validEmailInput, password: validPasswordInput });

        result.fold(
            error => fail(error),
            credentials => {
                expect(credentials.email.value).toEqual(validEmailInput);
                expect(credentials.password.value).toEqual(validPasswordInput);
            }
        );
    });
    it("should be equals two credentials with same values", () => {
        const credentials1 = Credentials.create({
            email: validEmailInput,
            password: validPasswordInput,
        }).get();
        const credentials2 = Credentials.create({
            email: validEmailInput,
            password: validPasswordInput,
        }).get();

        expect(credentials1).toEqual(credentials2);
        expect(credentials1.equals(credentials2)).toBe(true);
    });
    it("should return Email cannot be blan error if email is empty", () => {
        const result = Credentials.create({ email: "", password: validPasswordInput });

        result.fold(
            errors => {
                expect(errors.find(error => error.property === "email").errors[0]).toBe(
                    "field_cannot_be_blank"
                );
            },
            () => fail("should be fail")
        );
    });

    it("should return Email cannot be blan error if email is empty", () => {
        const result = Credentials.create({ email: validEmailInput, password: "" });

        result.fold(
            errors => {
                expect(errors.find(error => error.property === "password").errors[0]).toBe(
                    "field_cannot_be_blank"
                );
            },
            () => fail("should be fail")
        );
    });

    it("should return Invalid email error if email is invalid", () => {
        const result = Credentials.create({
            email: invalidEmailInput,
            password: validPasswordInput,
        });

        result.fold(
            errors => {
                expect(errors.find(error => error.property === "email").errors[0]).toBe(
                    "invalid_field"
                );
            },
            () => fail("should be fail")
        );
    });
});
