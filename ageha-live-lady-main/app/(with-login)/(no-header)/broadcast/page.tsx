"use client"

import { useRef, useEffect, useState } from "react"
import IVSBroadcastClient, { AmazonIVSBroadcastClient, LocalStageStream, Stage, StageParticipantInfo, StageStrategy, SubscribeType } from "amazon-ivs-web-broadcast"
import Styles from "./page.module.css"
import { BottomHeader } from './bottom_header'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useRouter } from "next/navigation"

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function BroadcastPage() {
    const ivsBroadcastClient = useRef<AmazonIVSBroadcastClient>(
        IVSBroadcastClient
            .create(
                {
                    streamConfig: IVSBroadcastClient.STANDARD_PORTRAIT
                }
            )
    )

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioTrackRef = useRef<MediaStreamTrack | null>(null)
    const videoTrackRef = useRef<MediaStreamTrack | null>(null)
    const ivsStage = useRef<Stage | null>(null)

    // ブロードキャストの開始処理
    const castingStatus = { // 配信ステータスリスト
        "preparing": "準備中",
        "waiting": "待機中",
        "party": "パーティ中",
        "twoShot": "2ショット中"
    }

    // 配信ステータス
    const [isCasting, setIsCasting] = useState<string>(castingStatus.preparing)
    const onClickWorkStart = async () => {
        if (audioTrackRef.current === null || videoTrackRef.current === null) return

        // チャンネル作成API＆配信開始
        try {
            setIsCasting(castingStatus.waiting)
            const res = await fetch(process.env.apiBaseUrl + "/liver/createLive", {
                method: "POST",
            })
            const json = await res.json()
            const strategy: StageStrategy = {
                stageStreamsToPublish: function (): LocalStageStream[] {
                    return [
                        new LocalStageStream(audioTrackRef.current!),
                        new LocalStageStream(videoTrackRef.current!),
                    ]
                },
                shouldPublishParticipant: function (participant: StageParticipantInfo): boolean {
                    return true
                },
                shouldSubscribeToParticipant: function (participant: StageParticipantInfo): SubscribeType {
                    return SubscribeType.NONE
                }
            }
            ivsStage.current = new Stage(json.token, strategy)
            await ivsStage.current.join()

            setTokenForViewerChatRoom(json.tokenForViewerChatRoom)
            setTokenForAdminChatRoom(json.tokenForAdminChatRoom)
        } catch (error) {
            console.log("❌" + error)
        }
    }

    // 配信終了モーダル処理
    const [open, setOpen] = useState<boolean>(false)
    const deliberyModalOpen = async () => {
        setOpen(true)
    }
    const deliberyModalClose = async () => {
        setOpen(false)
    }
    const deliveryContinue = async () => {
        deliberyModalClose()
    }
    const router = useRouter()
    const deliveryEnd = async () => {
        ivsBroadcastClient.current?.stopBroadcast()
        router.replace('/')
    }

    const [tokenForViewerChatRoom, setTokenForViewerChatRoom] = useState<string | undefined>(undefined)
    const [tokenForAdminChatRoom, setTokenForAdminChatRoom] = useState<string | undefined>(undefined)

    return (
        <div className="relative w-full h-screen">
            <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover bg-gray-300"></video>

            <div className={classNames(Styles.topHeaderArea, "")}>
                <div className={classNames(Styles.headerWraper, "flex items-center mx-3 mt-3")}>
                    <div
                        className={classNames(Styles.leftArea, "flex flex-col")}
                    >
                        <span
                            className={
                                classNames(Styles.deliveryStatus,
                                    "text-xs font-bold px-6 py-1 rounded-full",
                                    isCasting === castingStatus.preparing ? "bg-gray-600 text-white" :
                                        isCasting === castingStatus.waiting ? "bg-yellow-300 text-stone-500" :
                                            isCasting === castingStatus.party ? "bg-pink-500 text-white" : " text-white"
                                )}
                        >
                            {
                                isCasting === castingStatus.preparing ? "準備中" :
                                    isCasting === castingStatus.waiting ? "待機中" :
                                        isCasting === castingStatus.party ? "パーティー中" : "なし"
                            }
                        </span>
                        <div className="flex flex-col">
                            <div
                                className={classNames(Styles.numOfViewers, "flex font-bold px-6 py-1 bg-gray-600 rounded-full")}
                            >
                                <div className="flex">
                                    <img
                                        src="https://api.iconify.design/heroicons:user-circle-solid.svg?color=%2386b4fd"
                                        alt=""
                                        className="mr-1"
                                    />
                                    {0} / {5}人
                                </div>
                                <div className="flex ml-2">
                                    <img
                                        src="https://api.iconify.design/mdi:star-four-points-box.svg?color=%23f8ff94"
                                        alt=""
                                        className="mr-1"
                                    />
                                    {"12,000"} Pt
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={deliberyModalOpen}
                        className={
                            classNames(Styles.aaa,
                                "ml-auto text-white bg-gray-600 px-4 py-2 rounded-lg text-xs font-bold")
                        }
                    >
                        配信終了
                    </button>
                    {/* 配信終了モーダル start */}
                    <Modal
                        open={open}
                        onClose={deliberyModalClose}
                    >
                        <Box>
                            {/* <Typography id="modal-modal-title" variant="h6" component="h2">
                                Text in a modal
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                            </Typography> */}
                            <div
                                className={classNames(Styles.DeliveryModalArea)}
                            >
                                <div
                                    className={classNames(Styles.DeliveryModalContentWrap)}
                                >
                                    <h2>終了しますか？</h2>
                                    <h3>合計獲得ポイント</h3>
                                    <h3>{"12000"} Pt</h3>

                                    <div
                                        className={classNames(Styles.DeliveryModalContentButton, "")}
                                    >
                                        <button
                                            onClick={deliveryContinue}
                                            className={classNames(Styles.DeliverySelectButton, "bg-sky-500")}
                                        >
                                            継続
                                        </button>
                                        <button
                                            onClick={deliveryEnd}
                                            className={classNames(Styles.DeliverySelectButton, "bg-rose-500")}
                                        >
                                            終了
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Box>
                    </Modal>
                    {/* 配信終了モーダル end */}

                </div>
            </div>

            <BottomHeader
                ivsBroadcastClient={ivsBroadcastClient}
                isCasting={isCasting}
                tokenForViewerChatRoom={tokenForViewerChatRoom}
                tokenForAdminChatRoom={tokenForAdminChatRoom}
                videoRef={videoRef}
                audioTrackRef={audioTrackRef}
                videoTrackRef={videoTrackRef}
            />

            <button
                className={classNames("mb-20 absolute bottom-0 left-1/2 transform -translate-x-1/2 px-8 rounded-full py-2 bg-pink-500",
                    isCasting === castingStatus.preparing ? "" : "hidden"
                )}
            >
                <div onClick={onClickWorkStart} className="text-white font-bold">待機開始</div>
            </button>

        </div>

    )
}
