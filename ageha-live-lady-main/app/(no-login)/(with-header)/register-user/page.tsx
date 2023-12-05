"use client"

// status code確認方法 {
//     200: 正常動作
//     400: name欄に「error」
//     409: email欄に「duplicate」
//     415: image欄に「invalid」
// }

import { useState } from "react"
import Image from 'next/image'
import Styles from "./page.module.css"
import { RadioGroup } from '@headlessui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useAuthenticator } from "@aws-amplify/ui-react"
import { CircularProgress } from "@nextui-org/react"
import { redirect } from "next/navigation"
import RouteUrls from "@/app/_constants/RouteUrls"

const boolean_list = [
    { id: 1, name: 'なし', value: false },
    { id: 2, name: 'あり', value: true },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

type FormData = {
    name: string;
    birthDate: string;
    eMailAddress: string;
    phoneNumber: string;
    wifi: Boolean;
    liver: Boolean;
    idCardImageFront: BinaryData;
    idCardImageBack: BinaryData;
    idCardImageWithFace: BinaryData;
    message: string
}

async function main(elm: { data: FormData }) {
    const result = await fetch(process.env.apiBaseUrl + "/liver/registration-info-list", {
        method: "POST",
        body: JSON.stringify({
            "name": elm.data.name,
            "birth_date": elm.data.birthDate,
            "email_address": elm.data.eMailAddress,
            "phone_number": elm.data.phoneNumber,
            "is_access_from_wifi": elm.data.wifi,
            "has_already_been_liver": elm.data.liver,
            "id_card_image": elm.data.idCardImageFront
            // ToDo 身分証明書（表面、裏面、顔付き）の３つがアップロードできる受け口を作ること

            // 415を出したい時以下を用いる
            // ToDo: AWSの画像保存先パスが決まり次第、"id_card_image"を削除
            // "id_card_image": "invalid"
        })
    })

    return result.status
}

export default function RegisterUserPage() {
    const [isAccessFromWifi, setIsAccessFromWifi] = useState<Boolean>(boolean_list[0].value)
    const [hasAlreadyBeenLiver, setHasAlreadyBeenLiver] = useState<Boolean>(boolean_list[0].value)
    const [errMessage, setErr] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
        data.wifi = isAccessFromWifi
        data.liver = hasAlreadyBeenLiver
        
        // ToDo: async await を用いたレスポンスの受け取り方にして？
        main({ data }).then((response) => {
            switch (response) {
                // ToDo エラーメッセージをフロントorバックエンドから返すのか、決まり次第処理を変える必要あり
                case 400:
                    setErr("400エラーだぞっ！");
                    break;
                case 409:
                    setErr("409エラーだぞっ！");
                    break;
                case 415:
                    setErr("415エラーだぞっ！");
                    break;
                default:
                    console.log("200だぞ");
                    setErr("");
                    break;
            }
        })
    }

    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    // Authenticatorが読み込み中の場合はローディング表示
    if (authStatus === 'configuring')
        return (
            <div className="flex flex-column justify-center content-center grow mx-3 my-6">
                <CircularProgress color="primary" size="lg" aria-label="通信中..." />
            </div>
        );
    // ログイン済みの場合はホーム画面にリダイレクト
    if (authStatus === 'authenticated')
        redirect(RouteUrls.HOME);

    return (
        <div className={Styles.maxWidth}>
            <h1 className={Styles.formTitle}>応募フォーム</h1>
            {errMessage !== "" && (
                <div className={Styles.errMessArea}>
                    <h3>{errMessage}</h3>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-20">
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">

                        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                            {/* 名前 */}
                            <div className="sm:col-span-4">
                                <label htmlFor="username" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    名前
                                </label>
                                <div className="mt-1">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <input
                                            type="text"
                                            id="name"
                                            {...register('name', {
                                                required: {
                                                    value: true,
                                                    message: '入力が必須の項目です。',
                                                },
                                            })}
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="山田　花子"
                                        />
                                    </div>
                                </div>
                                {errors.name?.type === 'required' && (<div>{errors.name.message}</div>)}
                            </div>

                            {/* 生年月日 */}
                            <div className="sm:col-span-4">
                                <label htmlFor="birthDae" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    生年月日
                                </label>
                                <div className="mt-1 dis_flex">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <input
                                            type="date"
                                            // name="birthDate"
                                            id="birthDate"
                                            {...register('birthDate', {
                                                required: {
                                                    value: true,
                                                    message: '入力が必須の項目です。',
                                                },
                                            })}
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="○○○○年○○月○○日"
                                        />
                                    </div>
                                </div>
                                {errors.birthDate?.type === 'required' && (<div>{errors.birthDate.message}</div>)}
                            </div>

                            {/* メールアドレス */}
                            <div className="sm:col-span-4">
                                <label htmlFor="mail_address" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    メールアドレス
                                </label>
                                <div className="mt-1 dis_flex">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <input
                                            type="text"
                                            id="email"
                                            {...register('eMailAddress', {
                                                required: {
                                                    value: true,
                                                    message: '入力が必須の項目です。',
                                                },
                                                pattern: {
                                                    value: /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                                                    message: 'メールフォーマットに誤りがあります',
                                                }
                                            })}
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="sample@gmail.com"
                                        />
                                    </div>
                                </div>
                                {errors.eMailAddress?.type === 'required' && (<div>{errors.eMailAddress.message}</div>)}
                                {errors.eMailAddress?.type === 'pattern' && (<div>{errors.eMailAddress.message}</div>)}
                            </div>

                            {/* 電話番号 */}
                            <div className="sm:col-span-4">
                                <label htmlFor="phone_number" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    電話番号
                                </label>
                                <div className="mt-1 dis_flex">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <input
                                            type="text"
                                            id="phone_number"
                                            {...register('phoneNumber', {
                                                required: {
                                                    value: true,
                                                    message: '入力が必須の項目です。',
                                                },
                                                minLength: {
                                                    value: 9,
                                                    message: '9桁以上で入力してください',
                                                },
                                                maxLength: {
                                                    value: 11,
                                                    message: '11桁以下で入力してください',
                                                },
                                                pattern: {
                                                    value: /^[0-9]*$/,
                                                    message: '数字のみを入力してください',
                                                }
                                            })}
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="00011112222"
                                        />
                                    </div>
                                </div>
                                {errors.phoneNumber?.type === 'required' && (<div>{errors.phoneNumber.message}</div>)}
                                {errors.phoneNumber?.type === 'minLength' && (<div>{errors.phoneNumber.message}</div>)}
                                {errors.phoneNumber?.type === 'maxLength' && (<div>{errors.phoneNumber.message}</div>)}
                                {errors.phoneNumber?.type === 'pattern' && (<div>{errors.phoneNumber.message}</div>)}
                            </div>

                            {/* Wi-Fiの有無 */}
                            <div className="sm:col-span-4 ralative">
                                <label htmlFor="wifi" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    Wi-Fiの有無
                                </label>

                                <RadioGroup value={isAccessFromWifi} onChange={setIsAccessFromWifi}>
                                    <div className="mt-1 relative -space-y-px rounded-md bg-white">
                                        {boolean_list.map((elm, planIdx) => (
                                            <RadioGroup.Option
                                                key={elm.id}
                                                value={elm.value}
                                                className={({ checked }) =>
                                                    classNames(
                                                        planIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                                        planIdx === boolean_list.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                                                        checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                                                        'relative flex cursor-pointer flex-col border p-4 focus:outline-none md:grid md:grid-cols-3 md:pl-4 md:pr-6'
                                                    )
                                                }
                                            >
                                                {({ active, checked }) => (
                                                    <>
                                                        <span className="flex items-center text-sm">
                                                            <span
                                                                className={classNames(
                                                                    checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                                                    active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
                                                                    'h-4 w-4 rounded-full border flex items-center justify-center'
                                                                )}
                                                                aria-hidden="true"
                                                            >
                                                                <span className="rounded-full bg-white w-1.5 h-1.5" />
                                                            </span>
                                                            <RadioGroup.Label
                                                                as="span"
                                                                className={classNames(checked ? 'text-indigo-900' : 'text-gray-900', 'ml-3 font-medium')}
                                                            >
                                                                {elm.name}
                                                            </RadioGroup.Label>
                                                        </span>
                                                    </>
                                                )}
                                            </RadioGroup.Option>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* ライバー経験 */}
                            <div className="sm:col-span-4 ralative">
                                <label htmlFor="been_liver" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    ライバー経験
                                </label>

                                <RadioGroup value={hasAlreadyBeenLiver} onChange={setHasAlreadyBeenLiver}>
                                    <div className="mt-1 relative -space-y-px rounded-md bg-white">
                                        {boolean_list.map((elm, planIdx) => (
                                            <RadioGroup.Option
                                                key={elm.id}
                                                value={elm.value}
                                                className={({ checked }) =>
                                                    classNames(
                                                        planIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                                        planIdx === boolean_list.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                                                        checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200',
                                                        'relative flex cursor-pointer flex-col border p-4 focus:outline-none md:grid md:grid-cols-3 md:pl-4 md:pr-6'
                                                    )
                                                }
                                            >
                                                {({ active, checked }) => (
                                                    <>
                                                        <span className="flex items-center text-sm">
                                                            <span
                                                                className={classNames(
                                                                    checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                                                                    active ? 'ring-2 ring-offset-2 ring-indigo-600' : '',
                                                                    'h-4 w-4 rounded-full border flex items-center justify-center'
                                                                )}
                                                                aria-hidden="true"
                                                            >
                                                                <span className="rounded-full bg-white w-1.5 h-1.5" />
                                                            </span>
                                                            <RadioGroup.Label
                                                                as="span"
                                                                className={classNames(checked ? 'text-indigo-900' : 'text-gray-900', 'ml-3 font-medium')}
                                                            >
                                                                {elm.name}
                                                            </RadioGroup.Label>
                                                        </span>
                                                    </>
                                                )}
                                            </RadioGroup.Option>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* ToDo: ファイル保存フォーマットにあった渡し方に変更する必要がある */}
                            {/* 身分証登録 */}
                            <div className="sm:col-span-4">
                                <label htmlFor="id_card_image" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    身分証明書
                                </label>
                                <div className="mt-1 dis_flex">
                                    <div className="relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <h4 className={Styles.identSubTitle}>⚪️ 本人確認書類おもて面</h4>
                                        <img
                                            src="/images/driver_license.png"
                                            alt=""
                                            className={Styles.frontIdentification}
                                        />
                                        <div className={Styles.validIdentification}>
                                            <h4>【有効な本人確認書類】</h4>
                                            <ul>
                                                <li>・運転免許証</li>
                                                <li>・マイナンバーカード（顔付き）</li>
                                                <li>・住民基本台帳カード（顔付き）</li>
                                                <li>・パスポート</li>
                                            </ul>
                                        </div>
                                        <div className="">
                                            <input
                                                type="file"
                                                id="front_file_name"
                                                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                placeholder="ファイルを選択"
                                                accept="image/*"
                                                {...register('idCardImageFront')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 dis_flex">
                                    <div className="rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <h4 className={Styles.identSubTitle}>⚪️ 本人確認書類裏面</h4>
                                        <img
                                            src="/images/driver_license_rear.png"
                                            alt=""
                                            className={Styles.rearIdentification}
                                        />
                                        <div className={Styles.alertIdentification}>
                                            <p>【注意】マイナンバーカードでの登録の場合、個人番号が記入されている裏面は送付しないでください。</p>
                                        </div>
                                        <input
                                            type="file"
                                            id="file_name"
                                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                            placeholder="ファイルを選択"
                                            accept="image/*"
                                            {...register('idCardImageBack')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 身分証明書＋顔つき */}
                            {/* ToDo: ファイル保存フォーマットにあった渡し方に変更する必要がある */}
                            <div className="sm:col-span-4">
                                <label htmlFor="id_card_image" className={classNames(Styles.elmTitle, "block text-sm font-medium leading-6 text-gray-900")}>
                                    顔＋身分証明書
                                </label>
                                <div className="mt-1 dis_flex">
                                    <div className="rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                        <img
                                            src="/images/face_with_license.png"
                                            alt=""
                                            className={Styles.faceIdentification}
                                        />
                                        <div className="text-center">
                                            <input
                                                type="file"
                                                id="file_name"
                                                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                placeholder="ファイルを選択"
                                                accept="image/*"
                                                {...register('idCardImageWithFace')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-x-6">
                    <button
                        type="submit"
                        className={classNames(Styles.width40, "rounded-md bg-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600")}
                    >
                        登録に進む
                    </button>
                </div>
            </form>
        </div>
    )
}