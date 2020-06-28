import SocialNewsRepository from "../boundaries/SocialNewsRepository";
import { SocialNews } from "../entities/SocialNews";
import SettingsRepository from "../../settings/boundaries/SettingsRepository";

export default class GetSocialNewsUseCase {
    constructor(
        private socialNewsRepository: SocialNewsRepository,
        private settingsRepository: SettingsRepository
    ) {}

    public async execute(): Promise<SocialNews[]> {
        const settings = await this.settingsRepository.get();

        return this.socialNewsRepository.get(settings.socialNews.search);
    }
}
