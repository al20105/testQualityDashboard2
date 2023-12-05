'use client'

import { Button, CircularProgress, Input, InputSlots, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SelectSlots, Selection, SlotsToClasses, Textarea, useDisclosure } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { ReactElement, useContext, useEffect, useState } from "react";
import { PencilIcon } from '@heroicons/react/24/outline'
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { LoggedInUserInfoContext, LoggedInUserInfoSetterContext } from "@/app/_components/_providers/LoggedInUserInfoContextProvider";
import { convertCamelToSnake } from "@/app/_utils/ConvertStringCaseUtil";

dayjs.extend(customParseFormat)

// #region モデル関連 FIXME: 他のファイルに移動する
type BwhSize = [number, number, number];

class ProfileImage {
    constructor(
        public readonly imageUrl: string,
    ) { }
}

class BaseProfileItem<T> {
    constructor(
        public readonly value: T,
    ) { }

    public toString = (): string => {
        throw new Error("Not implemented");
    }
}

class SingleSelectProfileItem extends BaseProfileItem<number> {
    static readonly fallbackValue = new SingleSelectProfileItem(-1, "秘密");

    constructor(
        public readonly value: number,
        public readonly label: string
    ) {
        super(value);
    }

    public toString = (): string => {
        return this.value.toString(10);
    }
}

class MultiSelectProfileItem extends BaseProfileItem<SingleSelectProfileItem[]> {
    public toString = (): string => {
        return `[${this.value.map((item) => item.toString()).join(",")}]`;
    }
}

class FormattedProfileItem<T> extends BaseProfileItem<T> {
}

class DateFormattedProfileItem extends FormattedProfileItem<Dayjs> {
    static readonly DATE_FORMAT = "YYYY-MM-DD";
    private static readonly DATE_FORMAT_SEPARATOR = "-";
    static toFormattedString(
        [yearNum, monthNum, dayNum]: [number, number, number]
    ): string {
        // 「YYYY-MM-DD」の形式で出力
        return `${yearNum.toString(10).padStart(4, "0")}`
            + `${this.DATE_FORMAT_SEPARATOR}`
            + `${monthNum.toString(10).padStart(2, "0")}` +
            + `${this.DATE_FORMAT_SEPARATOR}`
            + `${dayNum.toString(10).padStart(2, "0")}`;
    }

    constructor(
        value: string
    ) {
        super(dayjs(value, DateFormattedProfileItem.DATE_FORMAT)); // ローカル時刻で保持
    }

    public toString = (): string => {
        return this.value.format(DateFormattedProfileItem.DATE_FORMAT); // ローカル時刻で出力
    }
}

class BwhSizeFormattedProfileItem extends FormattedProfileItem<BwhSize | undefined> {
    static readonly BWH_FORMAT = "B-W-H";
    private static readonly BWH_FORMAT_SEPARATOR = "-";
    static toFormattedString(
        [bustNum, waistNum, hipNum]: BwhSize
    ): string {
        // 「B-W-H」の形式で出力
        return `${bustNum.toString(10)}`
            + `${this.BWH_FORMAT_SEPARATOR}`
            + `${waistNum.toString(10)}`
            + `${this.BWH_FORMAT_SEPARATOR}`
            + `${hipNum.toString(10)}`;
    }

    constructor(
        value: string
    ) {
        const nums = value.split(BwhSizeFormattedProfileItem.BWH_FORMAT_SEPARATOR)
            .map((numStr) => parseInt(numStr, 10))
            .filter((num): num is number => !isNaN(num));
        super(
            nums.length >= 3
                ? [nums[0], nums[1], nums[2]]
                : undefined
        );
    }

    public toString = (): string => {
        return this.value
            ? BwhSizeFormattedProfileItem.toFormattedString(this.value)
            : "null";
    }
}

class HeightFormattedProfileItem extends FormattedProfileItem<number | undefined> {
    constructor(
        value: string
    ) {
        const num = parseInt(value, 10);
        super(isNaN(num) ? undefined : num);
    }

    public toString = (): string => {
        return this.value?.toString(10) ?? "null";
    }
}

class SingleLineInputProfileItem extends BaseProfileItem<string> {
    public toString = (): string => {
        return this.value;
    }
}

class MultiLineInputProfileItem extends BaseProfileItem<string> {
    public toString = (): string => {
        return this.value;
    }
}

class CupSizeProfileItem extends SingleSelectProfileItem {
    static readonly values = [
        new CupSizeProfileItem(0, "Aカップ"),
        new CupSizeProfileItem(1, "Bカップ"),
        new CupSizeProfileItem(2, "Cカップ"),
        new CupSizeProfileItem(3, "Dカップ"),
        new CupSizeProfileItem(4, "Eカップ"),
        new CupSizeProfileItem(5, "Fカップ"),
        new CupSizeProfileItem(6, "Gカップ"),
        new CupSizeProfileItem(7, "Hカップ"),
        new CupSizeProfileItem(8, "Iカップ以上"),
    ];

    static valueOf(value: number): SingleSelectProfileItem | undefined {
        return CupSizeProfileItem.values.find((item) => item.value === value);
    }
}

class BloodTypeProfileItem extends SingleSelectProfileItem {
    static readonly values = [
        new BloodTypeProfileItem(0, "A型"),
        new BloodTypeProfileItem(1, "B型"),
        new BloodTypeProfileItem(2, "O型"),
        new BloodTypeProfileItem(3, "AB型"),
    ];

    static valueOf(value: number): SingleSelectProfileItem | undefined {
        return BloodTypeProfileItem.values.find((item) => item.value === value);
    }
}

class PrefectureTypeProfileItem extends SingleSelectProfileItem {
    static readonly values = [
        new PrefectureTypeProfileItem(0, "北海道"),
        new PrefectureTypeProfileItem(1, "青森県"),
        new PrefectureTypeProfileItem(2, "岩手県"),
        new PrefectureTypeProfileItem(3, "宮城県"),
        new PrefectureTypeProfileItem(4, "秋田県"),
        new PrefectureTypeProfileItem(5, "山形県"),
        new PrefectureTypeProfileItem(6, "福島県"),
        new PrefectureTypeProfileItem(7, "茨城県"),
        new PrefectureTypeProfileItem(8, "栃木県"),
        new PrefectureTypeProfileItem(9, "群馬県"),
        new PrefectureTypeProfileItem(10, "埼玉県"),
        new PrefectureTypeProfileItem(11, "千葉県"),
        new PrefectureTypeProfileItem(12, "東京都"),
        new PrefectureTypeProfileItem(13, "神奈川県"),
        new PrefectureTypeProfileItem(14, "新潟県"),
        new PrefectureTypeProfileItem(15, "富山県"),
        new PrefectureTypeProfileItem(16, "石川県"),
        new PrefectureTypeProfileItem(17, "福井県"),
        new PrefectureTypeProfileItem(18, "山梨県"),
        new PrefectureTypeProfileItem(19, "長野県"),
        new PrefectureTypeProfileItem(20, "岐阜県"),
        new PrefectureTypeProfileItem(21, "静岡県"),
        new PrefectureTypeProfileItem(22, "愛知県"),
        new PrefectureTypeProfileItem(23, "三重県"),
        new PrefectureTypeProfileItem(24, "滋賀県"),
        new PrefectureTypeProfileItem(25, "京都府"),
        new PrefectureTypeProfileItem(26, "大阪府"),
        new PrefectureTypeProfileItem(27, "兵庫県"),
        new PrefectureTypeProfileItem(28, "奈良県"),
        new PrefectureTypeProfileItem(29, "和歌山県"),
        new PrefectureTypeProfileItem(30, "鳥取県"),
        new PrefectureTypeProfileItem(31, "島根県"),
        new PrefectureTypeProfileItem(32, "岡山県"),
        new PrefectureTypeProfileItem(33, "広島県"),
        new PrefectureTypeProfileItem(34, "山口県"),
        new PrefectureTypeProfileItem(35, "徳島県"),
        new PrefectureTypeProfileItem(36, "香川県"),
        new PrefectureTypeProfileItem(37, "愛媛県"),
        new PrefectureTypeProfileItem(38, "高知県"),
        new PrefectureTypeProfileItem(39, "福岡県"),
        new PrefectureTypeProfileItem(40, "佐賀県"),
        new PrefectureTypeProfileItem(41, "長崎県"),
        new PrefectureTypeProfileItem(42, "熊本県"),
        new PrefectureTypeProfileItem(43, "大分県"),
        new PrefectureTypeProfileItem(44, "宮崎県"),
        new PrefectureTypeProfileItem(45, "鹿児島県"),
        new PrefectureTypeProfileItem(46, "沖縄県"),
    ];

