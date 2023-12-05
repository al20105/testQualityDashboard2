'use client'

import { Button, CircularProgress, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import intlTelInput from "intl-tel-input";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import 'intl-tel-input/build/css/intlTelInput.css';
import { CurrencyYenIcon } from "@heroicons/react/24/outline";
import { set } from "react-hook-form";
import { StorageRepository } from "@/app/_repositories/StorageRepository";
import { LoggedInUserInfoContext, LoggedInUserInfoSetterContext } from "@/app/_components/_providers/LoggedInUserInfoContextProvider";
import { convertCamelToSnake } from "@/app/_utils/ConvertStringCaseUtil";

// FIXME: intl-tel-inputライブラリとバージョンをあわせる必要があるので、二重管理しないで済むようにしたい
const UTILS_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js";

// #region モデル関連 FIXME: 他のファイルに移動する
type ReviewStatusType = "accepted" | "rejected" | "reviewing";
type PostTransferRequestBody = {
    phoneNumber: string,
    requestPointNum: number,
    // invoiceRegisteredNumber?: string,
};

class TransferRequestInfo {
    public readonly requestPointNum?: number;
    public readonly status?: ReviewStatusType;

    static toObjectFromJson({
        transfer_request_info,
    }: {
        transfer_request_info?: {
            request_point_num?: number,
            status?: ReviewStatusType,
        },
    }): TransferRequestInfo | undefined {
        if (transfer_request_info == null)
            return undefined;

        return new TransferRequestInfo({
            requestPointNum: transfer_request_info.request_point_num,
            status: transfer_request_info.status,
        });
    }

    private constructor({
        requestPointNum,
        status,
    }: {
        requestPointNum?: number,
        status?: ReviewStatusType,
    }) {
        this.requestPointNum = requestPointNum;
        this.status = status;
    }
}

class UserPointNumInfo {
    public readonly pointNum: number;

    static toObjectFromJson({
        user,
    }: {
        user?: {
            point_num: number,
        },
    }): UserPointNumInfo | undefined {
        if (user == null)
            return undefined;

        return new UserPointNumInfo({
            pointNum: user.point_num,
        });
    }

    private constructor({
        pointNum
    }: {
        pointNum: number,
    }) {
        this.pointNum = pointNum;
    }
}
// #endregion

// #region 定数関連 FIXME: 他のファイルに移動する
class HttpRequest {
    static readonly METHOD_TYPE = {
        GET: "GET",
        POST: "POST",
        PATCH: "PATCH",
        DELETE: "DELETE",
    };
    static readonly HEADER_KEY_TYPE = {
        ACCEPT: "Accept",
        CONTENT_TYPE: "Content-Type",
    };
    static readonly CONTENT_TYPE = {
        JSON: "application/json; charset=utf-8",
        MULTIPART: "multipart/form-data; charset=utf-8",
    };
    static readonly FORM_DATA_VALUE_NULL = "null";
}

class ResponseStatusInFetching {
    static OK = new ResponseStatusInFetching(200, "通信成功");
    static FORBIDDEN = new ResponseStatusInFetching(403, "他のユーザーの情報は取得できません");
    static NOT_FOUND = new ResponseStatusInFetching(404, "取得しようとしたユーザーが見つかりません");
    static OTHERS = new ResponseStatusInFetching(-1, "通信エラー");
    static CLIENT_ERROR = new ResponseStatusInFetching(-100, "取得処理に失敗しました");

    static values = [
        this.OK,
        this.FORBIDDEN,
        this.NOT_FOUND,
        this.OTHERS,
        this.CLIENT_ERROR,
    ];
    static valueOf(code: number): ResponseStatusInFetching {
        return this.values.find((value) => value.code === code) ?? this.OTHERS;
    }

    private constructor(
        public readonly code: number,
        public readonly message: string,
    ) { }
}

class ResponseStatusInPosting {
    static OK = new ResponseStatusInPosting(200, "通信成功");
    static BAD_REQUEST = new ResponseStatusInPosting(400, "必要な情報が不足しています");
    static FORBIDDEN = new ResponseStatusInPosting(403, "他のユーザーの申請はできません");
    static NOT_FOUND = new ResponseStatusInPosting(404, "申請しようとしたユーザーが見つかりません");
    static CONFLICT = new ResponseStatusInPosting(409, `申請に失敗しました\n\n以下の原因が考えられます\n・既に申請している\n・PTが不足している\n・申請したPT数が最低金額を下回っている、最高金額を超えている`);
    static INTERNAL_SERVER_ERROR = new ResponseStatusInPosting(500, "サーバーでエラーが発生しました");
    static OTHERS = new ResponseStatusInPosting(-1, "通信エラー");
    static CLIENT_ERROR = new ResponseStatusInPosting(-100, "申請処理に失敗しました")
    static CONTAINED_INVALID_ITEM = new ResponseStatusInPosting(-200, "入力に不備があります");

    static values = [
        this.OK,
        this.BAD_REQUEST,
        this.FORBIDDEN,
        this.NOT_FOUND,
        this.CONFLICT,
        this.INTERNAL_SERVER_ERROR,
        this.OTHERS,
        this.CLIENT_ERROR,
        this.CONTAINED_INVALID_ITEM,
    ];
    static valueOf(code: number): ResponseStatusInPosting {
        return this.values.find((value) => value.code === code) ?? this.OTHERS;
    }

    private constructor(
        public readonly code: number,
        public readonly message: string,
    ) { }
}

class Constants {
    static ReviewingTransferRequestLabel = class {
        static Strings = class {
            static readonly LABEL = `ただいま審査中です\nもう少々お待ち下さい`;
        }
    }

    static PhoneNumber = class {
        static Strings = class {
            static readonly ELEM_ID = "phoneNumber";
            static readonly LABEL = "電話番号"
            static readonly ERROR_MESSAGE = "入力に不備があるようです";
        }
    }

    static RequestPointNum = class {
        static readonly MIN_REQUEST_POINT_NUM = 3_000;
        static readonly MIN_REQUEST_POINT_NUM_INPUT = 0;
        static readonly MAX_REQUEST_POINT_NUM = 500_000;

        static Strings = class {
            static readonly ELEM_ID = "requestPointNum";
            static readonly LABEL = "交換するPT数";
            static readonly END_CONTENT_STRING = "pt";

            private static getPointRangeStr(): string {
                return `${Constants.RequestPointNum.MIN_REQUEST_POINT_NUM.toLocaleString("ja-JP")}pt 〜 ${Constants.RequestPointNum.MAX_REQUEST_POINT_NUM.toLocaleString("ja-JP")}pt`;
            }
            static getPlaceholderStr(): string {
                return this.getPointRangeStr();
            }
            static getErrorMessage(): string {
                return `${this.getPointRangeStr()}かつ保有PT数以下の値を入力してください`
            }
        }
    }

    static InvoiceRegisteredNumber = class {
        static readonly FORMAT_WITHOUT_PREFIX = "^[0-9]{13}$";

        static Strings = class {
            static readonly ELEM_ID = "invoiceRegisteredNumber";
            static readonly LABEL = "適格請求書発行事業者登録番号（インボイス）";
            static readonly PREFIX = "T";
            static readonly START_CONTENT_STRING = this.PREFIX;
            static readonly PLACEHOLDER = "1234567890123";
            static readonly ERROR_MESSAGE = "13桁の数字を入力してください（登録番号をお持ちでない場合は空の状態にしてください）";
        }
    }

    static SendButton = class {
        static Strings = class {
            static readonly LABEL = "換金する";
        }
    }

    static ProgressModalInPosting = class {
        static Strings = class {
            static readonly LABEL = "通信中...";
        }
    }

    static ErrorModalInPosting = class {
        static Strings = class {
            static readonly TITLE = "通信エラー";
            static readonly POSITIVE_BUTTON_LABEL = "OK";
        }
    }

    static SucceededModalInPosting = class {
        static Strings = class {
            static readonly TITLE_STATUS_REVIEWING = "申請しました！";
            private static readonly MESSAGE_STATUS_REVIEWING = `以下の内容で申請しました\n審査完了まで少々お待ち下さい\n\n申請PT：`;
            static readonly TITLE_STATUS_ACCEPTED = "換金しました！";
            private static readonly MESSAGE_STATUS_ACCEPTED = `以下の内容で換金しました\n※反映まで少し時間がかかる可能性があります\n\n申請PT：`;
            static readonly POSITIVE_BUTTON_LABEL = "OK";

            static getMessage(
                transferRequestInfo?: TransferRequestInfo
            ): string {
                const requestPointNumLabel = transferRequestInfo?.requestPointNum != null
                    ? `${transferRequestInfo.requestPointNum.toLocaleString("ja-JP")}pt`
                    : "取得に失敗しました";
                return transferRequestInfo?.status === "accepted"
                    ? `${this.MESSAGE_STATUS_ACCEPTED}${requestPointNumLabel}`
                    : `${this.MESSAGE_STATUS_REVIEWING}${requestPointNumLabel}`;
            }
        }
    }

    static ConfirmSavingLocalStorageModal = class {
        static Strings = class {
            static readonly TITLE = "入力した情報を保存しますか？";
            static readonly MESSAGE = "保存しておくと次回からの入力がラクになります😎\n\n※共用の端末などをお使いの際は、保存しないでください";
            static readonly POSITIVE_BUTTON_LABEL = "保存する";
            static readonly NEGATIVE_BUTTON_LABEL = "いいえ";
        }
    }
}

class ApiUrl {
    private static readonly API_URL_FETCH_TRANSFER_REQUEST_INFO = ""; // TODO: 本番用に設定する
    private static readonly API_URL_POST_TRANSFER_REQUEST_INFO = ""; // TODO: 本番用に設定する

    static getFetchTransferRequestInfoUrl() {
        return this.API_URL_FETCH_TRANSFER_REQUEST_INFO;
    }

    static getPostTransferRequestInfoUrl() {
        return this.API_URL_POST_TRANSFER_REQUEST_INFO;
    }
}
// #endregion

// 簡易化のために拡張関数を定義 FIXME: 他のクラスからも参照できてしまうので要修正
declare module "@/app/_repositories/StorageRepository" {
    interface StorageRepository {
        getPhoneNumberOrNull(): string | null
        getInvoiceRegisteredNumWithoutPrefixOrNull(): string | null
        trySetPhoneNumber(value: string): void
        trySetInvoiceRegisteredNumWithoutPrefix(value: string): void
    }
}
StorageRepository.prototype.getPhoneNumberOrNull =
    function (): string | null {
        return this.getOrNull(
            StorageRepository.TransferRequestKeys.PHONE_NUMBER
        );
    };
StorageRepository.prototype.getInvoiceRegisteredNumWithoutPrefixOrNull =
    function (): string | null {
        return this.getOrNull(
            StorageRepository.TransferRequestKeys
                .INVOICE_REGISTERED_NUMBER_WITHOUT_PREFIX
        );
    };
StorageRepository.prototype.trySetPhoneNumber =
    function (value: string): void {
        this.trySet(
            StorageRepository.TransferRequestKeys.PHONE_NUMBER,
            value
        );
    };
StorageRepository.prototype.trySetInvoiceRegisteredNumWithoutPrefix =
    function (value: string): void {
        this.trySet(
            StorageRepository.TransferRequestKeys
                .INVOICE_REGISTERED_NUMBER_WITHOUT_PREFIX,
            value
        );
    };

export default function RootLayout(
): JSX.Element {
    const [localStorageRepository] = useState(StorageRepository.create("localStorage"));
    const [transferRequestInfoInReviewing, setTransferRequestInfoInReviewing] =
        useState<TransferRequestInfo | undefined>(undefined);
    const [itiInputElem, setItiInputElem] = useState<HTMLInputElement | null>(null);
    const [iti, setIti] = useState<intlTelInput.Plugin | undefined>(undefined);
    const [requestPointNum, setRequestPointNum] = useState<number | undefined>(undefined);
    const [invoiceRegisteredNumWithoutPrefix, setInvoiceRegisteredNumWithoutPrefix] =
        useState<string>(
            localStorageRepository
                .getInvoiceRegisteredNumWithoutPrefixOrNull() ?? "" // ローカルストレージに保存されている値を取得
        );
    const [isNowFetching, setIsNowFetching] = useState(true);
    const [isNowPosting, setIsNowPosting] = useState(false);
    const [responseStatusInFetching, setResponseStatusInFetching] =
        useState<ResponseStatusInFetching>(ResponseStatusInFetching.OK);
    const [responseStatusInPosting, setResponseStatusInPosting] =
        useState<ResponseStatusInPosting>(ResponseStatusInPosting.OK);
    const [errorMessageInPhoneNumber, setErrorMessageInPhoneNumber] = useState<string | undefined>(undefined);
    const [errorMessageInRequestPointNum, setErrorMessageInRequestPointNum] = useState<string | undefined>(undefined);
    const [errorMessageInInvoiceRegisteredNum, setErrorMessageInInvoiceRegisteredNum] = useState<string | undefined>(undefined);
    // FIXME: リアクティブの良さを活かすために、「notLoading」「loading」「error」の3状態で管理するようにしたい
    const [isOpenPostSucceededModal, setIsOpenPostSucceededModal] = useState(false);
    const [isOpenConfirmSavingLocalStorageModal, setIsOpenConfirmSavingLocalStorageModal] = useState(false);
    const loggedInUserInfo = useContext(LoggedInUserInfoContext);
    const setLoggedInUserInfo = useContext(LoggedInUserInfoSetterContext);

    useEffect(
        () => {
            if (itiInputElem != null) {
                const tempIti = intlTelInput(
                    itiInputElem,
                    {
                        utilsScript: UTILS_SCRIPT_URL,
                        preferredCountries: ["jp"],
                    }
                );

                // ローカルストレージに保存されている電話番号を取得
                tempIti.setNumber(
                    localStorageRepository.getPhoneNumberOrNull() ?? ""
                );

                setIti(tempIti);
            }
        },
        [itiInputElem]
    )
    useEffect(
        () => {
            const fetchTransferRequestInfoAsync = async () => {
                const { status, data } = await fetchTransferRequestInfo()
                    .catch((_error) => {
                        // エラー発生時(JSON変換失敗時など)はCLIENT_ERRORを設定
                        return {
                            status: ResponseStatusInFetching.CLIENT_ERROR.code,
                            data: undefined,
                        };
                    });
                setIsNowFetching(false);

                const responseStatus = ResponseStatusInFetching.valueOf(status);
                setResponseStatusInFetching(responseStatus);
                if (responseStatus !== ResponseStatusInFetching.OK)
                    return;

                // dataを保持(nullかどうかのチェックは行わない)
                setTransferRequestInfoInReviewing(data);
            };
            fetchTransferRequestInfoAsync();
        },
        []
    )
    useEffect(
        () => {
            if (responseStatusInPosting !== ResponseStatusInPosting.OK) {
                // Post通信失敗時はInputのエラーを更新する
                setErrorMessageInPhoneNumber(
                    iti != null && getPhoneNumberOrError(iti) instanceof Error
                        ? Constants.PhoneNumber.Strings.ERROR_MESSAGE
                        : undefined
                );
                setErrorMessageInRequestPointNum(
                    getRequestPointNumOrError(
                        requestPointNum,
                        loggedInUserInfo?.pointNum
                    ) instanceof Error
                        ? Constants.RequestPointNum.Strings.getErrorMessage()
                        : undefined
                );
                setErrorMessageInInvoiceRegisteredNum(
                    getInvoiceRegisteredNumOrError(invoiceRegisteredNumWithoutPrefix) instanceof Error
                        ? Constants.InvoiceRegisteredNumber.Strings.ERROR_MESSAGE
                        : undefined
                );
            }
        },
        [responseStatusInPosting]
    )

    if (isNowFetching)
        return (
            <div className="flex flex-column justify-center content-center grow mx-3 my-6">
                <CircularProgress color="primary" size="lg" aria-label="通信中..." />
            </div>
        );

    if (responseStatusInFetching !== ResponseStatusInFetching.OK)
        return (
            <div className="px-6 py-8">
                {responseStatusInFetching.message}
            </div>
        );

    const isTransferRequestInReviewing = transferRequestInfoInReviewing?.status === "reviewing";
    return (
        <div>
            <div className="grid grid-cols-10 gap-x-6 gap-y-8 px-6 pt-10 pb-24"> {/* Tailwind CSSだとgrid-column-endに負の値を指定できないため、暫定的に10カラム+左右Paddingで対応 */}

                {
                    (isTransferRequestInReviewing)
                        ? (<div
                            className="col-span-full text-success whitespace-break-spaces">
                            {Constants.ReviewingTransferRequestLabel.Strings.LABEL}
                        </div>)
                        : (null)
                }

                <PhoneNumberInput
                    ref={(elem) => setItiInputElem(elem)}
                    elemId={Constants.PhoneNumber.Strings.ELEM_ID}
                    label={Constants.PhoneNumber.Strings.LABEL}
                    isDisabled={isTransferRequestInReviewing}
                    isInValid={errorMessageInPhoneNumber != null}
                    errorMessage={errorMessageInPhoneNumber}
                    onChange={() => {
                        // エラーメッセージが表示されている場合は、エラーが発生しなくなった際にメッセージの削除を行う
                        if (errorMessageInPhoneNumber == null)
                            return;
                        if (iti != null && getPhoneNumberOrError(iti) instanceof Error)
                            return;
                        setErrorMessageInPhoneNumber(undefined);
                    }}
                />

                <RequestPointNumInput
                    elemId={Constants.RequestPointNum.Strings.ELEM_ID}
                    label={Constants.RequestPointNum.Strings.LABEL}
                    value={requestPointNum}
                    placeholder={Constants.RequestPointNum.Strings.getPlaceholderStr()}
                    maxValue={Constants.RequestPointNum.MAX_REQUEST_POINT_NUM}
                    minValue={Constants.RequestPointNum.MIN_REQUEST_POINT_NUM_INPUT}
                    endContentString={Constants.RequestPointNum.Strings.END_CONTENT_STRING}
                    isDisabled={isTransferRequestInReviewing}
                    isInValid={errorMessageInRequestPointNum != null}
                    errorMessage={errorMessageInRequestPointNum}
                    onChange={(value) => {
                        setRequestPointNum(value);

                        // エラーメッセージが表示されている場合は、エラーが発生しなくなった際にメッセージの削除を行う
                        if (errorMessageInRequestPointNum != null
                            && !(getRequestPointNumOrError(
                                value,
                                loggedInUserInfo?.pointNum
                            ) instanceof Error))
                            setErrorMessageInRequestPointNum(undefined);
                    }}
                />

                {/* <InvoiceRegisteredNumberInput
                    elemId={Constants.InvoiceRegisteredNumber.Strings.ELEM_ID}
                    label={Constants.InvoiceRegisteredNumber.Strings.LABEL}
                    value={invoiceRegisteredNumWithoutPrefix}
                    placeholder={Constants.InvoiceRegisteredNumber.Strings.PLACEHOLDER}
                    startContentString={Constants.InvoiceRegisteredNumber.Strings.START_CONTENT_STRING}
                    isDisabled={isTransferRequestInReviewing}
                    isInValid={errorMessageInInvoiceRegisteredNum != null}
                    errorMessage={errorMessageInInvoiceRegisteredNum}
                    onChange={(value) => {
                        setInvoiceRegisteredNumWithoutPrefix(value);

                        // エラーメッセージが表示されている場合は、エラーが発生しなくなった際にメッセージの削除を行う
                        if (errorMessageInInvoiceRegisteredNum != null
                            && !(getInvoiceRegisteredNumOrError(value) instanceof Error))
                            setErrorMessageInInvoiceRegisteredNum(undefined);
                    }}
                /> */}

                <Button
                    className="col-span-full mt-16"
                    color="primary"
                    startContent={<CurrencyYenIcon />}
                    isDisabled={isTransferRequestInReviewing || isNowPosting}
                    onPress={() => {
                        if (iti == null)
                            return;

                        const postTransferRequestInfoAsync = async () => {
                            const { status, data } = await postTransferRequestInfo(
                                loggedInUserInfo?.pointNum,
                                iti,
                                requestPointNum,
                                invoiceRegisteredNumWithoutPrefix,
                            ).catch((_error) => {
                                // エラー発生時(JSON変換失敗時など)はCLIENT_ERRORを設定
                                return {
                                    status: ResponseStatusInPosting.CLIENT_ERROR.code,
                                    data: undefined,
                                };
                            });

                            setIsNowPosting(false);

                            const responseStatus = ResponseStatusInPosting.valueOf(status);
                            setResponseStatusInPosting(responseStatus);
                            if (responseStatus !== ResponseStatusInPosting.OK)
                                return;
                            if (data == null || data.transferRequestInfo == null || data.userPointNumInfo == null) {
                                // 通信は成功しているが、返却データの変換に失敗している場合
                                setResponseStatusInPosting(ResponseStatusInPosting.OTHERS);
                                return;
                            }

                            // 返却値で情報を更新
                            setTransferRequestInfoInReviewing(data.transferRequestInfo);

                            // ローカルストレージに保存するかどうかの確認Modalを表示する関係で、ここでは各種値の初期化は行わない

                            // クライアント側で保持しているユーザー情報を更新
                            if (loggedInUserInfo != null)
                                setLoggedInUserInfo({
                                    ...loggedInUserInfo,
                                    pointNum: data.userPointNumInfo.pointNum,
                                });

                            // 成功Modelを表示
                            setIsOpenPostSucceededModal(true);
                        };

                        setIsNowPosting(true);
                        setResponseStatusInPosting(ResponseStatusInPosting.OK);
                        postTransferRequestInfoAsync();
                    }}
                >
                    {Constants.SendButton.Strings.LABEL}
                </Button>

            </div>

            <ProgressModal
                isOpenModal={isNowPosting}
                label={Constants.ProgressModalInPosting.Strings.LABEL}
            />

            <ErrorModalInPosting
                title={Constants.ErrorModalInPosting.Strings.TITLE}
                positiveButtonLabel={Constants.ErrorModalInPosting.Strings.POSITIVE_BUTTON_LABEL}
                responseStatus={responseStatusInPosting}
                onCloseModal={() => {
                    // Modalが閉じた場合はレスポンスステータスをOKに
                    setResponseStatusInPosting(ResponseStatusInPosting.OK);
                }}
            />

            <SucceededModalInPosting
                title={
                    transferRequestInfoInReviewing?.status === "accepted"
                        ? Constants.SucceededModalInPosting.Strings.TITLE_STATUS_ACCEPTED
                        : Constants.SucceededModalInPosting.Strings.TITLE_STATUS_REVIEWING
                }
                message={
                    Constants.SucceededModalInPosting.Strings
                        .getMessage(transferRequestInfoInReviewing)
                }
                positiveButtonLabel={Constants.SucceededModalInPosting.Strings.POSITIVE_BUTTON_LABEL}
                isOpenModal={isOpenPostSucceededModal}
                onCloseModal={() => {
                    setIsOpenPostSucceededModal(false);

                    // ローカルストレージに保存するかどうかの確認Modalを表示
                    setIsOpenConfirmSavingLocalStorageModal(true);
                }}
            />

            <ConfirmSavingLocalStorageModal
                title={Constants.ConfirmSavingLocalStorageModal.Strings.TITLE}
                message={Constants.ConfirmSavingLocalStorageModal.Strings.MESSAGE}
                positiveButtonLabel={Constants.ConfirmSavingLocalStorageModal.Strings.POSITIVE_BUTTON_LABEL}
                negativeButtonLabel={Constants.ConfirmSavingLocalStorageModal.Strings.NEGATIVE_BUTTON_LABEL}
                isOpenModal={isOpenConfirmSavingLocalStorageModal}
                onCloseModal={() => {
                    setIsOpenConfirmSavingLocalStorageModal(false);

                    // 各種値を初期化
                    iti?.setNumber(localStorageRepository.getPhoneNumberOrNull() ?? "");
                    setRequestPointNum(undefined);
                    setInvoiceRegisteredNumWithoutPrefix(
                        localStorageRepository
                            .getInvoiceRegisteredNumWithoutPrefixOrNull() ?? ""
                    );
                    setErrorMessageInPhoneNumber(undefined);
                    setErrorMessageInRequestPointNum(undefined);
                    setErrorMessageInInvoiceRegisteredNum(undefined);
                    setResponseStatusInPosting(ResponseStatusInPosting.OK);
                }}
                onClickPositiveButton={() => {
                    localStorageRepository.trySetPhoneNumber(iti?.getNumber() ?? "");
                    localStorageRepository.trySetInvoiceRegisteredNumWithoutPrefix(
                        invoiceRegisteredNumWithoutPrefix
                    );
                }}
            />

        </div>
    );
}

const PhoneNumberInput = React.forwardRef<
    HTMLInputElement,
    {
        elemId: string,
        label: string,
        isDisabled: boolean,
        isInValid: boolean,
        errorMessage?: string,
        onChange: () => void,
    }
>((props, ref) => (
    // [Reactでntl-tel-inputを使用する方法] { @link https://github.com/jackocnr/intl-tel-input/issues/1402 }
    <div
        className="col-span-full" >

        <Input
            label={props.label}
            labelPlacement="outside"
            placeholder=" "
            classNames={{
                inputWrapper: "hidden",
            }}
            fullWidth
            isDisabled={props.isDisabled}
            isInvalid={props.isInValid}
            isRequired
        />

        <Input
            className="w-full [&_.iti]:w-full" // [子孫要素のitiのWidthを指定] { @link https://www.gaji.jp/blog/2022/10/19/11693/ }
            type="phone"
            ref={ref}
            name={props.elemId}
            id={props.elemId}
            fullWidth
            isDisabled={props.isDisabled}
            isInvalid={props.isInValid}
            errorMessage={props.errorMessage}
            onValueChange={(_value) => props.onChange()}
            isRequired
        />

    </div >
));

function RequestPointNumInput({
    elemId,
    label,
    value,
    placeholder,
    maxValue,
    minValue,
    endContentString,
    isDisabled,
    isInValid,
    errorMessage,
    onChange,
}: {
    elemId: string,
    label: string,
    value?: number,
    placeholder: string,
    maxValue: number,
    minValue: number,
    endContentString: string,
    isDisabled: boolean,
    isInValid: boolean,
    errorMessage?: string,
    onChange: (value: number | undefined) => void
}): ReactElement {
    return (
        <div
            className="col-span-full">

            <Input
                type="number"
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                isClearable
                fullWidth
                value={value?.toString(10) ?? ""}
                max={maxValue}
                min={minValue}
                placeholder={placeholder}
                endContent={<span>{endContentString}</span>}
                isDisabled={isDisabled}
                isInvalid={isInValid}
                errorMessage={errorMessage}
                onValueChange={(v) => {
                    const num = parseInt(v, 10);
                    if (isNaN(num)) {
                        onChange(undefined);
                        return;
                    }

                    onChange(Math.min(Math.max(num, minValue), maxValue));
                }}
                isRequired
            />

        </div>
    );
}

function InvoiceRegisteredNumberInput({
    elemId,
    label,
    value,
    placeholder,
    startContentString,
    isDisabled,
    isInValid,
    errorMessage,
    onChange,
}: {
    elemId: string,
    label: string,
    value: string,
    placeholder: string,
    startContentString: string,
    isDisabled: boolean,
    isInValid: boolean,
    errorMessage?: string,
    onChange: (value: string) => void
}): ReactElement {
    return (
        <div
            className="col-span-full">

            <Input
                type="tel"
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                isClearable
                fullWidth
                value={value}
                placeholder={placeholder}
                startContent={<span>{startContentString}</span>}
                isDisabled={isDisabled}
                isInvalid={isInValid}
                errorMessage={errorMessage}
                onValueChange={onChange}
            />

        </div>
    )
}

function ProgressModal({
    isOpenModal,
    label,
}: {
    isOpenModal: boolean,
    label: string,
}): ReactElement {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    useEffect(
        () => {
            if (isOpenModal)
                onOpen();
            else
                onClose();
        },
        [isOpenModal]
    );

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={false}
            hideCloseButton={true}
        >
            <ModalContent>
                {(_onClose) => (
                    <ModalBody
                        className="flex flex-row"
                    >
                        <CircularProgress
                            color="primary"
                            size="lg"
                            label={label}
                        />
                    </ModalBody>
                )}
            </ModalContent>
        </Modal>
    );
}

