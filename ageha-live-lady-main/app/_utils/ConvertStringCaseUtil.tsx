/**
 * Camelケースの文字列をスネークケースに変換するメソッド
 * [参考]{@link https://zenn.dev/kazuwombat/articles/038963ca99854e}
 * @param { string } str 変換したい文字列
 * @returns { string } 変換後の文字列
 */
export function convertCamelToSnake(str: string): string {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const char = str.charAt(i);
        if (char === char.toUpperCase())
            result += "_" + char.toLowerCase();
        else
            result += char;
    }
    return result;
}