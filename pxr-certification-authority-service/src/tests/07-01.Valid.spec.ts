/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import * as supertest from 'supertest';
import Application from '../index';
import { connectDatabase } from '../common/Connection';
import Common, { Url } from './Common';
import { Session } from './Session';
import StubOperatorServer from './StubOperatorServer';
import { sprintf } from 'sprintf-js';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

// 対象アプリケーションを取得
const expressApp = Application.express.app;
const common = new Common();

// スタブクライアントー（オペレータサービス）
let _operatorServer: StubOperatorServer = null;

/**
 * certification-autority API のユニットテスト
 */
describe('certification-autority API', () => {
    /**
     * 全テスト実行の前処理
     */
    beforeAll(async () => {
        await Application.start();
        await connectDatabase();

        // DB接続
        await common.connect();
        // DB初期化
        await common.executeSqlFile('initialData.sql');
        await common.executeSqlFile('insertCertificate.sql');
    });
    /**
     * 各テスト実行の前処理
     */
    beforeEach(async () => {
        // DB接続
        await common.connect();
    });
    /**
     * 全テスト実行の後処理
     */
    afterAll(async () => {
        // DB切断
        await common.disconnect();

        // クライアント停止
        await Application.stop();
    });
    /**
     * 各テスト実行の後処理
     */
    afterEach(async () => {
        // スタブクライアントー停止
        if (_operatorServer) {
            _operatorServer._server.close();
            _operatorServer = null;
        }
    });

    /**
     * クライアント証明書有効性検証
     */
    describe('クライアント証明書有効性検証', () => {
        test('正常：クライアント証明書', async () => {
            // 送信データを生成
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, 個人', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type0_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, アプリケーション', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type2_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('正常：Cookie使用, 運営メンバー', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(200);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(200);
            expect(response.body.result).toBe('success');
        });
        test('異常：Cookie使用, オペレータサービス未起動', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常：Cookie使用, オペレータサービス応答400系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(400);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：Cookie使用, オペレータサービス応答500系', async () => {
            // スタブクライアントー起動
            _operatorServer = new StubOperatorServer(500);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', ['operator_type3_session=' + '437a5cbc10da802a887f5e057c88fdc64a927332871ad2a987dfcb7d224e7e00'])
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常：セッションなし', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常：対象データなし', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXX9',
                    fingerPrint: 'YYYYY9'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.TARGET_NO_DATA);
        });
        test('異常：有効期限切れ', async () => {
            await common.executeSqlString(`
                INSERT INTO pxr_certification_authority.certificate_manage
                (
                    cert_type, 
                    subject, 
                    serial_no, finger_print, 
                    valid_period_start, valid_period_end, 
                    certificate, 
                    actor_code, actor_version,
                    block_code, block_version,
                    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
                    )
                values
                (
                    'client',
                    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "test-org", "OU": "test-unit", "CN": "*" }',
                    'XXXXX4', 'YYYYY4', 
                    '2020-01-01', '2020-03-31', 
                    'TEST',
                    10001, 1, 
                    10002, 2,
                    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
                );
            `);

            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXX4',
                    fingerPrint: 'YYYYY4'
                });

            // レスポンスチェック
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.FAILED_CERTIFICATE_EXPIRED);
        });
        test('パラメータ不足：serialNo', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'serialNo'));
        });
        test('パラメータ不足：fingerPrint', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXX3'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isDefined, 'fingerPrint'));
        });
        test('パラメータ不足：リクエストが空', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({});

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_IS_EMPTY);
        });
        test('パラメータ異常：serialNo', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: '',
                    fingerPrint: 'YYYYY3'
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isString, 'serialNo'));
        });
        test('パラメータ異常：fingerPrint', async () => {
            // 対象APIに送信
            const response = await supertest(expressApp).post(Url.validURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: JSON.stringify(Session.pxrRoot) })
                .send({
                    serialNo: 'XXXXX3',
                    fingerPrint: ''
                });

            // レスポンスチェック
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(sprintf(Message.validation.isString, 'fingerPrint'));
        });
    });
});