    static valueOf(value: number): SingleSelectProfileItem | undefined {
        return PrefectureTypeProfileItem.values.find((item) => item.value === value);
    }
}

class UsageTimeTypeProfileItem extends SingleSelectProfileItem {
    static readonly values = [
        new UsageTimeTypeProfileItem(0, "不定期"),
        new UsageTimeTypeProfileItem(1, "いつでも"),
        new UsageTimeTypeProfileItem(2, "朝"),
        new UsageTimeTypeProfileItem(3, "日中"),
        new UsageTimeTypeProfileItem(4, "夕方"),
        new UsageTimeTypeProfileItem(5, "夜"),
        new UsageTimeTypeProfileItem(6, "深夜"),
    ];

    static valueOf(value: number): SingleSelectProfileItem | undefined {
        return UsageTimeTypeProfileItem.values.find((item) => item.value === value);
    }
}

class UsageFrequencyTypeProfileItem extends SingleSelectProfileItem {
    static readonly values = [
        new UsageFrequencyTypeProfileItem(0, "週に1日"),
        new UsageFrequencyTypeProfileItem(1, "週に2日"),
        new UsageFrequencyTypeProfileItem(2, "週に3日"),
        new UsageFrequencyTypeProfileItem(3, "週に4日"),
        new UsageFrequencyTypeProfileItem(4, "週に5日"),
        new UsageFrequencyTypeProfileItem(5, "週に6日"),
        new UsageFrequencyTypeProfileItem(6, "週に7日"),
    ];

    static valueOf(value: number): SingleSelectProfileItem | undefined {
        return UsageFrequencyTypeProfileItem.values.find((item) => item.value === value);
    }
}

class CharacteristicTypeListProfileItem extends MultiSelectProfileItem {
    static readonly values = new CharacteristicTypeListProfileItem([
        new SingleSelectProfileItem(0, "おっとり"),
        new SingleSelectProfileItem(1, "元気"),
    ]);

    static valueOf(values: number[]): MultiSelectProfileItem {
        const singleSelectItemList = values.sort()
            .map((valueNum) =>
                CharacteristicTypeListProfileItem
                    .values
                    .value
                    .find((singleSelectItem) => singleSelectItem.value === valueNum)
            )
            .filter((item): item is SingleSelectProfileItem => item != null);
        return new CharacteristicTypeListProfileItem(singleSelectItemList);
    }
}

class UserProfile {
    static readonly API_REQUEST_KEY_RAW_PROFILE_IMAGE = "profile_image_data";
    static readonly DEFAULT_VALUE: UserProfile = UserProfile.toObject({
        name: new SingleLineInputProfileItem(""),
    });

    static toObject({
        name,
        profileImage,
        preference,
        hobby,
        personality,
        job,
        comment,
        prText,
        birthDate,
        bwhSize,
        height,
        cupSizeType,
        bloodType,
        prefectureType,
        characteristicTypeList,
        usageTimeType,
        usageFrequencyType,
    }: {
        name: SingleLineInputProfileItem,
        profileImage?: ProfileImage,
        preference?: MultiLineInputProfileItem,
        hobby?: MultiLineInputProfileItem,
        personality?: MultiLineInputProfileItem,
        job?: MultiLineInputProfileItem,
        comment?: MultiLineInputProfileItem,
        prText?: SingleLineInputProfileItem,
        birthDate?: DateFormattedProfileItem,
        bwhSize?: BwhSizeFormattedProfileItem,
        height?: HeightFormattedProfileItem,
        cupSizeType?: SingleSelectProfileItem,
        bloodType?: SingleSelectProfileItem,
        prefectureType?: SingleSelectProfileItem,
        characteristicTypeList?: MultiSelectProfileItem,
        usageTimeType?: SingleSelectProfileItem,
        usageFrequencyType?: SingleSelectProfileItem,
    }): UserProfile {
        return new UserProfile(
            name.value,
            profileImage,
            preference?.value,
            hobby?.value,
            personality?.value,
            job?.value,
            comment?.value,
            prText?.value,
            birthDate?.toString(),
            bwhSize?.toString(),
            height?.value?.toString(),
            cupSizeType?.value,
            bloodType?.value,
            prefectureType?.value,
            characteristicTypeList?.value.map((item) => item.value),
            usageTimeType?.value,
            usageFrequencyType?.value,
        );
    }

    static toObjectFromJson({
        name,
        image_url,
        preference,
        hobby,
        personality,
        job,
        comment,
        pr_text,
        birth_date,
        bwh_size,
        height,
        cup_size_type,
        blood_type,
        prefecture_type,
        characteristic_type_list,
        usage_time_type,
        usage_frequency_type,
    }: {
        name: string,
        image_url?: string,
        preference?: string,
        hobby?: string,
        personality?: string,
        job?: string,
        comment?: string,
        pr_text?: string,
        birth_date?: string,
        bwh_size?: string,
        height?: number,
        cup_size_type?: number,
        blood_type?: number,
        prefecture_type?: number,
        characteristic_type_list?: number[],
        usage_time_type?: number,
        usage_frequency_type?: number,
    }): UserProfile {
        return new UserProfile(
            name != null ? name : "", // nameがnullの場合は空文字を設定
            image_url != null
                ? new ProfileImage(image_url)
                : undefined,
            preference,
            hobby,
            personality,
            job,
            comment,
            pr_text,
            birth_date,
            bwh_size,
            height?.toString(10),
            cup_size_type,
            blood_type,
            prefecture_type,
            characteristic_type_list != null && typeof characteristic_type_list === 'string'
                ? JSON.parse(characteristic_type_list)
                : characteristic_type_list,
            usage_time_type,
            usage_frequency_type,
        );
    }

    public readonly name: SingleLineInputProfileItem;

    public readonly profileImage?: ProfileImage;

    // NOTE: 空文字の場合はundefinedになるので注意
    public readonly preference?: MultiLineInputProfileItem;
    public readonly hobby?: MultiLineInputProfileItem;
    public readonly personality?: MultiLineInputProfileItem;
    public readonly job?: MultiLineInputProfileItem;
    public readonly comment?: MultiLineInputProfileItem;
    public readonly prText?: SingleLineInputProfileItem;

    // NOTE: YYYY・MM・DDの3つ全ての値が入力されている場合以外は、undefinedになるので注意
    public readonly birthDate?: DateFormattedProfileItem;
    // NOTE: B・W・Hの3つ全ての値が入力されている場合以外は、undefinedになるので注意
    public readonly bwhSize?: BwhSizeFormattedProfileItem;
    // NOTE: 空文字の場合はundefinedになるので注意
    public readonly height?: HeightFormattedProfileItem;

    // NOTE: 選択されていない場合はundefinedになるので注意
    public readonly cupSizeType?: SingleSelectProfileItem;
    public readonly bloodType?: SingleSelectProfileItem;
    public readonly prefectureType?: SingleSelectProfileItem;
    public readonly characteristicTypeList?: MultiSelectProfileItem;
    public readonly usageTimeType?: SingleSelectProfileItem;
    public readonly usageFrequencyType?: SingleSelectProfileItem;

