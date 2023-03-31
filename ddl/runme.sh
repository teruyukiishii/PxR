#!/usr/bin/bash
# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin:/root/bin

# DBクラスター名
EndPnt="<db_cluster>"

# ブロック名配列
# 初期払い出し時
BLOCK_ARR=(root application000001 application000002 consumer000001 consumer000002 region000001 trader000001 workflow000001 region000002 trader000002 workflow000002)

# ブロック追加時(BLOCK_ARR=追加したいブロック名)
# BLOCK_ARR=application000002

echo  "DBユーザー作成"
PGPASSWORD="postgres" psql -U postgres  -h ${EndPnt} -p 5432 -d postgres -f ./createUser.sql

echo "DBユーザ継承設定"
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_access_control_user TO postgres;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_access_manage_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_book_manage_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_binary_manage_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_book_operate_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_catalog_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_catalog_update_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_certification_authority_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_certificate_manage_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_identify_verify_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_notification_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_operator_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_block_proxy_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_info_account_manage_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_ctoken_ledger_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_local_ctoken_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_wallet_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_data_utilization_user TO postgres ;'
PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -d postgres -c 'GRANT pxr_book_open_user TO postgres ;'

echo "DB作成"
for block in ${BLOCK_ARR[@]}
do
   PGPASSWORD="postgres" psql -U postgres -h ${EndPnt} -p 5432 -c "create database ${block}_pod ENCODING  'UTF-8'";
done

echo "DBにスキーマ作成"
for db in ${BLOCK_ARR[@]}
do
    echo "--- ${db} ---"
    PGPASSWORD='postgres' psql -U postgres  -h ${EndPnt} -p 5432 -d ${db}_pod -f ./createSchema.sql
done

echo "DBにテーブル作成"
for db in ${BLOCK_ARR[@]}
do
    echo "--- ${db} ---"
    ls -1 ./db/ | while read svc
    do
        echo "--- ${svc} ---"
        PGPASSWORD='postgres' psql -U postgres  -h ${EndPnt} -p 5432 -d ${db}_pod -f ./db/${svc}/createTable.sql
    done
done

echo "operator登録"
for db in ${BLOCK_ARR[@]}
do
    echo "--- ${db} ---"
    if [ "${db}" == "root" ] || [ "${db}" == "application000001" ] || [ "${db}" == "consumer000001" ] || [ ${db} == "region000001" ] || [ ${db} == "trader000001" ] || [ "${db}" == "workflow000001" ]; then
       PGPASSWORD='postgres' psql -U postgres  -h ${EndPnt} -p 5432 -d ${db}_pod -f ./create_operator_${db}.sql
    else
       PGPASSWORD='postgres' psql -U postgres  -h ${EndPnt} -p 5432 -d ${db}_pod -f ./create_operator.sql
    fi
done
