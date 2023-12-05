"use client"

import { useContext } from "react"
import { LoggedInUserInfoContext } from "./_providers/LoggedInUserInfoContextProvider"

export default function HeaderComponent({
    children,
}: {
    children: React.ReactNode
}) {
    const loggedInUserInfo = useContext(LoggedInUserInfoContext);

    return (
        <>
            {/* header */}
            <div className="sticky top-0 z-40 border-b-[1px] flex items-center gap-x-6 py-4 shadow-sm bg-white">
                <div className="flex-1 text-sm font-semibold leading-6">AGEHAライブチャット</div>
                <a href="#">
                    <span className="sr-only">Your profile</span>
                    {
                        loggedInUserInfo != null
                            ? (
                                <span aria-hidden="true">
                                    {loggedInUserInfo?.pointNum.toLocaleString("ja-JP") + "pt"}
                                </span>
                            )
                            : (null)
                    }
                </a>
            </div>

            {/* content */}
            {children}
        </>
    )
}
