/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

// SDE-IMPL-REQUIRED 本ファイルをコピーしコントローラーに定義した各 REST API のリクエスト・レスポンスごとにDTOを作成します。

// import { IsUUID, IsString, IsNumber, IsDateString } from 'class-validator';

/**
 * イベント削除(DELETE)リクエストモデル
 */
export default class DeleteEventByUserIdReqDto {
    /**
     * 利用者ID
     */
    private userId: string = null;

    /**
     * イベント識別子
     */
    private eventIdentifer: string = null;

    /**
     * イベントソースID
     */
    private eventSourceId: string = null;

    /**
     * リクエストオブジェクト
     */
    private requestObject: {} = null;

    /**
     * 利用者ID取得
     */
    public getUserId (): string {
        return this.userId;
    }

    /**
     * 利用者ID設定
     * @param userId
     */
    public setUserId (userId: string) {
        this.userId = userId;
    }

    /**
     * イベント識別子取得
     */
    public getEventIdentifer (): string {
        return this.eventIdentifer;
    }

    /**
     * イベント識別子設定
     * @param eventIdentifer
     */
    public setEventIdentifer (eventIdentifer: string) {
        this.eventIdentifer = eventIdentifer;
    }

    /**
     * イベントソースID取得
     */
    public getEventSourceId (): string {
        return this.eventSourceId;
    }

    /**
     * イベントソースID設定
     * @param eventSourceId
     */
    public setEventSourceId (eventSourceId: string) {
        this.eventSourceId = eventSourceId;
    }

    /**
     * リクエストオブジェクト
     */
    public getRequestObject (): {} {
        return this.requestObject;
    }

    /**
     * データ構造設定(JSON用連想配列)
     * @param obj
     */
    public setFromJson (obj: {}): void {
        this.requestObject = obj;
    }
}
