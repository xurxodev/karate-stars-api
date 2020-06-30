import UserMongoRepository from "./data/users/UserMongoRepository";
import GetUserByUsernameAndPasswordUseCase from "./domain/users/usecases/GetUserByUsernameAndPasswordUseCase";
import GetUserByIdUseCase from "./domain/users/usecases/GetUserByIdUseCase";
import UserController from "./api/users/UserController";
import SettingsMongoRepository from "./data/settings/SettingsMongoRepository";
import GetSettingsUseCase from "./domain/settings/usecases/GetSettingsUseCase";
import SettingsRepository from "./domain/settings/boundaries/SettingsRepository";
import GetSocialNewsUseCase from "./domain/socialnews/usecases/GetSocialNewsUseCase";
import SocialNewsTwitterRepository from "./data/socialnews/SocialNewsTwitterRepository";
import CurrentNewsRSSRepository from "./data/currentnews/CurrentNewsRSSRepository";
import GetCurrentNewsUseCase from "./domain/currentnews/usecases/GetCurrentNewsUseCase";
import SocialNewsController from "./api/socialnews/SocialNewsController";
import CurrentNewsController from "./api/currentnews/CurrentNewsController";

interface Type<T> {
    new (...args: any[]): T;
}

export type NamedToken = "";

type PrivateNamedToken = "settingsRepository";

type Token<T> = Type<T> | NamedToken | PrivateNamedToken;

class CompositionRoot {
    private dependencies = new Map<Token<any>, any>();

    private static instance: CompositionRoot;

    static getInstance(): CompositionRoot {
        if (!CompositionRoot.instance) {
            CompositionRoot.instance = new CompositionRoot();
        }

        return CompositionRoot.instance;
    }
    readonly mongoConnection: string;

    private constructor() {
        const mongoConnection = process.env.MONGO_DB_CONNECTION;

        if (!mongoConnection) {
            throw new Error("Does not exists environment variable for mongo data base connection");
        }

        this.mongoConnection = mongoConnection;

        this.initializeUser();
        this.initializeSettings();
        this.initializeSocialNews();
        this.initializeCurrentNews();
    }

    public get<T>(token: Type<T> | NamedToken): T {
        return this.dependencies.get(token);
    }

    public bind<T>(token: Type<T> | NamedToken, value: T) {
        this.dependencies.set(token, value);
    }

    private initializeUser() {
        const userRespository = new UserMongoRepository(this.mongoConnection);
        const getUserByUsernameUseCase = new GetUserByUsernameAndPasswordUseCase(userRespository);
        const getUserByIdUseCase = new GetUserByIdUseCase(userRespository);
        const userController = new UserController(getUserByUsernameUseCase, getUserByIdUseCase);

        this.bind(GetUserByIdUseCase, getUserByIdUseCase);
        this.bind(UserController, userController);
    }

    private initializeSettings() {
        const settingsRespository = new SettingsMongoRepository(this.mongoConnection);
        this.dependencies.set("settingsRepository", settingsRespository);

        const getSettingsUseCase = new GetSettingsUseCase(settingsRespository);

        this.bind(GetSettingsUseCase, getSettingsUseCase);
    }

    private initializeSocialNews() {
        const settingsRespository = this.dependencies.get(
            "settingsRepository"
        ) as SettingsRepository;
        const socialNewsRepository = new SocialNewsTwitterRepository();

        const getSocialNewsUseCase = new GetSocialNewsUseCase(
            socialNewsRepository,
            settingsRespository
        );
        const socialNewsController = new SocialNewsController(getSocialNewsUseCase);

        this.bind(SocialNewsController, socialNewsController);
    }

    private initializeCurrentNews() {
        const settingsRespository = this.dependencies.get(
            "settingsRepository"
        ) as SettingsRepository;
        const currentNewsRSSRepository = new CurrentNewsRSSRepository();

        const getCurrentNewsUseCase = new GetCurrentNewsUseCase(
            currentNewsRSSRepository,
            settingsRespository
        );
        const currentNewsController = new CurrentNewsController(getCurrentNewsUseCase);

        this.bind(CurrentNewsController, currentNewsController);
    }
}

export default CompositionRoot;