    constructor(
        name: string,
        profileImage?: ProfileImage,
        preference?: string,
        hobby?: string,
        personality?: string,
        job?: string,
        comment?: string,
        prText?: string,
        birthDate?: string,
        bwhSize?: string,
        height?: string,
        cupSizeType?: number,
        bloodType?: number,
        prefectureType?: number,
        characteristicTypeList?: number[],
        usageTimeType?: number,
        usageFrequencyType?: number,
    ) {
        this.name = new SingleLineInputProfileItem(name);
        this.profileImage = profileImage;

        // 空文字の場合はundefinedにする
        this.preference = preference != null && preference !== "" ? new MultiLineInputProfileItem(preference) : undefined;
        this.hobby = hobby != null && hobby !== "" ? new MultiLineInputProfileItem(hobby) : undefined;
        this.personality = personality != null && personality !== "" ? new MultiLineInputProfileItem(personality) : undefined;
        this.job = job != null && job !== "" ? new MultiLineInputProfileItem(job) : undefined;
        this.comment = comment != null && comment !== "" ? new MultiLineInputProfileItem(comment) : undefined;
        this.prText = prText != null && prText !== "" ? new SingleLineInputProfileItem(prText) : undefined;

        // 空文字の場合はundefinedにする
        this.birthDate = birthDate != null && birthDate !== "" ? new DateFormattedProfileItem(birthDate) : undefined;
        this.bwhSize = bwhSize != null && bwhSize !== "" ? new BwhSizeFormattedProfileItem(bwhSize) : undefined;
        this.height = height != null && height !== "" ? new HeightFormattedProfileItem(height) : undefined;

        this.cupSizeType = cupSizeType != null ? CupSizeProfileItem.valueOf(cupSizeType) : undefined;
        this.bloodType = bloodType != null ? BloodTypeProfileItem.valueOf(bloodType) : undefined;
        this.prefectureType = prefectureType != null ? PrefectureTypeProfileItem.valueOf(prefectureType) : undefined;
        this.characteristicTypeList = characteristicTypeList != null ? CharacteristicTypeListProfileItem.valueOf(characteristicTypeList) : undefined;
        this.usageTimeType = usageTimeType != null ? UsageTimeTypeProfileItem.valueOf(usageTimeType) : undefined;
        this.usageFrequencyType = usageFrequencyType != null ? UsageFrequencyTypeProfileItem.valueOf(usageFrequencyType) : undefined;
    }

    public validate(): boolean {
        if (!this.validateName())
            return false;

        return true;
    }

    public validateName(): boolean {
        if (this.name.value.trim() === "")
            return false;
        return true;
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
    };
    static readonly FORM_DATA_VALUE_NULL = null;
}

class ResponseStatusInFetching {
    static OK = new ResponseStatusInFetching(200, "通信成功");
    static FORBIDDEN = new ResponseStatusInFetching(403, "他のユーザーのプロフィールは取得できません");
    static NOT_FOUND = new ResponseStatusInFetching(404, "取得しようとしたユーザーが見つかりません");
    static INTERNAL_SERVER_ERROR = new ResponseStatusInFetching(500, "取得中にサーバーでエラーが発生しました");
    static OTHERS = new ResponseStatusInFetching(-1, "通信エラー");
    static CLIENT_ERROR = new ResponseStatusInFetching(-100, "取得処理に失敗しました");

