import { Auth } from "aws-amplify";

// #region 定数関連
type FetchRequest = {
    input: RequestInfo | URL,
    init?: RequestInit,
};

class AllowedOrigins {
    static readonly ID_TOKEN = [
        process.env.NEXT_PUBLIC_API_GATEWAY_ORIGIN,
    ];
}

class HeaderKeys {
    static readonly ID_TOKEN = 'Authorization';
}
// #endregion

/**
 * fetch()関数をオーバーライドするメソッド
 * NOTE: 全体に影響する部分のため、明示的に別クラスに分離した
 * 参考 {@link https://github.com/sola-nyan/nuxt-ofetch-configure/blob/master/src/index.ts}
 */
export default function overrideFetchFunc() {
    const originalFetchFunc = fetch
    Object.defineProperty(
        globalThis,
        'fetch',
        {
            get() {
                return function fetch(
                    input: RequestInfo | URL,
                    init?: RequestInit
                ): Promise<Response> {
                    return Promise.resolve({
                        input: input,
                        init: init,
                    })
                        .then(fetchRequest => {
                            // 認証トークン情報をmerge
                            return mergeAuthTokenToRequestAsync(fetchRequest);
                        })
                        .then(fetchRequest => {
                            // リクエストを実行
                            return originalFetchFunc(
                                fetchRequest.input,
                                fetchRequest.init
                            );
                        });
                }
            },
            set() { },
        }
    );
}

// #region Request操作関連
/**
 * 認証トークン情報をリクエストに非同期でmergeするメソッド
 * @param { FetchRequest } fetchRequest 元のリクエスト情報
 * @returns { Promise<FetchRequest> } Promise<トークン情報をmergeしたリクエスト情報>
 */
function mergeAuthTokenToRequestAsync(
    fetchRequest: FetchRequest
): Promise<FetchRequest> {
    return new Promise((resolve) => {
        if (!isAllowedOrigin(fetchRequest.input, AllowedOrigins.ID_TOKEN)) {
            // 許可されていないOriginの場合はidTokenを指定せずに渡す
            resolve(fetchRequest);
            return;
        }

        const fetchAsyncFunc = async function fetchAsync() {
            // IdTokenを取得
            const idToken = await (async () => {
                try {
                    return (await Auth.currentSession()).getIdToken().getJwtToken();
                } catch (_e) {
                    return undefined;
                }
            })();

            if (idToken == null) {
                // idTokenが取得できなかった場合 or エラー発生時はidTokenを指定せずに渡す
                resolve(fetchRequest);
                return;
            }

            // 取得できている場合はidTokenを指定して渡す
            resolve({
                input: fetchRequest.input,
                init: mergeHeaderToRequestInit(
                    fetchRequest.init,
                    { [HeaderKeys.ID_TOKEN]: idToken }
                ),
            });
        }
        fetchAsyncFunc();
    });
}
// #endregion

// #region 処理関数関連
/**
 * エンドポイントのURLが許可リストに含まれているかどうかを判定するメソッド
 * @param { RequestInfo | URL } input エンドポイント
 * @param { (string | undefined)[] } allowedList 許可されているエンドポイントのリスト
 * @returns { boolean } 許可されているかどうか
 */
function isAllowedOrigin(
    input: RequestInfo | URL,
    allowedList: (string | undefined)[],
): boolean {
    const url = (() => {
        // URLの場合はそのまま返す
        if (input instanceof URL)
            return input;

        try {
            // URLに変換
            if (input instanceof Request)
                return new URL(input.url);
            return new URL(input);
        } catch (_e) {
            // エラー発生時（有効なURLでない場合）はundefined
            return undefined;
        }
    })();

    // URLが取得できていない場合はfalse
    if (url == null)
        return false;

    // URLのoriginが許可リストに含まれているかどうかを返却
    return allowedList
        .map((value) => {
            if (value == null)
                return undefined;
            try {
                return new URL(value);
            } catch {
                return undefined;
            }
        })
        .filter((value): value is URL => value != null)
        .map((value) => value.origin)
        .includes(url.origin);
}

/**
 * RequestInitにヘッダをmergeするメソッド
 * @param { RequestInit | undefined } original merge元のRequestInit
 * @param { Record<string, string> } headerToAppend mergeしたいヘッダ情報（空の場合は何もしないので注意）
 * @returns { RequestInit | undefined } merge後のRequestInit
 */
function mergeHeaderToRequestInit(
    original: RequestInit | undefined,
    headerToAppend: Record<string, string>,
): RequestInit | undefined {
    // 追加するヘッダがない場合はそのまま返す
    if (isEmptyObject(headerToAppend))
        return original;

    // オリジナルのObjectが存在しない場合は、ヘッダだけのRequestInitを返す
    if (original == null)
        return {
            headers: headerToAppend,
        };

    // オリジナルのヘッダが存在しない場合は、ヘッダを直接指定したものを返す
    if (original.headers == null)
        return {
            ...original,
            headers: headerToAppend,
        };

    // そうでない場合は、ヘッダをmergeしたものを返す
    return {
        ...original,
        headers: {
            ...original.headers,
            ...headerToAppend,
        },
    }
}

/**
 * オブジェクトが空かどうかを判定するメソッド
 * [参考]{@link https://qiita.com/takengineer1216/items/fffe440375ea0ff2443b}
 * @param { Object } obj 判定したいオブジェクト
 * @returns { boolean } 空かどうか
 */
function isEmptyObject(
    obj: Object,
): boolean {
    return Object.keys(obj).length === 0;
}
// #endregion