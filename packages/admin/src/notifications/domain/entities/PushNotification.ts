export const COMPETITOR_NEWS_TOPIC = "competitornews";
export const VIDEO_NEWS_TOPIC = "videonews";
export const URL_NEWS_TOPIC = "urlnews";

export const DEBUG_COMPETITOR_NEWS_TOPIC = "debugcompetitornews";
export const DEBUG_VIDEO_NEWS_TOPIC = "debugvideonews";
export const DEBUG_URL_NEWS_TOPIC = "debugurlnews";

interface PushNotificationData {
    title: string;
    description: string;
    topic: string;
}

export abstract class PushNotification {
    public readonly title: string;
    public readonly description: string;
    public readonly topic: string;

    constructor(data: PushNotificationData) {
        this.title = data.title;
        this.description = data.description;
        this.topic = data.topic;
    }
}