    static values = [
        this.OK,
        this.FORBIDDEN,
        this.NOT_FOUND,
        this.INTERNAL_SERVER_ERROR,
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

class ResponseStatusInPatching {
    static OK = new ResponseStatusInPatching(200, "通信成功");
    static FORBIDDEN = new ResponseStatusInPatching(403, "他のユーザーのプロフィールは編集できません");
    static NOT_FOUND = new ResponseStatusInPatching(404, "編集しようとしたユーザーが見つかりません");
    static UNSUPPORTED_MEDIA_TYPE = new ResponseStatusInPatching(415, "画像データに問題があるため、編集に失敗しました");
    static INTERNAL_SERVER_ERROR = new ResponseStatusInPatching(500, "サーバーでエラーが発生しました");
    static OTHERS = new ResponseStatusInPatching(-1, "通信エラー");
    static CLIENT_ERROR = new ResponseStatusInPatching(-100, "編集処理に失敗しました")
    static EMPTY_REQUEST = new ResponseStatusInPatching(-200, "更新する項目がありません");
    static CONTAINED_INVALID_ITEM = new ResponseStatusInPatching(-300, "入力に不備があります");

    static values = [
        this.OK,
        this.FORBIDDEN,
        this.NOT_FOUND,
        this.UNSUPPORTED_MEDIA_TYPE,
        this.INTERNAL_SERVER_ERROR,
        this.OTHERS,
        this.CLIENT_ERROR,
        this.EMPTY_REQUEST,
        this.CONTAINED_INVALID_ITEM,
    ];
    static valueOf(code: number): ResponseStatusInPatching {
        return this.values.find((value) => value.code === code) ?? this.OTHERS;
    }

    private constructor(
        public readonly code: number,
        public readonly message: string,
    ) { }
}

class Constants {
    static ProfileImage = class {
        static readonly FALL_BACK_IMAGE_URL = ""; // TODO: 本番用に設定する
        static Strings = class {
            static readonly ELEM_ID = "profileImage";
            static readonly ACCEPT = ".jpg, .jpeg, .png"; // 一旦PNGとJPEGのみ対応。必要に応じて修正すること
        }
    }
    static Nickname = class {
        static readonly MAX_LENGTH = 20;
        static Strings = class {
            static readonly ELEM_ID = "nickname";
            static readonly LABEL = "ニックネーム";
            static readonly PLACEHOLDER = "入力してください";
            static readonly ERROR_MESSAGE = "※ 必須項目です";
        }
    }
    static Comment = class {
        static readonly MAX_LENGTH = 1000;
        static Strings = class {
            static readonly ELEM_ID = "comment";
            static readonly LABEL = "コメント";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static PrText = class {
        static readonly MAX_LENGTH = 20;
        static Strings = class {
            static readonly ELEM_ID = "prText";
            static readonly LABEL = "PR文（配信のサムネに表示されます）";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static Preference = class {
        static readonly MAX_LENGTH = 1000;
        static Strings = class {
            static readonly ELEM_ID = "preference";
            static readonly LABEL = "タイプ";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static Hobby = class {
        static readonly MAX_LENGTH = 1000;
        static Strings = class {
            static readonly ELEM_ID = "hobby";
            static readonly LABEL = "趣味";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static Personality = class {
        static readonly MAX_LENGTH = 1000;
        static Strings = class {
            static readonly ELEM_ID = "personality";
            static readonly LABEL = "性格";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static Job = class {
        static readonly MAX_LENGTH = 1000;
        static Strings = class {
            static readonly ELEM_ID = "job";
            static readonly LABEL = "職業";
            static readonly PLACEHOLDER = "入力してください";
        }
    }
    static BirthDate = class {
        static readonly MAX_VALUE = dayjs(dayjs().add(-18, "year"), DateFormattedProfileItem.DATE_FORMAT);
        static readonly MIN_VALUE = dayjs(dayjs().add(-100, "year"), DateFormattedProfileItem.DATE_FORMAT);
        static Strings = class {
            static readonly ELEM_IDS: [string, string, string] =
                ["birthDateYear", "birthDateMonth", "birthDateDay"];
            static readonly LABELS: [string, string, string] =
                ["誕生日", "_", "_"];
            static readonly PLACEHOLDERS: [string, string, string] =
                ["----", "--", "--"];
            static readonly END_CONTENT_STRINGS: [string, string, string] =
                ["年", "月", "日"];
        }
    }
    static BwhSize = class {
        static readonly MAX_VALUES: [number, number, number] = [999, 999, 999];
        static readonly MIN_VALUES: [number, number, number] = [1, 1, 1];
        static Strings = class {
            static readonly ELEM_IDS: [string, string, string] =
                ["bustSize", "waistSize", "hipSize"];
            static readonly LABELS: [string, string, string] =
                ["スリーサイズ", "_", "_"];
            static readonly PLACEHOLDERS: [string, string, string] =
                ["秘密", " ", " "];
            static readonly START_CONTENT_STRINGS: [string, string, string] =
                ["B", "W", "H"];
        }
    }
    static Height = class {
        static readonly MAX_VALUE = 999;
        static readonly MIN_VALUE = 1;
        static Strings = class {
            static readonly ELEM_ID = "height";
            static readonly LABEL = "身長";
            static readonly PLACEHOLDER = "秘密";
            static readonly END_CONTENT_STRING = "cm";
        }
    }
    static CupSizeType = class {
        static Strings = class {
            static readonly ELEM_ID = "cupSizeType";
            static readonly LABEL = "カップ数";
            static readonly PLACEHOLDER = "選択してください";
        }
    }
    static BloodType = class {
        static Strings = class {
            static readonly ELEM_ID = "bloodType";
            static readonly LABEL = "血液型";
            static readonly PLACEHOLDER = "選択してください";
        }
    }
    static PrefectureType = class {
        static Strings = class {
            static readonly ELEM_ID = "prefectureType";
            static readonly LABEL = "地域";
            static readonly PLACEHOLDER = "選択してください";
        }
    }
    static CharacteristicType = class {
        static Strings = class {
            static readonly ELEM_ID = "characteristicType";
            static readonly LABEL = "特徴";
            static readonly PLACEHOLDER = "秘密";
        }
    }
    static UsageTimeType = class {
        static Strings = class {
            static readonly ELEM_ID = "usageTimeType";
            static readonly LABEL = "出没時間";
            static readonly PLACEHOLDER = "選択してください";
        }
    }
    static UsageFrequencyType = class {
        static Strings = class {
            static readonly ELEM_ID = "usageFrequencyType";
            static readonly LABEL = "出没頻度";
            static readonly PLACEHOLDER = "選択してください";
        }
    }
    static SaveButton = class {
        static Strings = class {
            static readonly LABEL = "保存";
        }
    }
    static ProgressModalInPatching = class {
        static Strings = class {
            static readonly LABEL = "通信中...";
        }
    }
    static ErrorModalInPatching = class {
        static Strings = class {
            static readonly TITLE = "通信エラー";
            static readonly POSITIVE_BUTTON_LABEL = "OK";
        }
    }
    static SucceededModalInPatching = class {
        static Strings = class {
            static readonly TITLE = "更新しました！";
            static readonly MESSAGE = "プロフィールの更新に成功しました！"
            static readonly POSITIVE_BUTTON_LABEL = "OK";
        }
    }
}

class ApiUrl {
    private static readonly API_URL_FETCH_PROFILE = ""; // TODO: 本番用に設定する
    private static readonly API_URL_PATCH_PROFILE = ""; // TODO: 本番用に設定する

    static getFetchProfileUrl() {
        return this.API_URL_FETCH_PROFILE;
    }

    static getPatchProfileUrl() {
        return this.API_URL_PATCH_PROFILE;
    }
}

class InputAutoCompleteType {
    static readonly ON = "on";
    static readonly USERNAME = "username";
}
// #endregion

export default function RootLayout(
): JSX.Element {
    const [isNowFetching, setIsNowFetching] = useState(true);
    const [isNowPatching, setIsNowPatching] = useState(false);
    const [responseStatusInFetching, setResponseStatusInFetching] =
        useState<ResponseStatusInFetching>(ResponseStatusInFetching.OK);
    const [responseStatusInPatching, setResponseStatusInPatching] =
        useState<ResponseStatusInPatching>(ResponseStatusInPatching.OK);
    const [initialUserProfile, setInitialUserProfile] = useState<UserProfile>(UserProfile.DEFAULT_VALUE);
    const [updatedUserProfile, setUpdatedUserProfile] = useState<UserProfile>(UserProfile.DEFAULT_VALUE);
    const [userRawProfileImage, setUserRawProfileImage] = useState<File | undefined>(undefined);
    const [isOpenPatchSucceededModal, setIsOpenPatchSucceededModal] = useState(false);
    const loggedInUserInfo = useContext(LoggedInUserInfoContext);
    const setLoggedInUserInfo = useContext(LoggedInUserInfoSetterContext);

    useEffect(
        () => {
            const fetchProfileAsync = async () => {
                const { status, data } = await fetchProfile()
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
                if (data == null) {
                    // 通信は成功しているが、返却データの変換に失敗している場合
                    setResponseStatusInFetching(ResponseStatusInFetching.OTHERS);
                    return;
                }

                setInitialUserProfile(data);
                setUpdatedUserProfile(data);
                setUserRawProfileImage(undefined);
            };
            fetchProfileAsync();
        },
        []
    );
    useEffect(
        () => {
            // プロフィールの元データ（サーバーから取得したデータ）が変更される度に、クライアント側で保持しているユーザー情報も更新する
            // 初期値の場合は更新しない
            if (initialUserProfile == UserProfile.DEFAULT_VALUE)
                return;
            // クライアント側で保持しているデータが存在する場合のみ更新
            if (loggedInUserInfo != null)
                setLoggedInUserInfo({
                    ...loggedInUserInfo,
                    name: initialUserProfile.name.value,
                });
        },
        [initialUserProfile]
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

    return (
        <div className="relative">
            <div className="grid grid-cols-10 gap-x-6 gap-y-8 px-6 pt-10 pb-24"> {/* Tailwind CSSだとgrid-column-endに負の値を指定できないため、暫定的に10カラム+左右Paddingで対応 */}
                <UserProfileImage
                    elemId={Constants.ProfileImage.Strings.ELEM_ID}
                    profileImage={updatedUserProfile.profileImage}
                    rawProfileImage={userRawProfileImage}
                    fallbackImageUrl={Constants.ProfileImage.FALL_BACK_IMAGE_URL}
                    accept={Constants.ProfileImage.Strings.ACCEPT}
                    onChange={(file) => setUserRawProfileImage(file)}
                />

                <UserSingleLineInputProfileItem
                    elemId={Constants.Nickname.Strings.ELEM_ID}
                    label={Constants.Nickname.Strings.LABEL}
                    value={updatedUserProfile.name.value}
                    placeholder={Constants.Nickname.Strings.PLACEHOLDER}
                    maxLength={Constants.Nickname.MAX_LENGTH}
                    autoComplete={InputAutoCompleteType.USERNAME}
                    isInValid={!updatedUserProfile.validateName()}
                    errorMessage={Constants.Nickname.Strings.ERROR_MESSAGE}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                name: new SingleLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserMultiLineInputProfileItem
                    elemId={Constants.Comment.Strings.ELEM_ID}
                    label={Constants.Comment.Strings.LABEL}
                    value={updatedUserProfile.comment?.value ?? ""}
                    placeholder={Constants.Comment.Strings.PLACEHOLDER}
                    autoComplete={InputAutoCompleteType.ON}
                    maxLength={Constants.Comment.MAX_LENGTH}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                comment: new MultiLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserSingleLineInputProfileItem
                    elemId={Constants.PrText.Strings.ELEM_ID}
                    label={Constants.PrText.Strings.LABEL}
                    value={updatedUserProfile.prText?.value ?? ""}
                    placeholder={Constants.PrText.Strings.PLACEHOLDER}
                    maxLength={Constants.PrText.MAX_LENGTH}
                    autoComplete={InputAutoCompleteType.ON}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                prText: new SingleLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserMultiLineInputProfileItem
                    elemId={Constants.Preference.Strings.ELEM_ID}
                    label={Constants.Preference.Strings.LABEL}
                    value={updatedUserProfile.preference?.value ?? ""}
                    placeholder={Constants.Preference.Strings.PLACEHOLDER}
                    autoComplete={InputAutoCompleteType.ON}
                    maxLength={Constants.Preference.MAX_LENGTH}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                preference: new MultiLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserMultiLineInputProfileItem
                    elemId={Constants.Hobby.Strings.ELEM_ID}
                    label={Constants.Hobby.Strings.LABEL}
                    value={updatedUserProfile.hobby?.value ?? ""}
                    placeholder={Constants.Hobby.Strings.PLACEHOLDER}
                    autoComplete={InputAutoCompleteType.ON}
                    maxLength={Constants.Hobby.MAX_LENGTH}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                hobby: new MultiLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserMultiLineInputProfileItem
                    elemId={Constants.Personality.Strings.ELEM_ID}
                    label={Constants.Personality.Strings.LABEL}
                    value={updatedUserProfile.personality?.value ?? ""}
                    placeholder={Constants.Personality.Strings.PLACEHOLDER}
                    autoComplete={InputAutoCompleteType.ON}
                    maxLength={Constants.Personality.MAX_LENGTH}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                personality: new MultiLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserMultiLineInputProfileItem
                    elemId={Constants.Job.Strings.ELEM_ID}
                    label={Constants.Job.Strings.LABEL}
                    value={updatedUserProfile.job?.value ?? ""}
                    placeholder={Constants.Job.Strings.PLACEHOLDER}
                    autoComplete={InputAutoCompleteType.ON}
                    maxLength={Constants.Job.MAX_LENGTH}
                    onChange={
                        (value) => setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                job: new MultiLineInputProfileItem(value),
                            })
                        ))
                    }
                />

                <UserDateFormattedProfileItem
                    elemIds={Constants.BirthDate.Strings.ELEM_IDS}
                    labels={Constants.BirthDate.Strings.LABELS}
                    value={updatedUserProfile.birthDate?.value}
                    placeholders={Constants.BirthDate.Strings.PLACEHOLDERS}
                    maxValue={Constants.BirthDate.MAX_VALUE}
                    minValue={Constants.BirthDate.MIN_VALUE}
                    endContentStrings={Constants.BirthDate.Strings.END_CONTENT_STRINGS}
                    onChange={(ymdNums) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                birthDate: ymdNums ?
                                    new DateFormattedProfileItem(
                                        DateFormattedProfileItem.toFormattedString(ymdNums)
                                    )
                                    : undefined,
                            })
                        ))
                    }}
                />

                <UserBwhSizeFormattedProfileItem
                    elemIds={Constants.BwhSize.Strings.ELEM_IDS}
                    labels={Constants.BwhSize.Strings.LABELS}
                    value={updatedUserProfile.bwhSize?.value}
                    placeholders={Constants.BwhSize.Strings.PLACEHOLDERS}
                    maxValues={Constants.BwhSize.MAX_VALUES}
                    minValues={Constants.BwhSize.MIN_VALUES}
                    startContentStrings={Constants.BwhSize.Strings.START_CONTENT_STRINGS}
                    onChange={(bwhNums) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                bwhSize: bwhNums ?
                                    new BwhSizeFormattedProfileItem(
                                        BwhSizeFormattedProfileItem.toFormattedString(bwhNums)
                                    )
                                    : undefined,
                            })
                        ))
                    }}
                />

