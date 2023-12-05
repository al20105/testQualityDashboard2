import HeaderComponent from "@/app/_components/HeaderComponent"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <HeaderComponent>
            {children}
        </HeaderComponent>
    )
}