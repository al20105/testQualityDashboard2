import { HttpRequest } from "../_constants/HttpRequest";

export class LoggedInUserInfo {

    static ApiUrl = class {
        static readonly FETCH_CURRENT_USER = process.env.apiBaseUrl + "/develop/users/current"
    }

    public readonly name: string;
    public readonly pointNum: number;

    constructor({
        name,
        pointNum,
    }: {
        name: string,
        pointNum: number,
    }) {
        if (pointNum == null
            || typeof pointNum !== "number")
            throw new Error("some required params are not defined.");
        this.name = name != null ? name : ""; // nameがnullの場合は空文字を設定
        this.pointNum = pointNum;
    }

    static async fetchCurrentUser(
    ): Promise<{
        status: number,
        data?: LoggedInUserInfo,
    }> {
        const response = await fetch(
            LoggedInUserInfo.ApiUrl.FETCH_CURRENT_USER,
            {
                method: HttpRequest.METHOD_TYPE.GET,
                headers: {
                    [HttpRequest.HEADER_KEY_TYPE.ACCEPT]:
                        HttpRequest.CONTENT_TYPE.JSON,
                },
                cache: "no-cache",
            }
        );

        if (!response.ok)
            return {
                status: response.status,
            };

        const data = await (async () => {
            try {
                return new LoggedInUserInfo(
                    await response.json()
                );
            } catch (_e) {
                // パース失敗時はundefined
                return undefined;
            }
        })();
        return {
            status: response.status,
            data: data,
        }
    }
}

export namespace LoggedInUserInfo {
    export class ResponseStatusInFetching {
        static OK = new ResponseStatusInFetching(200);
        static CLIENT_ERROR = new ResponseStatusInFetching(-100);

        private constructor(
            public readonly code: number,
        ) { }
    }
}