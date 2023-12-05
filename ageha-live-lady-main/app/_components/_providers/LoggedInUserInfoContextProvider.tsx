import { LoggedInUserInfo } from "@/app/_models/LoggedInUserInfo";
import { StorageRepository } from "@/app/_repositories/StorageRepository";
import { useAuthenticator } from "@aws-amplify/ui-react";
import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from "react";

// 値本体とSetterでProviderを分ける
// [参考]{@link https://zenn.dev/yuta_ura/articles/react-context-api#%E3%82%A2%E3%83%B3%E3%83%81%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3-1.-%E5%80%A4%E6%9C%AC%E4%BD%93%E3%81%A8%E5%80%A4%E3%82%92%E5%85%A5%E3%82%8C%E3%82%8B%E9%96%A2%E6%95%B0%E3%82%92-1-%E3%81%AE-context-%E3%81%AB%E5%85%A5%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B}
export const LoggedInUserInfoContext =
    createContext<LoggedInUserInfo | null>(null);
export const LoggedInUserInfoSetterContext =
    createContext<Dispatch<SetStateAction<LoggedInUserInfo | null>>>(
        (_userInfo) => undefined
    );

export default function LoggedInUserInfoContextProvider({
    children,
}: {
    children: React.ReactNode,
}): JSX.Element {
    const [sessionStorageRepository] =
        useState(StorageRepository.create("sessionStorage"));
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const [loggedInUserInfo, setLoggedInUserInfo] =
        useState<LoggedInUserInfo | null>(
            sessionStorageRepository.getLoggedInUserInfoOrNull()
        );
    const [isNowFetchingLoggedInUserInfo, setIsNowFetchingLoggedInUserInfo] =
        useState(false);

    useEffect(
        () => {
            if (authStatus === 'unauthenticated') {
                // 認証済みでない場合
                // ユーザー情報がある場合は削除
                if (loggedInUserInfo != null)
                    setLoggedInUserInfo(null);
                return;
            }

            if (authStatus === 'authenticated') {
                // 認証済みの場合
                // ユーザー情報が存在しない場合は取得
                if (loggedInUserInfo == null
                    && !isNowFetchingLoggedInUserInfo) {
                    setIsNowFetchingLoggedInUserInfo(true);
                    const fetchCurrentUserAsync = async () => {
                        const { status, data } =
                            await LoggedInUserInfo.fetchCurrentUser()
                                .catch((_error) => ({
                                    status: LoggedInUserInfo.ResponseStatusInFetching.CLIENT_ERROR.code,
                                    data: undefined,
                                }));

                        setIsNowFetchingLoggedInUserInfo(false);

                        // エラーメッセージなどは表示しない
                        if (status !== LoggedInUserInfo.ResponseStatusInFetching.OK.code)
                            return;
                        if (data == null)
                            return;

                        setLoggedInUserInfo(data);
                    };
                    fetchCurrentUserAsync();
                }

                return;
            }
        },
        [authStatus]
    );

    useEffect(
        () => {
            // ユーザー情報が更新された場合はStorageに保存
            sessionStorageRepository
                .trySetLoggedInUserInfo(loggedInUserInfo)
        },
        [loggedInUserInfo]
    );

    return (
        <LoggedInUserInfoContext.Provider
            value={
                authStatus === 'authenticated'
                    ? loggedInUserInfo
                    : null
            }>
            <LoggedInUserInfoSetterContext.Provider
                value={setLoggedInUserInfo}
            >
                {children}
            </LoggedInUserInfoSetterContext.Provider>
        </LoggedInUserInfoContext.Provider>
    );
}

// 簡易化のために拡張関数を定義
declare module "@/app/_repositories/StorageRepository" {
    interface StorageRepository {
        getLoggedInUserInfoOrNull(): LoggedInUserInfo | null;
        trySetLoggedInUserInfo(loggedInUserInfo: LoggedInUserInfo | null): void;
    }
}

StorageRepository.prototype.getLoggedInUserInfoOrNull =
    function (): LoggedInUserInfo | null {
        // JsonString形式で取得
        const loggedInUserInfoJsonStr =
            this.getOrNull(
                StorageRepository
                    .LoggedInUserInfoKeys
                    .LOGGED_IN_USER_INFO
            );

        // 保存されていなかった場合はnull
        if (loggedInUserInfoJsonStr == null)
            return null;

        // JsonStringをパースして返す
        return (() => {
            try {
                return new LoggedInUserInfo(
                    JSON.parse(loggedInUserInfoJsonStr)
                );
            } catch (_e) {
                // パース失敗時はnull
                return null;
            }
        })();
    }

StorageRepository.prototype.trySetLoggedInUserInfo =
    function (loggedInUserInfo: LoggedInUserInfo | null) {
        this.trySet(
            StorageRepository
                .LoggedInUserInfoKeys
                .LOGGED_IN_USER_INFO,
            loggedInUserInfo != null
                ? JSON.stringify(loggedInUserInfo)
                : null
        )
    }