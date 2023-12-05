"use client"

import Styles from "./layout.module.css"
import { useContext } from "react"
import { LoggedInUserInfoContext } from "../../_components/_providers/LoggedInUserInfoContextProvider"
import HeaderComponent from "@/app/_components/HeaderComponent"

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const loggedInUserInfo = useContext(LoggedInUserInfoContext)

    return (
        <HeaderComponent>
            {children}
        </HeaderComponent>
    )
}