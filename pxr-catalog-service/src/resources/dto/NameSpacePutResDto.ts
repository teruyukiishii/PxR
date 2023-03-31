/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * PUT: ネームスペース更新のレスポンスDTO
 */
export default class NameSpacePutResDto {
    /**
     * ID
     */
    id: number = null;

    /**
     * ネームスペース
     */
    ns: string = null;

    /**
     * 説明
     */
    description: string = null;

    /**
     * データ構造取得(JSON用連想配列)
     */
    public getAsJson (): {} {
        return {
            id: Number(this.id),
            ns: this.ns,
            description: this.description
        };
    }
}
