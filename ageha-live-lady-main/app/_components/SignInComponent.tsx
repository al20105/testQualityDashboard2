import { Authenticator, Button, Flex, Image, Text, View, translations, useAuthenticator, useTheme } from "@aws-amplify/ui-react";
import { I18n } from "aws-amplify";
import { useRouter } from "next/navigation";

/**
 * AmplifyのI18nのキーEnum(すべてのキーは記載していないので注意)
 * {@link https://github.com/aws-amplify/amplify-ui/blob/main/packages/ui/src/i18n/dictionaries/authenticator/ja.ts}
 */
enum I18nKeys {
    BACK_TO_SIGN_IN = "Back to Sign In",
    CODE = "Code",
    CODE_WITH_WILD_CARD = "Code *",
    CREATE_A_NEW_ACCOUNT = "Create a new account",
    CREATING_ACCOUNT = "Creating Account",
    ENTER_YOUR_EMAIL = "Enter your Email",
    ENTER_YOUR_EMAIL_LOWER_CASE = "Enter your email",
    ENTER_YOUR_USERNAME = "Enter your username",
    FORGOT_YOUR_PASSWORD = "Forgot your password?",
    IT_MAY_TAKE_A_MINUTE_TO_ARRIVE = "It may take a minute to arrive",
    OR = "or",
    SIGN_IN_TO_YOUR_ACCOUNT = "Sign in to your account",
    SIGN_IN_LOWER_CASE = "Sign in",
    SIGN_IN_UPPER_CASE = "Sign In",
    SIGNING_IN = "Signing in",
    WE_SENT_A_CODE = "We Sent A Code",
    WE_TEXTED_YOU = "We Texted You",
    YOUR_CODE_IS_ON_THE_WAY__TO_LOG_IN__ENTER_THE_CODE_WE_SENT_YOU =
    "Your code is on the way. To log in, enter the code we sent you",
    AN_ACCOUNT_WITH_THE_GIVEN_EMAIL_ALREADY_EXISTS =
    "An account with the given email already exists.",
    CONFIRM_SIGN_IN = "Confirm Sign In",
    CREATE_ACCOUNT = "Create Account",
    INCORRECT_USERNAME_OR_PASSWORD = "Incorrect username or password",
    INCORRECT_USERNAME_OR_PASSWORD_WITH_PERIOD = "Incorrect username or password.",
    INVALID_PASSWORD_FORMAT = "Invalid password format",
    INVALID_PHONE_NUMBER_FORMAT = "Invalid phone number format",
    IT_MAY_TAKE_A_MINUTE_TO_ARRIVE_WITH_PERIOD = "It may take a minute to arrive.",
    PASSWORD_ATTEMPTS_EXCEEDED = "Password attempts exceeded",
    USER_ALREADY_EXISTS = "User already exists",
    USER_DOES_NOT_EXIST = "User does not exist",
    USERNAME_CANNOT_BE_EMPTY = "Username cannot be empty",
    WE_EMAILED_YOU = "We Emailed You",
    YOUR_CODE_IS_ON_THE_WAY__TO_LOG_IN__ENTER_THE_CODE_WE_EMAILED_TO =
    "Your code is on the way. To log in, enter the code we emailed to",
    INVALID_CODE_PROVIDED__PLEASE_REQUEST_A_CODE_AGAIN =
    "Invalid code provided, please request a code again.",
    USER_SRP_AUTH_IS_NOT_ENABLED_FOR_THE_CLIENT_WITH_PERIOD =
    "USER_SRP_AUTH is not enabled for the client.",
}

class RouteUrls {
    static readonly REGISTER_USER = "/register-user";
}

class Constants {
    static readonly LOGO_IMAGE_PATH = "/images/logo.png";

    static Header = class {
        static Strings = class {
            static readonly TITLE = "業界人気 No.1 ✨";
            static readonly SUB_TITLE = "高報酬のAGEHAで今すぐ稼ごう 💰";
        }
    }
}

