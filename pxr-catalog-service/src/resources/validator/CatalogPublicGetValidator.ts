/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
/* eslint-enable */

/**
 * 公開カタログ取得のバリデーションチェッククラス
 */
@Middleware({ type: 'before' })
export default class CatalogPublicGetValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        if (next) {
            next();
        }
    }
}
