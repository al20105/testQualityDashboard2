import WithLoginRootComponent from "../_components/WithLoginRootComponent";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}): JSX.Element {
    return (
        <WithLoginRootComponent>
            {children}
        </WithLoginRootComponent>
    );
}