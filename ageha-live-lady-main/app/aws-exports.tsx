export default {
    // NOTE: NEXT_PUBLICを付けるとブラウザ側で参照できてしまう？もしそうであれば要修正
    "REGION": process.env.NEXT_PUBLIC_AWS_COGNITO_REGION,
    "USER_POOL_ID": process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID,
    "USER_POOL_APP_CLIENT_ID": process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID
}