function ErrorModalInPosting({
    title,
    positiveButtonLabel,
    responseStatus,
    onCloseModal,
}: {
    title: string,
    positiveButtonLabel: string,
    responseStatus: ResponseStatusInPosting,
    onCloseModal: () => void,
}): ReactElement {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(
        () => {
            // 閉じた場合はコールバックを呼び出す
            if (!isOpen)
                onCloseModal();
        },
        [isOpen]
    );
    useEffect(
        () => {
            // エラーが発生している場合はモーダルを開く
            if (responseStatus !== ResponseStatusInPosting.OK)
                onOpen();
        },
        [responseStatus]
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {title}
                        </ModalHeader>
                        <ModalBody
                            className="whitespace-break-spaces"
                        >
                            {responseStatus?.message ?? ""}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose}>
                                {positiveButtonLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

function SucceededModalInPosting({
    title,
    message,
    positiveButtonLabel,
    isOpenModal,
    onCloseModal,
}: {
    title: string,
    message: string,
    positiveButtonLabel: string,
    isOpenModal: boolean,
    onCloseModal: () => void,
}): ReactElement {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(
        () => {
            // 閉じた場合はコールバックを呼び出す
            if (!isOpen)
                onCloseModal();
        },
        [isOpen]
    );
    useEffect(
        () => {
            // 開く設定になった場合はモーダルを開く
            if (isOpenModal)
                onOpen();
        },
        [isOpenModal]
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {title}
                        </ModalHeader>
                        <ModalBody
                            className="whitespace-break-spaces"
                        >
                            {message}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onPress={onClose}>
                                {positiveButtonLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

function ConfirmSavingLocalStorageModal({
    title,
    message,
    positiveButtonLabel,
    negativeButtonLabel,
    isOpenModal,
    onCloseModal,
    onClickPositiveButton,
}: {
    title: string,
    message: string,
    positiveButtonLabel: string,
    negativeButtonLabel: string,
    isOpenModal: boolean,
    onCloseModal: () => void,
    onClickPositiveButton: () => void,
}): ReactElement {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    useEffect(
        () => {
            // 閉じた場合はコールバックを呼び出す
            if (!isOpen)
                onCloseModal();
        },
        [isOpen]
    );
    useEffect(
        () => {
            // 開く設定になった場合はモーダルを開く
            if (isOpenModal)
                onOpen();
        },
        [isOpenModal]
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {title}
                        </ModalHeader>
                        <ModalBody
                            className="whitespace-break-spaces"
                        >
                            {message}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="primary"
                                variant="bordered"
                                onPress={onClose}
                            >
                                {negativeButtonLabel}
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => {
                                    onClickPositiveButton();
                                    onClose();
                                }}
                            >
                                {positiveButtonLabel}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

// #region API関連 FIXME: 他のファイルに移動する
async function fetchTransferRequestInfo(
): Promise<{
    status: number,
    data?: TransferRequestInfo,
}> {
    const response = await fetch(
        ApiUrl.getFetchTransferRequestInfoUrl(),
        {
            method: HttpRequest.METHOD_TYPE.GET,
            headers: {
                [HttpRequest.HEADER_KEY_TYPE.ACCEPT]: HttpRequest.CONTENT_TYPE.JSON,
            },
            cache: "no-cache",
        }
    );

    if (!response.ok)
        return {
            status: response.status,
        };

    const data = TransferRequestInfo.toObjectFromJson(await response.json());
    return {
        status: response.status,
        data: data,
    };
}

async function postTransferRequestInfo(
    userPointNum: number | undefined,
    phoneNumberInputPlugin: intlTelInput.Plugin,
    requestPointNum: number | undefined,
    invoiceRegisteredNumWithoutPrefix: string,
): Promise<{
    status: number,
    data?: {
        transferRequestInfo?: TransferRequestInfo,
        userPointNumInfo?: UserPointNumInfo,
    },
}> {
    const validatedPhoneNumber = getPhoneNumberOrError(phoneNumberInputPlugin);
    const validatedRequestPointNum = getRequestPointNumOrError(requestPointNum, userPointNum);
    const validatedInvoiceRegisteredNum =
        getInvoiceRegisteredNumOrError(invoiceRegisteredNumWithoutPrefix);

    // いずれかの入力が不正な場合はエラーを返却
    if (validatedPhoneNumber instanceof Error
        || validatedRequestPointNum instanceof Error
        // || validatedInvoiceRegisteredNum instanceof Error)
    )
        return {
            status: ResponseStatusInPosting.CONTAINED_INVALID_ITEM.code,
        }

    const requestBody: PostTransferRequestBody = {
        phoneNumber: validatedPhoneNumber,
        requestPointNum: validatedRequestPointNum,
        // invoiceRegisteredNumber: validatedInvoiceRegisteredNum,
    };

    const response = await fetch(
        ApiUrl.getPostTransferRequestInfoUrl(),
        {
            method: HttpRequest.METHOD_TYPE.POST,
            headers: {
                [HttpRequest.HEADER_KEY_TYPE.ACCEPT]: HttpRequest.CONTENT_TYPE.JSON,
                [HttpRequest.HEADER_KEY_TYPE.CONTENT_TYPE]: HttpRequest.CONTENT_TYPE.MULTIPART,
            },
            body: JSON.stringify(
                Object.entries(requestBody).reduce(
                    (prevValue, currValue) => {
                        const [key, value] = currValue;
                        return {
                            ...prevValue,
                            [convertCamelToSnake(key)]: value,
                        };
                    },
                    {} as Record<string, string | number>
                )
            ),
            cache: "no-cache",
        }
    );

    if (!response.ok)
        return {
            status: response.status,
        };

    const jsonObj = await response.json();
    const transferRequestInfo = TransferRequestInfo.toObjectFromJson(jsonObj);
    const userPointNumInfo = UserPointNumInfo.toObjectFromJson(jsonObj);
    return {
        status: response.status,
        data: {
            transferRequestInfo: transferRequestInfo,
            userPointNumInfo: userPointNumInfo,
        },
    };
}
// #endregion

// #region Validation関連
function getPhoneNumberOrError(
    phoneNumberInputPlugin: intlTelInput.Plugin,
): string | Error {
    // NOTE: [isValidNumber()を使う場合はライブラリを最新にする必要がある] { @link https://github.com/jackocnr/intl-tel-input/tree/master#public-methods }
    //          そのため[isPossibleNumber()を使用したかったが、開発時点だと使用できなかった] { @link https://github.com/jackocnr/intl-tel-input/issues/1470 }
    if (!phoneNumberInputPlugin.isValidNumber())
        return new Error(`this phone number has an error: \n${phoneNumberInputPlugin.getValidationError().toString(10)}`);

    return phoneNumberInputPlugin.getNumber();
}

function getRequestPointNumOrError(
    requestPointNum: number | undefined,
    userPointNum: number | undefined,
): number | Error {
    if (requestPointNum != null
        && requestPointNum >= Constants.RequestPointNum.MIN_REQUEST_POINT_NUM
        && requestPointNum <= Constants.RequestPointNum.MAX_REQUEST_POINT_NUM
        && (userPointNum == null || requestPointNum <= userPointNum))
        return requestPointNum;

    // ここまで到達した場合はエラーを返却
    return new Error("this request point num is invalid");
}

function getInvoiceRegisteredNumOrError(
    invoiceRegisteredNumWithoutPrefix: string,
): string | undefined | Error {
    // 空文字の場合は有効として扱う(nullを返却)
    if (invoiceRegisteredNumWithoutPrefix == "")
        return undefined;

    // フォーマット通りかどうかを返却
    if (new RegExp(Constants.InvoiceRegisteredNumber.FORMAT_WITHOUT_PREFIX)
        .test(invoiceRegisteredNumWithoutPrefix))
        return Constants.InvoiceRegisteredNumber.Strings.PREFIX + invoiceRegisteredNumWithoutPrefix;

    // ここまで到達した場合はエラーを返却
    return new Error("this invoice registered number is invalid");
}
// #endregion