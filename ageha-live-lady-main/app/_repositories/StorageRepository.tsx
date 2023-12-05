// NOTE: クリーンアーキテクチャ的にはInterfaceを定義する必要があるが、工数の問題で省略している
export type StorageType = "localStorage" | "sessionStorage";
export class StorageRepository {
    static create(
        storageType: StorageType
    ): StorageRepository {
        return new StorageRepository(storageType);
    }

    private constructor(
        public readonly storageType: StorageType,
    ) { }

    storageAvailable(): boolean {
        // [Storageが利用可能かどうかを検出] { @link https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#localstorage_%E3%81%AE%E6%A9%9F%E8%83%BD%E6%A4%9C%E5%87%BA }
        let storage: Storage | undefined;
        try {
            storage = window[this.storageType];
            const x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException
                && (
                    // everything except Firefox
                    e.code === 22
                    // Firefox
                    || e.code === 1014
                    // test name field too, because code might not be present
                    // everything except Firefox
                    || e.name === "QuotaExceededError"
                    // Firefox
                    || e.name === "NS_ERROR_DOM_QUOTA_REACHED"
                )
                && storage != null
                && storage.length !== 0
            );
        }
    }

    getOrNull(key: StorageRepository.Keys): string | null {
        if (!this.storageAvailable())
            return null;
        return window[this.storageType].getItem(key.key);
    }

    trySet(key: StorageRepository.Keys, value: string | null) {
        if (!this.storageAvailable())
            return;
        if (value == null) {
            // valueがnullの場合は削除
            this.tryRemove(key);
            return;
        }
        window[this.storageType].setItem(key.key, value);
    }

    tryRemove(key: StorageRepository.Keys) {
        if (!this.storageAvailable())
            return;
        window[this.storageType].removeItem(key.key);
    }
}

export namespace StorageRepository {

    export class Keys {
        protected constructor(
            public readonly key: string,
        ) { }
    }

    export class TransferRequestKeys extends Keys {
        static readonly PHONE_NUMBER =
            new TransferRequestKeys("transferRequestPhoneNumber");
        static readonly INVOICE_REGISTERED_NUMBER_WITHOUT_PREFIX =
            new TransferRequestKeys(
                "transferRequestInvoiceRegisteredNumberWithoutPrefix"
            );
    }

    export class LoggedInUserInfoKeys extends Keys {
        static readonly LOGGED_IN_USER_INFO =
            new LoggedInUserInfoKeys("loggedInUserInfo");
    }
}