                <UserHeightFormattedProfileItem
                    elemId={Constants.Height.Strings.ELEM_ID}
                    label={Constants.Height.Strings.LABEL}
                    value={updatedUserProfile.height?.value}
                    placeholder={Constants.Height.Strings.PLACEHOLDER}
                    maxValue={Constants.Height.MAX_VALUE}
                    minValue={Constants.Height.MIN_VALUE}
                    endContentString={Constants.Height.Strings.END_CONTENT_STRING}
                    onChange={(value) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                height: value ?
                                    new HeightFormattedProfileItem(value.toString(10))
                                    : undefined,
                            })
                        ))
                    }}
                />

                <UserSingleSelectProfileItem
                    elemId={Constants.CupSizeType.Strings.ELEM_ID}
                    label={Constants.CupSizeType.Strings.LABEL}
                    placeholder={Constants.CupSizeType.Strings.PLACEHOLDER}
                    items={CupSizeProfileItem.values}
                    fallbackItem={CupSizeProfileItem.fallbackValue}
                    selectedItem={updatedUserProfile.cupSizeType}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                cupSizeType: item,
                            })
                        ))
                    }}
                />

                <UserSingleSelectProfileItem
                    elemId={Constants.BloodType.Strings.ELEM_ID}
                    label={Constants.BloodType.Strings.LABEL}
                    placeholder={Constants.BloodType.Strings.PLACEHOLDER}
                    items={BloodTypeProfileItem.values}
                    fallbackItem={BloodTypeProfileItem.fallbackValue}
                    selectedItem={updatedUserProfile.bloodType}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                bloodType: item,
                            })
                        ))
                    }}
                />

                <UserSingleSelectProfileItem
                    elemId={Constants.PrefectureType.Strings.ELEM_ID}
                    label={Constants.PrefectureType.Strings.LABEL}
                    placeholder={Constants.PrefectureType.Strings.PLACEHOLDER}
                    items={PrefectureTypeProfileItem.values}
                    fallbackItem={PrefectureTypeProfileItem.fallbackValue}
                    selectedItem={updatedUserProfile.prefectureType}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                prefectureType: item,
                            })
                        ))
                    }}
                />

                <UserMultiSelectProfileItem
                    elemId={Constants.CharacteristicType.Strings.ELEM_ID}
                    label={Constants.CharacteristicType.Strings.LABEL}
                    placeholder={Constants.CharacteristicType.Strings.PLACEHOLDER}
                    item={CharacteristicTypeListProfileItem.values}
                    selectedItem={updatedUserProfile.characteristicTypeList}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                characteristicTypeList: item,
                            })
                        ))
                    }}
                />

                <UserSingleSelectProfileItem
                    elemId={Constants.UsageTimeType.Strings.ELEM_ID}
                    label={Constants.UsageTimeType.Strings.LABEL}
                    placeholder={Constants.UsageTimeType.Strings.PLACEHOLDER}
                    items={UsageTimeTypeProfileItem.values}
                    fallbackItem={UsageTimeTypeProfileItem.fallbackValue}
                    selectedItem={updatedUserProfile.usageTimeType}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                usageTimeType: item,
                            })
                        ))
                    }}
                />

                <UserSingleSelectProfileItem
                    elemId={Constants.UsageFrequencyType.Strings.ELEM_ID}
                    label={Constants.UsageFrequencyType.Strings.LABEL}
                    placeholder={Constants.UsageFrequencyType.Strings.PLACEHOLDER}
                    items={UsageFrequencyTypeProfileItem.values}
                    fallbackItem={UsageFrequencyTypeProfileItem.fallbackValue}
                    selectedItem={updatedUserProfile.usageFrequencyType}
                    onChange={(item) => {
                        setUpdatedUserProfile((prev) => (
                            UserProfile.toObject({
                                ...prev,
                                usageFrequencyType: item,
                            })
                        ))
                    }}
                />
            </div>

            {/* FIXME: Tailwind CSSだと動的なclassName指定ができないため、448pxの固定値(max-w-md = 448px)で算出(画面のmax-wに変更があった場合は修正すること) */}
            <Button
                className={`fixed z-50 bottom-8 right-[calc(50%_-_448px_/_2)] mx-6`}
                color="primary"
                startContent={<PencilSquareIcon />}
                onPress={() => {
                    const patchProfileAsync = async () => {
                        const { status, data } = await patchProfile(
                            initialUserProfile,
                            updatedUserProfile,
                            userRawProfileImage,
                        ).catch((_error) => {
                            // エラー発生時(JSON変換失敗時など)はCLIENT_ERRORを設定
                            return {
                                status: ResponseStatusInPatching.CLIENT_ERROR.code,
                                data: undefined,
                            };
                        });

                        setIsNowPatching(false);

                        const responseStatus = ResponseStatusInPatching.valueOf(status);
                        setResponseStatusInPatching(responseStatus);
                        if (responseStatus !== ResponseStatusInPatching.OK)
                            return;
                        if (data == null) {
                            // 通信は成功しているが、返却データの変換に失敗している場合
                            setResponseStatusInPatching(ResponseStatusInPatching.OTHERS);
                            return;
                        }

                        // 返却値でプロフィール情報を更新し、ページを開いた時の状態に戻す
                        setInitialUserProfile(data);
                        setUpdatedUserProfile(data);
                        setUserRawProfileImage(undefined);

                        // 成功Modelを表示
                        setIsOpenPatchSucceededModal(true);
                    }

                    setIsNowPatching(true);
                    setResponseStatusInPatching(ResponseStatusInPatching.OK);
                    patchProfileAsync();
                }}
            >
                {Constants.SaveButton.Strings.LABEL}
            </Button>

            <ProgressModal
                isOpenModal={isNowPatching}
                label={Constants.ProgressModalInPatching.Strings.LABEL}
            />

            <ErrorModalInPatching
                title={Constants.ErrorModalInPatching.Strings.TITLE}
                positiveButtonLabel={Constants.ErrorModalInPatching.Strings.POSITIVE_BUTTON_LABEL}
                responseStatus={responseStatusInPatching}
                onCloseModal={() => {
                    // Modalが閉じた場合はレスポンスステータスをOKに
                    setResponseStatusInPatching(ResponseStatusInPatching.OK);
                }}
            />

            <SucceededModalInPatching
                title={Constants.SucceededModalInPatching.Strings.TITLE}
                message={Constants.SucceededModalInPatching.Strings.MESSAGE}
                positiveButtonLabel={Constants.SucceededModalInPatching.Strings.POSITIVE_BUTTON_LABEL}
                isOpenModal={isOpenPatchSucceededModal}
                onCloseModal={() => {
                    setIsOpenPatchSucceededModal(false);
                }}
            />
        </div>
    );
}