I18n.putVocabularies(translations);
I18n.setLanguage("ja");
I18n.putVocabularies({
    ja: {
        [I18nKeys.BACK_TO_SIGN_IN]: "ログインに戻る",
        [I18nKeys.CODE]: "確認コード",
        [I18nKeys.CODE_WITH_WILD_CARD]: "確認コード",
        [I18nKeys.CREATE_A_NEW_ACCOUNT]: "新規登録する",
        [I18nKeys.CREATING_ACCOUNT]: "登録中",
        [I18nKeys.ENTER_YOUR_EMAIL]: "メールアドレスを入力",
        [I18nKeys.ENTER_YOUR_EMAIL_LOWER_CASE]: "メールアドレスを入力",
        [I18nKeys.ENTER_YOUR_USERNAME]: "ユーザー名を入力",
        [I18nKeys.FORGOT_YOUR_PASSWORD]: "パスワードを忘れた方はこちら",
        [I18nKeys.IT_MAY_TAKE_A_MINUTE_TO_ARRIVE]: "メールが届くまでに数分かかることがあります",
        [I18nKeys.OR]: "もしくは",
        [I18nKeys.SIGN_IN_TO_YOUR_ACCOUNT]: "アカウントにログイン",
        [I18nKeys.SIGN_IN_LOWER_CASE]: "ログイン",
        [I18nKeys.SIGN_IN_UPPER_CASE]: "ログイン",
        [I18nKeys.SIGNING_IN]: "ログイン中",
        [I18nKeys.WE_SENT_A_CODE]: "コードが送信されました",
        [I18nKeys.WE_TEXTED_YOU]: "確認コードを送信しました",
        [I18nKeys.YOUR_CODE_IS_ON_THE_WAY__TO_LOG_IN__ENTER_THE_CODE_WE_SENT_YOU]:
            "ログインするには、送信された確認コードを入力してください",
        [I18nKeys.AN_ACCOUNT_WITH_THE_GIVEN_EMAIL_ALREADY_EXISTS]:
            "入力されたメールアドレスは既に登録済みです。ログインをお試しください。",
        [I18nKeys.CONFIRM_SIGN_IN]: "ログインする",
        [I18nKeys.CREATE_ACCOUNT]: "登録する",
        [I18nKeys.INCORRECT_USERNAME_OR_PASSWORD]: "ユーザー名またはパスワードが違います",
        [I18nKeys.INCORRECT_USERNAME_OR_PASSWORD_WITH_PERIOD]: "ユーザー名またはパスワードが違います",
        [I18nKeys.INVALID_PASSWORD_FORMAT]: "パスワードのフォーマットが不正です",
        [I18nKeys.INVALID_PHONE_NUMBER_FORMAT]:
            "不正な電話番号フォーマットです。 電話番号は次のフォーマットで入力してください: +12345678900",
        [I18nKeys.IT_MAY_TAKE_A_MINUTE_TO_ARRIVE_WITH_PERIOD]:
            "メールが届くまでに数分かかることがあります。",
        [I18nKeys.PASSWORD_ATTEMPTS_EXCEEDED]: "パスワード試行回数が超過しました",
        [I18nKeys.USER_ALREADY_EXISTS]: "ユーザーは既に存在します",
        [I18nKeys.USER_DOES_NOT_EXIST]: "ユーザーが存在しません",
        [I18nKeys.USERNAME_CANNOT_BE_EMPTY]: "ユーザー名は必須です",
        [I18nKeys.WE_EMAILED_YOU]: "確認コードを送信しました",
        [I18nKeys.YOUR_CODE_IS_ON_THE_WAY__TO_LOG_IN__ENTER_THE_CODE_WE_EMAILED_TO]:
            "ログインするには、メールに記載されたコードを入力してください",
        [I18nKeys.INVALID_CODE_PROVIDED__PLEASE_REQUEST_A_CODE_AGAIN]:
            "確認コードが違います。「コードを再送信」をお試しください。",
        [I18nKeys.USER_SRP_AUTH_IS_NOT_ENABLED_FOR_THE_CLIENT_WITH_PERIOD]:
            "SRP認証が有効になっていません。お問い合わせからご連絡ください。",
    },
});

export default function SignInComponent(): JSX.Element {
    return (
        <Authenticator
            loginMechanisms={["email"]}
            hideSignUp={true}
            variation="modal"
            components={{
                SignIn: {
                    Header() {
                        const { tokens } = useTheme();
                        return (
                            <View
                                paddingTop={tokens.space.xl}
                            >
                                <AppLogoHeader />
                            </View>
                        );
                    },

                    Footer() {
                        const { tokens } = useTheme();
                        const { toResetPassword } = useAuthenticator();
                        const router = useRouter();

                        return (
                            <Flex
                                direction="column"
                                wrap="wrap"
                                justifyContent="center"
                                alignItems="center"
                                gap={tokens.space.small}
                                paddingBottom={tokens.space.large}
                            >
                                <Button
                                    fontWeight="normal"
                                    onClick={toResetPassword}
                                    size="small"
                                    variation="link"
                                >
                                    {I18n.get(I18nKeys.FORGOT_YOUR_PASSWORD)}
                                </Button>

                                <Button
                                    fontWeight="normal"
                                    onClick={() => {
                                        // 登録画面に遷移
                                        router.push(RouteUrls.REGISTER_USER);
                                    }}
                                    size="small"
                                    variation="link"
                                >
                                    {I18n.get(I18nKeys.CREATE_A_NEW_ACCOUNT)}
                                </Button>

                            </Flex>
                        );
                    },
                },

                ConfirmSignIn: {
                    Header() {
                        return (
                            <AppLogoHeader />
                        );
                    },
                },

                ResetPassword: {
                    Header() {
                        const { tokens } = useTheme();
                        return (
                            <View
                                paddingBottom={tokens.space.medium}
                            >
                                <AppLogoHeader />
                            </View>
                        );
                    },
                },

                ConfirmResetPassword: {
                    Header() {
                        return (
                            <AppLogoHeader />
                        );
                    },
                },
            }}
        />
    );
}

function AppLogoHeader(): JSX.Element {
    const { tokens } = useTheme();
    return (
        <Flex
            direction="column"
            wrap="wrap"
            justifyContent="center"
            alignItems="center"
            gap={tokens.space.large}
        >
            <Image
                width="60%"
                objectFit="contain"
                objectPosition="50% 50%"
                src={Constants.LOGO_IMAGE_PATH}
                alt="logo"
                marginRight={25}
            />

            <Flex
                direction="column"
                wrap="wrap"
                justifyContent="center"
                alignItems="center"
                gap={tokens.space.small}
            >

                <Text>
                    {Constants.Header.Strings.TITLE}
                </Text>

                <Text>
                    {Constants.Header.Strings.SUB_TITLE}
                </Text>

            </Flex>
        </Flex>
    );
}