'use client'

import { useAuthenticator } from "@aws-amplify/ui-react";
import SignInComponent from "./SignInComponent";
import { CircularProgress } from "@nextui-org/react";

export default function WithLoginRootComponent({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const { authStatus } = useAuthenticator(context => [context.authStatus])

  // Authenticatorが読み込み中の場合はローディング表示
  if (authStatus === 'configuring')
    return (
      <div className="flex flex-column justify-center content-center grow mx-3 my-6">
        <CircularProgress color="primary" size="lg" aria-label="通信中..." />
      </div>
    );

  // 認証済みでない場合はサインイン画面を表示
  if (authStatus !== 'authenticated')
    return (<SignInComponent />);

  // そうでない場合は通常の画面を表示
  return (<>{children}</>);
}