function UserProfileImage({
    elemId,
    profileImage,
    rawProfileImage,
    fallbackImageUrl,
    accept,
    onChange,
}: {
    elemId: string,
    profileImage?: ProfileImage,
    rawProfileImage?: File,
    fallbackImageUrl: string,
    accept: string,
    onChange: (file: File | undefined) => void,
}): ReactElement {
    // TODO: ドラッグ＆ドロップでの入力に対応する
    const imageSize = 160;
    const [rawProfileImageUrl, setRawProfileImageUrl] = useState<string | undefined>(undefined);

    useEffect(
        () => {
            if (rawProfileImage == null) {
                setRawProfileImageUrl(undefined);
                return;
            }

            const reader = new FileReader();
            const fetchUrl = async () => {
                const result = await new Promise(resolve => {
                    reader.onload = (e) => resolve(e.target?.result)
                    reader.readAsDataURL(rawProfileImage);
                });
                // FIXME：競合状態が発生する可能性あり
                if (typeof result === "string")
                    setRawProfileImageUrl(result);
            };
            fetchUrl();
        },
        [rawProfileImage]
    );

    return (
        <div className="col-span-full">
            <label
                htmlFor={elemId}
                className="w-[160px] relative mx-auto block overflow-hidden rounded-lg bg-slate-200 shadow-lg shadow-slate-200" // widthは画像サイズと合わせること
            >
                <Image
                    width={imageSize}
                    height={imageSize}
                    src={rawProfileImageUrl ?? (profileImage?.imageUrl ?? fallbackImageUrl)}
                    alt={fallbackImageUrl}
                    fallbackSrc={fallbackImageUrl}
                    radius="none"
                />

                <div
                    className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10"
                />

                <div
                    className="absolute bottom-1.5 right-1.5 z-10 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md"
                >
                    <PencilIcon
                        className="h-5 w-5"
                        aria-hidden="true" />
                </div>

                <Input
                    type="file"
                    id={elemId}
                    name={elemId}
                    className="sr-only absolute inset-0 "
                    fullWidth={false}
                    accept={accept}
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files == null || files.length === 0) {
                            onChange(undefined);
                            return;
                        }

                        const file = files.item(0);
                        if (file == null) {
                            onChange(undefined);
                            return;
                        }

                        onChange(file);
                    }}
                />
            </label>
        </div>
    );
}

function UserSingleLineInputProfileItem({
    elemId,
    label,
    value,
    placeholder,
    maxLength,
    autoComplete,
    isInValid,
    errorMessage,
    onChange,
}: {
    elemId: string,
    label: string,
    value: string,
    placeholder: string,
    maxLength: number,
    autoComplete?: string,
    isInValid?: boolean,
    errorMessage?: string,
    onChange: (value: string) => void,
}): ReactElement {
    return (
        <div className="col-span-full">
            <Input
                type="text"
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                autoComplete={autoComplete}
                isClearable
                fullWidth
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                isInvalid={isInValid}
                errorMessage={isInValid ? errorMessage : undefined}
                onValueChange={(v) => onChange(v)}
            />
        </div>
    );
}

function UserMultiLineInputProfileItem({
    elemId,
    label,
    value,
    placeholder,
    maxLength,
    autoComplete,
    onChange,
}: {
    elemId: string,
    label: string,
    value: string,
    placeholder: string,
    maxLength: number,
    autoComplete?: string,
    onChange: (value: string) => void,
}): ReactElement {
    return (
        <div className="col-span-full">
            <Textarea
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                autoComplete={autoComplete}
                fullWidth
                value={value}
                rows={3}
                minRows={3}
                maxRows={3}
                placeholder={placeholder}
                maxLength={maxLength}
                onValueChange={(v) => onChange(v)}
            />
        </div>
    );
}

function UserDateFormattedProfileItem({
    elemIds,
    labels,
    value,
    placeholders,
    maxValue,
    minValue,
    endContentStrings,
    onChange,
}: {
    elemIds: [string, string, string],
    labels: [string, string, string],
    value?: Dayjs,
    placeholders: [string, string, string],
    maxValue: Dayjs,
    minValue: Dayjs,
    endContentStrings: [string, string, string],
    onChange: (values: [number, number, number] | undefined) => void,
}): ReactElement {
    const fallbackYmdValues = placeholders.map((placeholder) => {
        return { value: -1, label: placeholder }
    });
    const [ymdNums, setYearMonthDate] =
        useState<[number, number, number]>([
            value?.year() ?? fallbackYmdValues[0].value,
            (value?.month() ?? fallbackYmdValues[1].value - 1) + 1,
            value?.date() ?? fallbackYmdValues[2].value,
        ]);

    useEffect(
        () => {
            if (ymdNums.some((elem, index) => elem === fallbackYmdValues[index].value)) {
                // いずれか1つでもFallback用の値の場合
                // Valueが設定されている場合は、Undefinedを指定
                if (value)
                    onChange(undefined);
                return;
            }

            // YYYY-MM-DDの全てが設定されている場合
            onChange(ymdNums);
        },
        [ymdNums]
    );
    useEffect(
        () => {
            // Valueが設定されていない場合は何もしない
            if (value == null) {
                if (ymdNums[0] != fallbackYmdValues[0].value
                    || ymdNums[1] != fallbackYmdValues[1].value
                    || ymdNums[2] != fallbackYmdValues[2].value)
                    setYearMonthDate([
                        fallbackYmdValues[0].value,
                        fallbackYmdValues[1].value,
                        fallbackYmdValues[2].value,
                    ]);
                return;
            }

            // ymdNumsの同期が必要ない場合は何もしない
            if (value.year() === ymdNums[0]
                && value.month() + 1 === ymdNums[1]
                && value.date() === ymdNums[2])
                return;

            // ymdNumsを同期する
            setYearMonthDate([
                value.year(),
                value.month() + 1,
                value.date(),
            ]);
        },
        [value]
    );

    const keyPrefixes = elemIds.map((elemId) => elemId + "-");
    const selectedKeysList = [
        [keyPrefixes[0] + ymdNums[0]],
        [keyPrefixes[1] + ymdNums[1]],
        [keyPrefixes[2] + ymdNums[2]],
    ]
    const itemsList = [
        Array.from(Array(maxValue.year() - minValue.year() + 1).keys(), index => maxValue.year() - index),
        Array.from(Array(12).keys(), index => index + 1),
        Array.from(Array(31).keys(), index => index + 1),
    ];
    const itemsWithFallbackList = [
        [fallbackYmdValues[0], ...(itemsList[0].map((item) => { return { value: item, label: item.toString() } }))],
        [fallbackYmdValues[1], ...(itemsList[1].map((item) => { return { value: item, label: item.toString() } }))],
        [fallbackYmdValues[2], ...(itemsList[2].map((item) => { return { value: item, label: item.toString() } }))],
    ];
    const selectEndContents = endContentStrings.map((endContentString) => {
        return (<span>{endContentString}</span>)
    });
    const classNameList = [
        "col-span-4",
        "col-span-3",
        "col-span-3",
    ];
    const classNamesList = [
        undefined,
        { label: "invisible", },
        { label: "invisible", },
    ]

    const onSelectionChange = (targetIndex: 0 | 1 | 2, keys: Selection) => {
        const updateYmd = (value: number) => {
            setYearMonthDate((prev) => [
                0 === targetIndex ? value : prev[0],
                1 === targetIndex ? value : prev[1],
                2 === targetIndex ? value : prev[2],
            ]);
        };
        if (keys === 'all') {
            // 全てが選択されている場合は、Undefinedを指定
            updateYmd(fallbackYmdValues[targetIndex].value);
            return;
        }

        if (keys.size === 0) {
            updateYmd(fallbackYmdValues[targetIndex].value);
            return;
        }

        const indices = Array.from(keys.values()).map((key) => {
            if (typeof key !== 'string')
                return undefined;
            const index = parseInt(key.replace(keyPrefixes[targetIndex], ""), 10);
            return isNaN(index) ? undefined : index;
        }).filter((index): index is number => index != null)
            .filter((index) => index !== fallbackYmdValues[targetIndex].value); // FallbackItemは除外

        if (indices.length === 0) {
            updateYmd(fallbackYmdValues[targetIndex].value);
            return;
        }

        // 選択されているIndexが複数ある場合は、最初のIndexを指定する
        updateYmd(indices.sort()[0]);
    }

    return (
        <div className="col-span-full grid grid-cols-10 gap-x-3 gap-y-4 content-end">
            {
                ymdNums.map((_ymdNum, index) => (
                    <UserDateFormattedProfileItemChild
                        key={elemIds[index]}
                        className={classNameList[index]}
                        classNames={classNamesList[index]}
                        elemId={elemIds[index]}
                        label={labels[index]}
                        placeholder={placeholders[index]}
                        selectedKeys={selectedKeysList[index]}
                        endContent={selectEndContents[index]}
                        items={itemsWithFallbackList[index]}
                        keyPrefix={keyPrefixes[index]}
                        onSelectionChange={(keys) => onSelectionChange(index as 0 | 1 | 2, keys)} // FIXME: asで変換していて型安全ではないので要修正
                    />
                ))
            }
        </div>
    );
}

