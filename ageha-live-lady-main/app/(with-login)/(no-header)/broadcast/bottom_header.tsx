"use client"

import IVSBroadcastClient, { AmazonIVSBroadcastClient } from "amazon-ivs-web-broadcast"
import { ChatMessage, ChatRoom, ChatToken, ConnectionState, DisconnectUserRequest, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import { MutableRefObject, RefObject, useEffect, useRef, useState } from "react"
import BottomStyles from "./bottom_header.module.css"
import React from "react";

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

// スリープ関数
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

type Props = {
    ivsBroadcastClient: any
    isCasting: string
    tokenForViewerChatRoom: string | undefined
    tokenForAdminChatRoom: string | undefined
    videoRef: RefObject<HTMLVideoElement>
    audioTrackRef: MutableRefObject<MediaStreamTrack | null>
    videoTrackRef: MutableRefObject<MediaStreamTrack | null>
}

export function BottomHeader(props: Props) {
    // リアルタイムで、新規チャットが存在する場合、イベントリスナーで取得
    const reversedChatElm = chatElm.reverse()

    // 視聴者とのメッセージモーダルの表示 / 非表示処理
    const [isOpenMessageModal, setOpenMessageModal] = useState<boolean>(false)
    const getMessageModal = async () => {
        // チャット履歴取得API的な？
        if (isOpenMessageModal === false && props.isCasting !== "準備中") { // モーダル閉じている時
            // 他のモーダルを閉じる
            setAudienceKickModal(false)
            setInquiryModal(false)
            setOpenMessageModal(true)

        } else if (isOpenMessageModal === true) { // モーダル開いている時
            setOpenMessageModal(false)
        }
    }

    // 視聴者のキックモーダル
    const [isOpenAudienceKickModal, setAudienceKickModal] = useState<boolean>(false)
    const getAudienceModal = async () => {
        if (isOpenAudienceKickModal === false && props.isCasting !== "準備中") { // モーダル閉じている時
            // 他のモーダルを閉じる
            setOpenMessageModal(false)
            setInquiryModal(false)
            setAudienceKickModal(true)
        } else if (isOpenAudienceKickModal === true) { // モーダル開いている時
            setAudienceKickModal(false)
        }
    }
    // 視聴者のキック処理
    const userKickClick = (userID: any) => {
        console.log(userID)
        const request = new DisconnectUserRequest(userID, 'Reason for disconnecting user');
        props.ivsBroadcastClient.disconnectUser(request)
        // const unsubscribeOnDisconnectUser = chatRoom?.addListener('userDisconnect', userID)
        // console.log(unsubscribeOnDisconnectUser)
    }

    // 運営とのやり取りのモーダル
    const [isOpenInquiryModal, setInquiryModal] = useState<boolean>(false)
    const getInquiryModal = async () => {
        if (isOpenInquiryModal === false && props.isCasting !== "準備中") { // モーダル閉じている時
            // 他のモーダルを閉じる
            setOpenMessageModal(false)
            setAudienceKickModal(false)
            setInquiryModal(true)

            // const request = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request)
            // await sleep(1000)
            // const request1 = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request1)
            // await sleep(1000)
            // const request2 = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request2)
            // await sleep(1000)
            // const request3 = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request3)
            // await sleep(1000)
            // const request4 = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request4)
            // await sleep(1000)
            // const request5 = new SendMessageRequest("コメントの送信テストです。")
            // chatRoomWithOperation?.sendMessage(request5)
            // await sleep(1000)
        } else if (isOpenInquiryModal === true) { // モーダル開いている時
            setInquiryModal(false)
        }
    }

    // カメラのON / OFF処理
    const [isCameraStream, setIsCamera] = useState<boolean>(false)
    const [countCameraStream, setCountCamera] = useState<number>(0)
    async function getCameraStream() {
        const videoStream = await navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: {
                    width: {
                        ideal: IVSBroadcastClient.STANDARD_PORTRAIT.maxResolution.width,
                        max: IVSBroadcastClient.STANDARD_PORTRAIT.maxResolution.width,
                    },
                    height: {
                        ideal: IVSBroadcastClient.STANDARD_PORTRAIT.maxResolution.height,
                        max: IVSBroadcastClient.STANDARD_PORTRAIT.maxResolution.height,
                    },
                },
            })

        if (props.videoRef.current !== null) {
            props.audioTrackRef.current = videoStream.getAudioTracks()[0]
            props.videoTrackRef.current = videoStream.getVideoTracks()[0]
            props.videoRef.current.srcObject = new MediaStream()
            props.videoRef.current.srcObject.addTrack(videoStream.getAudioTracks()[0])
            props.videoRef.current.srcObject.addTrack(videoStream.getVideoTracks()[0])
        }

        // ToDo カメラのオンオフ機能リリース時にコメントアウト外す

        // if (isCameraStream === false) {
        //     setIsCamera(true)
        //     if ( countCameraStream === 0 ) { 
        //         // ストリームにデバイスを追加する
        //         ivsBroadcastClient.current.addVideoInputDevice(videoStream, "video_taro", {index: 0})
        //         setCountCamera(countCameraStream + 1)
        //     } else {
        //         const videoStream = ivsBroadcastClient.current.getVideoInputDevice("video_taro")?.source
        //         videoStream.getVideoTracks()[0].enabled = true
        //         setCountCamera(countCameraStream + 1)
        //     }
        // } else if ( isCameraStream === true ) {
        //     setIsCamera(false)
        //     const videoStream = ivsBroadcastClient.current.getVideoInputDevice("video_taro")?.source
        //     videoStream.getVideoTracks()[0].enabled = false
        // }
    }

    // マイクのON / OFF 処理
    const [isAudioStream, setIsAudio] = useState<boolean>(false)
    const [countAudioStream, setCountAudio] = useState<number>(0)
    const getAudioStream = async () => {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        })

        if (isAudioStream === false) { // マイクオフの場合
            setIsAudio(true)
            if (countAudioStream === 0) { // 初めてマイクをオンにする場合
                props.ivsBroadcastClient.current?.addAudioInputDevice(audioStream, "audio")
                setCountAudio(countAudioStream + 1)
            } else { // ２回目以降マイクをオン
                const audioStream = props.ivsBroadcastClient.current?.getAudioInputDevice("audio")
                audioStream.getAudioTracks()[0].enabled = true
                setCountAudio(countAudioStream + 1)
            }
        } else if (isAudioStream === true) { // マイクオンの場合
            setIsAudio(false)
            const audioStream = props.ivsBroadcastClient.current?.getAudioInputDevice("audio")
            audioStream.getAudioTracks()[0].enabled = false
        }
    }

    // 運営チャットルーム
    const [chatRoomWithOperation, setChatRoomWithOpe] = useState<ChatRoom | null>(null)
    // 運営とのメッセージ
    const [messagesForOperation, setMessageForOpe] = useState<ChatMessage[]>([])
    useEffect(() => {
        const unsubscribeOnConnecting = chatRoomWithOperation?.addListener('connecting', () => {
            console.log("🔥connecting")
        })
        const unsubscribeOnConnected = chatRoomWithOperation?.addListener('connect', () => {
            console.log("🔥connect")
        })
        const unsubscribeOnDisconnected = chatRoomWithOperation?.addListener('disconnect', () => {
            console.log("🔥disconnect")
        })
        const unsubscribeOnMessageReceived = chatRoomWithOperation?.addListener('message', (message) => {
            console.log(message)
            setMessageForOpe((msgs) => [message, ...msgs]);
        })
        const unsubscribeOnEventReceived = chatRoomWithOperation?.addListener('event', (event) => {
            console.log("🔥event", event)
        })

        chatRoomWithOperation?.connect()

        return () => {
            unsubscribeOnConnecting?.()
            unsubscribeOnConnected?.()
            unsubscribeOnDisconnected?.()
            unsubscribeOnMessageReceived?.()
            unsubscribeOnEventReceived?.()
        }
    }, [chatRoomWithOperation])
    const connectChatRoomWithOperation = async (token: string) => {
        const promiseRoomTokenForOperation = async (): Promise<ChatToken> => {
            return {
                token: token,
            }
        }
        const chatRoomWithOperation = new ChatRoom({
            regionOrUrl: "ap-northeast-1",
            tokenProvider: () => promiseRoomTokenForOperation(),
        })
        setChatRoomWithOpe(chatRoomWithOperation)
    }

    // 運営メッセージinput
    const inputCommentRef = useRef<HTMLInputElement | null>(null)
    const onClickSendComment = async (value: any) => {
        const request = new SendMessageRequest(value);
        chatRoomWithOperation?.sendMessage(request)
    }

    // 視聴者チャットルーム
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
    // メッセージ
    const [messages, setMessages] = useState<ChatMessage[]>([])
    useEffect(() => {
        const unsubscribeOnConnecting = chatRoom?.addListener('connecting', () => {
            console.log("🔥connecting")
        })
        const unsubscribeOnConnected = chatRoom?.addListener('connect', () => {
            console.log("🔥connect")
        })
        const unsubscribeOnDisconnected = chatRoom?.addListener('disconnect', () => {
            console.log("🔥disconnect")
        })
        const unsubscribeOnMessageReceived = chatRoom?.addListener('message', (message) => {
            console.log(message)
            setMessages((msgs) => [message, ...msgs]);
        })
        const unsubscribeOnEventReceived = chatRoom?.addListener('event', (event) => {
            console.log("🔥event", event)
        })

        chatRoom?.connect()

        return () => {
            unsubscribeOnConnecting?.()
            unsubscribeOnConnected?.()
            unsubscribeOnDisconnected?.()
            unsubscribeOnMessageReceived?.()
            unsubscribeOnEventReceived?.()
        }
    }, [chatRoom])

    const connectChatRoomWithClient = async (token: string) => {
        const promiseRoomTokenForClient = async (): Promise<ChatToken> => {
            return {
                token: token,
            }
        }
        const chatRoom = new ChatRoom({
            regionOrUrl: "ap-northeast-1",
            tokenProvider: () => promiseRoomTokenForClient(),
        })
        setChatRoom(chatRoom)
    }

    // getCameraStreamが１度しか呼ばれないようにする
    const [count, setCount] = useState<number>(0)
    useEffect(() => {
        if (count === 0) {
            setCount(count + 1)

            // カメラオン
            getCameraStream()
        }
    }, [])

    useEffect(() => {
        if (props.tokenForViewerChatRoom === undefined) return
        // 視聴者チャットルーム接続
        connectChatRoomWithClient(props.tokenForViewerChatRoom)
    }, [props.tokenForViewerChatRoom])

    useEffect(() => {
        if (props.tokenForAdminChatRoom === undefined) return
        // // 運営とのチャットルーム接続
        connectChatRoomWithOperation(props.tokenForAdminChatRoom)
    }, [props.tokenForAdminChatRoom])

    return (
        <div
            className={classNames(BottomStyles.headerWrapper, "")}
        >
            <div
                onClick={getMessageModal}
                className={classNames(BottomStyles.micWrapper, "")}
            >
                <img
                    src={isOpenMessageModal === true && props.isCasting !== "準備中" ?
                        "https://api.iconify.design/material-symbols:chat-error-outline-sharp.svg?color=%23000000" :
                        "https://api.iconify.design/material-symbols:chat-outline.svg?color=%23000000"
                    }
                    // src = "https://api.iconify.design/material-symbols:chat-outline.svg?color=%23000000"
                    className={classNames(BottomStyles.micContent, "")}
                    alt=""
                />
                <p
                    className={classNames(BottomStyles.micText, "")}
                >
                    {
                        isOpenMessageModal === true && props.isCasting !== "準備中" ?
                            "閉じる" :
                            "コメント"
                    }
                </p>
            </div>

            {/* コメントモーダル start */}
            <div
                className={classNames(BottomStyles.ModalArea, "",
                    isOpenMessageModal === true && props.isCasting !== "準備中" ? "" : "hidden")}
            >
                <div
                    className={classNames(BottomStyles.ChatArea)}
                >
                    {messages.map((chat, index) => (
                        <div
                            key={index}
                            className={classNames(BottomStyles.ChatElmWrapper, "")}
                        >
                            <h3
                                className={classNames(BottomStyles.ChatElmName, "")}
                            >
                                {chat.id}
                            </h3>
                            <p
                                className={classNames(BottomStyles.ChatElmContent, "")}
                            >
                                {chat.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            {/* コメントモーダル end */}

            <div
                onClick={getAudienceModal}
                className={classNames(BottomStyles.micWrapper, "")}
            >
                <img
                    src={
                        isOpenAudienceKickModal === true && props.isCasting !== "準備中" ?
                            "https://api.iconify.design/material-symbols:no-accounts.svg?color=%23000000" :
                            "https://api.iconify.design/material-symbols:manage-accounts.svg?color=%23000000"
                    }
                    className={classNames(BottomStyles.micContent, "")}
                    alt=""
                />
                <p
                    className={classNames(BottomStyles.micText, "")}
                >
                    {
                        isOpenAudienceKickModal === true && props.isCasting !== "準備中" ?
                            "閉じる" :
                            "視聴者管理"
                    }
                </p>
            </div>
            {/* 視聴者管理モーダル start */}
            <div
                className={classNames(BottomStyles.ManageAudienceModalArea, "",
                    isOpenAudienceKickModal === true && props.isCasting !== "準備中" ? "" : "hidden")}
            >
                <div
                    className={classNames(BottomStyles.ManageAudienceWrapper)}
                >
                    {/* <div 
                        className={classNames(BottomStyles.ManageAudienceTitle)}
                    >
                        <h3>視聴者一覧</h3>
                    </div> */}


                    {ManageAudienceList.map((person, index) => (
                        <div
                            key={index}
                            className={classNames(BottomStyles.ManageAreaElmWrap, "")}
                        >
                            <h3
                                className={classNames(BottomStyles.ManageAreaElmName, "")}
                            >
                                No. {person.userID}
                            </h3>
                            <p
                                className={classNames(BottomStyles.ManageElmContent, "")}
                            >
                                {person.userName}
                            </p>
                            <button
                                className={classNames(BottomStyles.ManageElmButton, "")}
                                onClick={() => userKickClick(person.userID)}
                                key={person.userID}
                            >
                                キック
                            </button>
                        </div>
                    ))}

                </div>
            </div>
            {/* 視聴者管理モーダル end */}


            <div
                onClick={getInquiryModal}
                className={classNames(BottomStyles.micWrapper, "")}
            >
                <img
                    // src = "https://api.iconify.design/material-symbols:contact-support.svg?color=%23000000"
                    src={isOpenInquiryModal === true && props.isCasting !== "準備中" ?
                        "https://api.iconify.design/tabler:help-off.svg?color=%23000000" :
                        "https://api.iconify.design/tabler:help.svg?color=%23000000"
                    }
                    className={classNames(BottomStyles.micContent, "")}
                    alt=""
                />
                <p
                    className={classNames(BottomStyles.micText, "")}
                >
                    {isOpenInquiryModal === true && props.isCasting !== "準備中" ? "閉じる" : "サポート"}
                </p>
            </div>
            {/* サポートモーダル start */}
            <div
                className={classNames(BottomStyles.InquaryModalArea, "",
                    isOpenInquiryModal === true && props.isCasting !== "準備中" ? "" : "hidden")}
            >
                <div
                    className={classNames(BottomStyles.InquaryChatArea)}
                >
                    {messagesForOperation.map((chat, index) => (
                        <div
                            key={index}
                            className={classNames(BottomStyles.ChatElmWrapper, "")}
                        >
                            {/* <h3
                                className={classNames(BottomStyles.InquaryChatElmName, "")}
                            >
                                {chat.userID}
                            </h3>
                            <h3
                                className={classNames(BottomStyles.InquaryChatElmContent, "")}
                            >
                                {chat.liverName}
                            </h3> */}
                            <p
                                className={classNames(BottomStyles.InquaryChatElmContent, "")}
                            >
                                {chat.content}
                            </p>
                            {/* <p
                                className={classNames(BottomStyles.InquaryChatElmName, "")}
                            >
                                {chat.created}
                            </p> */}
                        </div>
                    ))}
                </div>

                {

                }
                <div
                    className={classNames(BottomStyles.commentInputArea, "mt-4 flex space-x-2")}
                >
                    <input ref={inputCommentRef} type="text" placeholder="タップして入力する" className="flex-1 rounded-md" />
                    <button onClick={() => onClickSendComment(inputCommentRef.current!.value)} className="bg-pink-500 p-2 text-sm rounded-md">送信</button>
                </div>
            </div>
            {/* サポートモーダル end */}

            <div
                onClick={getAudioStream}
                className={classNames(BottomStyles.micWrapper, "")}
            >
                <img
                    src={
                        isAudioStream === true ?
                            "https://api.iconify.design/material-symbols:mic-rounded.svg" :
                            "https://api.iconify.design/material-symbols:mic-off-rounded.svg"
                    }
                    className={classNames(BottomStyles.micContent, "")}
                    alt=""
                />
                <p
                    className={classNames(BottomStyles.micText, "")}
                >
                    {
                        isAudioStream === true ?
                            "ミュート" :
                            "ミュート解除"
                    }
                </p>
            </div>

        </div>
    )
}


const SupportModalList = [
    {
        "userID": 1,
        "liverName": "りこちゃん",
        "content": "ユーザID1989の「なにわのエロオヤジ」がえっちすぎる",
        "created": "2023-10-19 17:32:00"
    },
    {
        "userID": 0,
        "liverName": "運営公式",
        "content": "不快な思いをさせてしまい、大変申し訳ありませんでした。具体的にどのようなことを言われましたでしょうか。",
        "created": "2023-10-20 17:32:00"
    },
    {
        "userID": 1,
        "liverName": "莉子ちゃん",
        "content": "ご連絡ありがとうございます。",
        "created": "2023-10-20 18:32:30"
    },
    {
        "userID": 1,
        "liverName": "莉子ちゃん",
        "content": "性器見せてなどです。",
        "created": "2023-10-20 18:32:00"
    },
    {
        "userID": 0,
        "liverName": "運営公式",
        "content": "承知しました。",
        "created": "2023-10-20 17:32:00"
    },
    {
        "userID": 0,
        "liverName": "運営公式",
        "content": "すぐキックします。",
        "created": "2023-10-20 17:32:00"
    }
]


const ManageAudienceList = [
    {
        "userID": 1,
        "userName": "藤子・F・ふじお"
    },
    {
        "userID": 2,
        "userName": "宮崎　駿"
    },
    {
        "userID": 3,
        "userName": "北野　武"
    },
    {
        "userID": 4,
        "userName": "黒澤　明"
    },
    {
        "userID": 5,
        "userName": "庵野　秀明"
    },
    {
        "userID": 6,
        "userName": "富野由　悠季"
    },
    {
        "userID": 7,
        "userName": "諫山　創"
    }
]

const chatElm = [
    {
        "userID": 1,
        "attribute": "audience", // liver or audience or presents
        "userName": "剛田武",
        "content": "今日のライバーはかわいいね！！！！",
        "created": "2023-10-19 12:40:03"
    },
    {
        "userID": 1,
        "attribute": "audience", // liver or audience
        "userName": "剛田武",
        "content": "こっち向いて〜",
        "created": "2023-10-19 12:41:03"
    },
    {
        "userID": 1,
        "attribute": "audience", // liver or audience
        "userName": "剛田武",
        "content": "冷蔵庫",
        "created": "2023-10-19 12:42:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "いいよー",
        "created": "2023-10-19 12:43:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "がんばれー",
        "created": "2023-10-19 12:44:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "今日の夜ご飯は何にするの？",
        "created": "2023-10-19 12:45:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "がんばれー",
        "created": "2023-10-19 12:44:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "今日の夜ご飯は何にするの？",
        "created": "2023-10-19 12:45:03"
    }, {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "がんばれー",
        "created": "2023-10-19 12:44:03"
    },
    {
        "userID": 2,
        "attribute": "audience", // liver or audience
        "userName": "野比のび太",
        "content": "今日の夜ご飯は何にするの？",
        "created": "2023-10-19 12:45:03"
    },
]
