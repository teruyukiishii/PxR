/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request } from 'express';
import { JsonController, Post, UseBefore, Req, Header, Body, OnUndefined } from 'routing-controllers';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import CreateAPIKeyReqDto from './dto/CreateAPIKeyReqDto';
import CreateBlockAPIKeyValidator from './validator/CreateBlockAPIKeyValidator';
import OperatorService from '../services/OperatorService';
import EntityOperation from '../repositories/EntityOperation';
import AccessControlService from '../services/AccessControlService';
import CatalogService from '../services/CatalogService';
import AccessControllerResult from '../services/dto/AccessControllerResult';
import CreateAPIKeyService from '../services/CreateAPIKeyService';
import checkCertificateRequest from '../common/CheckCertificateRequest';
import { sprintf } from 'sprintf-js';
import AppError from '../common/AppError';
/* eslint-enable */

@JsonController('/access-control-manage')
export default class CreateCatalogAPIKeyController {
    @Post('/catalog')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(CreateBlockAPIKeyValidator)
    @OnUndefined(204)
    async post (
        @Req() req: Request,
        @Body() dto: CreateAPIKeyReqDto[]
    ) {
        // オペレーター情報を取得する
        const operator = await OperatorService.authMe(req, true);

        // 証明書が利用されたアクセスであるかを確認する
        await checkCertificateRequest(req, dto, operator);

        // DTOの配列分、ループしてAPIキーを取得する
        const result: AccessControllerResult[] = [];
        for (const item of dto) {
            // 宛先と権限を評価する
            await CreateAPIKeyService.checkPermission(item, operator, 'catalog');

            let targetNss: string[] = [];

            // 操作可能なネームスペースか確認する
            if (item.target.apiMethod === 'POST' || item.target.apiMethod === 'PUT') {
                if (item.target.apiUrl.indexOf('updateSet') >= 0) {
                    targetNss = item.caller.requestBody;
                } else {
                    targetNss.push(item.caller.requestBody);
                }
            } else {
                let targetCatalog;
                if (item.caller.requestBody) {
                    targetCatalog = await CatalogService.get(operator, null, item.caller.requestBody + '');
                    if (!Array.isArray(targetCatalog.body) || !targetCatalog.body.length) {
                        throw new AppError(sprintf('次のネームスペースは存在しません(ネームスペース: %s)', item.caller.requestBody), 400);
                    }
                    targetNss.push(targetCatalog.body[0]['catalogItem']['ns']);
                } else {
                    const code = item.target.apiUrl.match(/^\/catalog\/ext\/(\d+)$/);
                    targetCatalog = await CatalogService.get(operator, Number(code[1]), null);
                    if (!targetCatalog.body || Array.isArray(targetCatalog.body)) {
                        throw new AppError(sprintf('次のコードは存在しません(code: %s)', code[1]), 400);
                    }
                    targetNss.push(targetCatalog.body['catalogItem']['ns']);
                }
            }
            await CreateAPIKeyService.checkNs(targetNss, operator);

            // エンティティの初期化
            const entity = await CreateAPIKeyService.convert(item, operator);

            // ドメインを取得する
            const domains = await CreateAPIKeyService.takeDomain(operator, item.caller.blockCode, item.target.blockCode);

            // 宛先パラメーターを欠落させる
            item.target.parameter = null;

            // 宛先のアクセス制御サービス.APIアクセス許可生成 APIをコールする
            const tokenList = await AccessControlService.create(
                domains.toCatalog,
                domains.fromCatalog,
                item,
                operator
            );
            // 結果が空であれば、次の処理へ
            if (!tokenList.length) {
                continue;
            }
            result.push(...tokenList);

            // トークンリスト（アクセス制御サービスの結果）を元に、エンティティを追加
            await CreateAPIKeyService.convertTokenList(tokenList, entity, operator, item);

            // ロールの指定により、エンティティを形成
            await CreateAPIKeyService.convertRoleEntity(item, entity, operator);

            // エンティティを保存
            await EntityOperation.saveEntity(entity);
        }

        if (!result.length) { return undefined; }
        return result;
    }
}