function UserDateFormattedProfileItemChild({
    className,
    classNames,
    elemId,
    label,
    placeholder,
    selectedKeys,
    endContent,
    items,
    keyPrefix,
    onSelectionChange,
}: {
    className: string,
    classNames?: SlotsToClasses<SelectSlots>,
    elemId: string,
    label: string,
    placeholder: string,
    selectedKeys: string[],
    endContent: ReactElement,
    items: { value: number, label: string }[],
    keyPrefix: string,
    onSelectionChange: (keys: Selection) => void,
}): ReactElement {
    return (
        <Select
            className={className}
            classNames={classNames}
            name={elemId}
            id={elemId}
            label={label}
            labelPlacement="outside"
            fullWidth={false}
            placeholder={placeholder}
            selectionMode="single"
            selectedKeys={selectedKeys}
            endContent={endContent}
            items={items}
            onSelectionChange={onSelectionChange}
        >
            {(item) =>
                <SelectItem
                    key={keyPrefix + item.value}
                    value={keyPrefix + item.value}>
                    {item.label}
                </SelectItem>
            }
        </Select>
    );
}

function UserBwhSizeFormattedProfileItem({
    elemIds,
    labels,
    value,
    placeholders,
    maxValues,
    minValues,
    startContentStrings,
    onChange,
}: {
    elemIds: [string, string, string],
    labels: [string, string, string],
    value?: BwhSize,
    placeholders: [string, string, string],
    maxValues: [number, number, number],
    minValues: [number, number, number],
    startContentStrings: [string, string, string],
    onChange: (value: BwhSize | undefined) => void,
}): ReactElement {
    const [bwhNums, setBwhNums] =
        useState<[number | undefined, number | undefined, number | undefined]>(
            value ?? [undefined, undefined, undefined]
        );

    useEffect(
        () => {
            const nums = bwhNums.filter((elem): elem is number => elem != null);
            if (nums.length < 3) {
                // いずれか1つでもUndefinedの場合
                // Valueが設定されている場合は、Undefinedを指定
                if (value)
                    onChange(undefined);
                return;
            }

            // B-W-Hの全てが設定されている場合
            onChange([nums[0], nums[1], nums[2]]);
        },
        [bwhNums]
    );
    useEffect(
        () => {
            // Valueが設定されていない場合は何もしない
            if (value == null) {
                if (bwhNums[0] != null
                    || bwhNums[1] != null
                    || bwhNums[2] != null)
                    setBwhNums([undefined, undefined, undefined]);
                return;
            }

            // bwhNumsの同期が必要ない場合は何もしない
            if (value[0] === bwhNums[0]
                && value[1] === bwhNums[1]
                && value[2] === bwhNums[2])
                return;

            // bwhNumsを同期する
            setBwhNums([...value]);
        },
        [value]
    )

    const inputStartContents = startContentStrings.map((startContentString) => {
        return (<span>{startContentString}</span>)
    });
    const classNamesList = [
        undefined,
        { label: "invisible", },
        { label: "invisible", },
    ]

    const onValueChange = (targetIndex: 0 | 1 | 2, valueStr: string) => {
        const updateYmd = (valueNum: number | undefined) => {
            setBwhNums((prev) => [
                0 === targetIndex ? valueNum : prev[0],
                1 === targetIndex ? valueNum : prev[1],
                2 === targetIndex ? valueNum : prev[2],
            ]);
        };
        const num = parseInt(valueStr, 10);
        if (isNaN(num)) {
            updateYmd(undefined);
            return;
        }
        // 最大値・最小値を超えている場合は、最大値・最小値を指定する
        updateYmd(Math.min(Math.max(num, minValues[targetIndex]), maxValues[targetIndex]));
    }

    return (
        <div className="col-span-full grid grid-cols-3 gap-x-3 gap-y-4 content-end">
            {
                bwhNums.map((_bwhNum, index) => (
                    <UserBwhSizeFormattedProfileItemChild
                        key={elemIds[index]}
                        className="col-span-1"
                        classNames={classNamesList[index]}
                        elemId={elemIds[index]}
                        label={labels[index]}
                        value={bwhNums[index]?.toString(10) ?? ""}
                        maxValue={maxValues[index]}
                        minValue={minValues[index]}
                        placeholder={placeholders[index]}
                        startContent={inputStartContents[index]}
                        onValueChange={(v) => onValueChange(index as 0 | 1 | 2, v)} // FIXME: asで変換していて型安全ではないので要修正
                    />
                ))
            }
        </div>
    );
}

function UserBwhSizeFormattedProfileItemChild({
    className,
    classNames,
    elemId,
    label,
    value,
    maxValue,
    minValue,
    placeholder,
    startContent,
    onValueChange,
}: {
    className: string,
    classNames?: SlotsToClasses<InputSlots>,
    elemId: string,
    label: string,
    value: string,
    maxValue: number,
    minValue: number,
    placeholder: string,
    startContent: ReactElement,
    onValueChange: (value: string) => void,
}): ReactElement {
    return (
        <Input
            className={className}
            classNames={classNames}
            type="number"
            name={elemId}
            id={elemId}
            label={label}
            labelPlacement="outside"
            fullWidth={false}
            value={value}
            max={maxValue}
            min={minValue}
            placeholder={placeholder}
            startContent={startContent}
            onValueChange={onValueChange}
        />
    );
}

function UserHeightFormattedProfileItem({
    elemId,
    label,
    value,
    placeholder,
    maxValue,
    minValue,
    endContentString,
    onChange,
}: {
    elemId: string,
    label: string,
    value?: number,
    placeholder: string,
    maxValue: number,
    minValue: number,
    endContentString: string,
    onChange: (value: number | undefined) => void,
}): ReactElement {
    return (
        <div className="col-span-full">
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
                onValueChange={(v) => {
                    const num = parseInt(v, 10);
                    if (isNaN(num)) {
                        onChange(undefined);
                        return;
                    }

                    onChange(Math.min(Math.max(num, minValue), maxValue));
                }}
            />
        </div>
    );
}

function UserSingleSelectProfileItem({
    elemId,
    label,
    placeholder,
    items,
    fallbackItem,
    selectedItem,
    onChange,
}: {
    elemId: string,
    label: string,
    placeholder: string,
    items: SingleSelectProfileItem[],
    fallbackItem?: SingleSelectProfileItem,
    selectedItem?: SingleSelectProfileItem,
    onChange: (selected: SingleSelectProfileItem | undefined) => void,
}): ReactElement {
    if (items.length === 0) {
        return (<div />);
    }

    const keyPrefix = elemId + "-";
    const selectedKeys = selectedItem
        ? [keyPrefix + selectedItem.value]
        : (fallbackItem ? [keyPrefix + fallbackItem.value] : []);
    const itemsWithFallback = fallbackItem ? [fallbackItem, ...items] : items;
    return (
        <div className="col-span-full">
            <Select
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                fullWidth
                placeholder={placeholder}
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={(keys) => {
                    if (keys === 'all') {
                        // 全てが選択されている場合は、Undefinedを指定
                        onChange(undefined);
                        return;
                    }

                    if (keys.size === 0) {
                        onChange(undefined);
                        return;
                    }

                    const indices = Array.from(keys.values()).map((key) => {
                        if (typeof key !== 'string')
                            return undefined;
                        const index = parseInt(key.replace(keyPrefix, ""), 10);
                        return isNaN(index) ? undefined : index;
                    }).filter((index): index is number => index != null)
                        .filter((index) => index !== fallbackItem?.value); // FallbackItemは除外

                    if (indices.length === 0) {
                        onChange(undefined);
                        return;
                    }

                    // 選択されているIndexが複数ある場合は、最初のIndexを指定する
                    const firstIndex = indices.sort()[0];
                    onChange(items.find((element) => element.value === firstIndex));
                }}
            >
                {itemsWithFallback.map((profileItem) => (
                    <SelectItem
                        key={keyPrefix + profileItem.value}
                        value={keyPrefix + profileItem.value}
                    >
                        {profileItem.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}

function UserMultiSelectProfileItem({
    elemId,
    label,
    placeholder,
    item,
    selectedItem,
    onChange,
}: {
    elemId: string,
    label: string,
    placeholder: string,
    item: MultiSelectProfileItem,
    selectedItem?: MultiSelectProfileItem,
    onChange: (selected: MultiSelectProfileItem | undefined) => void,
}): ReactElement {
    if (item.value.length === 0) {
        return (<div />);
    }

    const keyPrefix = elemId + "-";
    const selectedKey = selectedItem
        ? selectedItem.value.map((selected) => keyPrefix + selected.value)
        : [];
    return (
        <div className="col-span-full">
            <Select
                name={elemId}
                id={elemId}
                label={label}
                labelPlacement="outside"
                fullWidth
                placeholder={placeholder}
                selectionMode="multiple"
                selectedKeys={selectedKey}
                onSelectionChange={(keys) => {
                    if (keys === 'all') {
                        // 全てが選択されている場合は、全てのアイテムを返却
                        onChange(item);
                        return;
                    }

                    if (keys.size === 0) {
                        onChange(undefined);
                        return;
                    }

                    const indices = Array.from(keys.values()).map((key) => {
                        if (typeof key !== 'string')
                            return undefined;
                        const index = parseInt(key.replace(keyPrefix, ""), 10);
                        return isNaN(index) ? undefined : index;
                    }).filter((index): index is number => index != null);

                    if (indices.length === 0) {
                        onChange(undefined);
                        return;
                    }

                    const selecteds = indices.sort().map((index) => item.value.find((element) => element.value === index))
                        .filter((selected): selected is SingleSelectProfileItem => selected != null);
                    onChange(new MultiSelectProfileItem(selecteds));
                }}
            >
                {item.value.map((profileItem) => (
                    <SelectItem
                        key={keyPrefix + profileItem.value}
                        value={keyPrefix + profileItem.value}
                    >
                        {profileItem.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
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

function ErrorModalInPatching({
    title,
    positiveButtonLabel,
    responseStatus,
    onCloseModal,
}: {
    title: string,
    positiveButtonLabel: string,
    responseStatus: ResponseStatusInPatching,
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
            if (responseStatus !== ResponseStatusInPatching.OK)
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
                        <ModalBody>
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

function SucceededModalInPatching({
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
                        <ModalBody>
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

// #region API関連 FIXME: 他のファイルに移動する
async function fetchProfile(
): Promise<{
    status: number,
    data?: UserProfile,
}> {
    const response = await fetch(
        ApiUrl.getFetchProfileUrl(),
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

    const data = UserProfile.toObjectFromJson(await response.json());
    return {
        status: response.status,
        data: data,
    };
}

async function patchProfile(
    initUserProfile: UserProfile,
    updatedUserProfile: UserProfile,
    rawProfileImage?: File,
): Promise<{
    status: number,
    data?: UserProfile,
}> {
    // 無効な値が存在する場合
    if (!updatedUserProfile.validate())
        return {
            status: ResponseStatusInPatching.CONTAINED_INVALID_ITEM.code,
        };

    const requestBody: Record<string, string | null> = {};

    const initUserProfileEntiries = Object.entries(initUserProfile)
        .filter(([key, value]) => value != null);
    const initUserProfileKeys = initUserProfileEntiries.map(([key]) => key);
    const updatedUserProfileEntiries = Object.entries(updatedUserProfile)
        .filter(([key, value]) => value != null);
    const updatedUserProfileKeys = updatedUserProfileEntiries.map(([key]) => key);
    initUserProfileEntiries.forEach(([key, value]) => {
        // BaseProfileItem以外(プロフィール画像)は別途処理する
        if (!(value instanceof BaseProfileItem))
            return;

        if (!updatedUserProfileKeys.includes(key)) {
            // 更新後のプロフィール情報に存在しない場合は、削除リクエストを送信
            requestBody[convertCamelToSnake(key)] = HttpRequest.FORM_DATA_VALUE_NULL;
            return;
        }

        // どちらにも存在する場合は、更新されている場合のみ情報を送信
        const updatedUserProfileValue = updatedUserProfileEntiries
            .find(([updatedUserProfileKey]) => updatedUserProfileKey === key)?.[1];
        if (!(updatedUserProfileValue instanceof BaseProfileItem))
            return; // 更新後の値が不正なものの場合はcontinue(ここに到達することはないはず)

        // 更新前の値と更新後の値が同じ場合は、更新リクエストを送信しない
        if (value.toString() === updatedUserProfileValue.toString())
            return;

        requestBody[convertCamelToSnake(key)] = updatedUserProfileValue.toString();
    });
    updatedUserProfileEntiries.forEach(([key, value]) => {
        // BaseProfileItem以外(プロフィール画像)は別途処理する
        if (!(value instanceof BaseProfileItem))
            return;

        // 更新前のプロフィール情報に存在する場合は、既に処理済みなのでcontinue
        if (initUserProfileKeys.includes(key))
            return;

        // 更新後のプロフィール情報にのみ存在する場合は、更新リクエストを送信
        requestBody[convertCamelToSnake(key)] = value.toString();
    });

    if (rawProfileImage)
        requestBody[UserProfile.API_REQUEST_KEY_RAW_PROFILE_IMAGE] =
            await convertFileToBase64EncodedStr(rawProfileImage);

    // 更新情報が存在しない場合は、更新なしエラーを返却
    if (Object.keys(requestBody).length === 0)
        return {
            status: ResponseStatusInPatching.EMPTY_REQUEST.code,
        };

    const response = await fetch(
        ApiUrl.getPatchProfileUrl(),
        {
            method: HttpRequest.METHOD_TYPE.PATCH,
            headers: {
                [HttpRequest.HEADER_KEY_TYPE.ACCEPT]: HttpRequest.CONTENT_TYPE.JSON,
                [HttpRequest.HEADER_KEY_TYPE.CONTENT_TYPE]: HttpRequest.CONTENT_TYPE.JSON,
            },
            body: JSON.stringify(requestBody),
            cache: "no-cache",
        }
    );

    if (!response.ok)
        return {
            status: response.status,
        };

    const data = UserProfile.toObjectFromJson(await response.json());
    return {
        status: response.status,
        data: data,
    };
}

async function convertFileToBase64EncodedStr(
    file: File,
): Promise<string> {
    // [参考]{@link https://zenn.dev/takaodaze/articles/74ac1684a7d1d2}
    let binaryString = "";
    const bytes = new Uint8Array(await file.arrayBuffer());
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
}
// #endregion