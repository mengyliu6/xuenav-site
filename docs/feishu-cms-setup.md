# 四品牌售后网站飞书后台配置说明

这套方案用于 `xuenav`、`viknan`、`boxnav`、`beautytrees` 四个售后网站共用一套代码和飞书数据源。每个后台账号只管理自己绑定的网站，商品和 FAQ 通过 `Site Key` 隔离。

## 0. 上线前配置清单

1. 在 `src/config/brands.js` 确认四个站点的正式域名、联系人、WhatsApp、邮箱和主题色。
2. `VIKNAN` 与 `BOXNAV` 当前使用文字 Logo，无需上传 Logo 图片。
3. `BEAUTYTREES` 已使用 `src/assets/images/logoHai.png` 和蓝紫主题；请补充正式域名、联系人、WhatsApp、邮箱与二维码图片。
4. 在 Vercel 项目绑定四个域名；预览其他品牌时可设置 `VITE_DEFAULT_SITE_KEY=viknan`、`boxnav` 或 `beautytrees`。
5. 在 Products 和 FAQs 两张飞书表新增文本字段 `Site Key`。有效值为 `xuenav`、`viknan`、`boxnav`、`beautytrees`。
6. 在 Vercel 配置四组后台账号密码；账号登录后由服务端确定站点，前端不能切换到其他品牌。

历史数据没有 `Site Key` 时会作为 `xuenav` 数据读取。其他品牌新增数据时必须带有对应 `Site Key`。

## 1. 创建飞书多维表格

在飞书中新建一个多维表格，例如：

```txt
售后官网 CMS
```

只需创建两张数据表：

```txt
Products
FAQs
```

可以使用本目录内的 CSV 示例导入初始字段：

```txt
docs/templates/feishu-products-template.csv
docs/templates/feishu-faqs-template.csv
```

商品封面和首页 Banner 都存放在 Products 表，不需要额外创建图片数据表。

## 2. Products 商品表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Site Key | 文本 | xuenav | 所属网站 |
| Product ID | 文本 | camaro-radio-10-15 | 商品唯一 ID |
| Name | 文本 | Car Radio for Chevrolet Camaro | 商品名称，也是安装视频标题 |
| Cover Image | 附件或文本 URL | https://...jpg | 商品封面图 |
| Video URL | 文本 | https://www.youtube.com/watch?v=... | 安装视频链接，可留空 |
| Start | 数字 | 0 | 视频开始秒数，可留空 |
| Sort | 数字 | 1 | 排序，从小到大 |
| Status | 单选/文本 | Published | `Published` 或 `已发布` 才显示 |

后台保存首页 Banner 时会自动在 Products 表写入一条 `Product ID` 为 `__site_settings__` 的记录。该记录由程序过滤，不会显示成商品。

`VIKNAN`、`BOXNAV` 与 `BEAUTYTREES` 在未保存 Banner 配置时会显示代码内置的品牌默认图；通过后台上传并保存后，自定义图片会优先展示。`XUENAV` 保持原首页默认图不变。

## 3. FAQs 商品 FAQ 表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Site Key | 文本 | xuenav | 所属网站，后台自动写入 |
| Product ID | 文本 | camaro-radio-10-15 | 对应商品；默认 FAQ 使用 `__default__` |
| Question | 文本 | What should I check before installation? | FAQ 问题 |
| Answer | 多行文本 | Please confirm wiring... | FAQ 回答 |
| Image URLs | 多行文本 | https://...jpg | FAQ 图片公开 URL，每行一张 |
| Images | 附件或文本 URL | https://...jpg | 旧数据兼容字段 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 发布状态 |

后台“默认 FAQ”页签可将网站内置 FAQ 写入飞书表，已存在的相同问题会跳过。

## 4. 获取飞书参数

### 应用凭证

1. 进入飞书开放平台，创建企业自建应用。
2. 复制应用的 `App ID` 和 `App Secret`。
3. 给应用开通多维表格记录读写和字段管理权限。
4. 将应用添加为多维表格协作者，授予读写权限。

对应环境变量：

```txt
FEISHU_APP_ID
FEISHU_APP_SECRET
```

### 多维表格与数据表 ID

多维表格 URL 类似：

```txt
https://example.feishu.cn/base/AbCdEfGhIjKlMnOp?table=tblxxxx
```

`base/` 后面的值是 `FEISHU_BITABLE_APP_TOKEN`，`table=` 后面的值是当前表的 Table ID：

```txt
FEISHU_BITABLE_APP_TOKEN=AbCdEfGhIjKlMnOp
FEISHU_PRODUCTS_TABLE_ID=tblProductsxxxx
FEISHU_FAQS_TABLE_ID=tblFaqsxxxx
```

后台的“打开飞书后台”按钮使用完整表格链接：

```txt
VITE_FEISHU_BITABLE_URL=https://example.feishu.cn/base/AbCdEfGhIjKlMnOp
```

## 5. 后台账号配置

四组账号密码只配置在 Vercel 环境变量中，不要写入代码或飞书表。各账号固定对应一个站点：

```txt
ADMIN_XUENAV_USERNAME
ADMIN_XUENAV_PASSWORD

ADMIN_VIKNAN_USERNAME
ADMIN_VIKNAN_PASSWORD

ADMIN_BOXNAV_USERNAME
ADMIN_BOXNAV_PASSWORD

ADMIN_BEAUTYTREES_USERNAME
ADMIN_BEAUTYTREES_PASSWORD
```

请为每个站点使用不同的用户名和强密码。用户登录 `/admin` 后只能看到和修改对应 `Site Key` 的数据，删除商品时也只会联动删除同站点 FAQ。

图片上传还需要：

```txt
BLOB_READ_WRITE_TOKEN
```

## 6. Vercel 环境变量汇总

在 Vercel Dashboard 的 `Settings > Environment Variables` 添加：

```txt
FEISHU_APP_ID
FEISHU_APP_SECRET
FEISHU_BITABLE_APP_TOKEN
FEISHU_PRODUCTS_TABLE_ID
FEISHU_FAQS_TABLE_ID
VITE_FEISHU_BITABLE_URL
BLOB_READ_WRITE_TOKEN
ADMIN_XUENAV_USERNAME
ADMIN_XUENAV_PASSWORD
ADMIN_VIKNAN_USERNAME
ADMIN_VIKNAN_PASSWORD
ADMIN_BOXNAV_USERNAME
ADMIN_BOXNAV_PASSWORD
ADMIN_BEAUTYTREES_USERNAME
ADMIN_BEAUTYTREES_PASSWORD
```

先在 `Preview` 环境验证，确认后同步到 `Production`。新增或修改环境变量后需要重新部署。

## 7. 验证

访问任一站点的公开内容接口，例如：

```txt
/api/content?siteKey=beautytrees
```

正常返回应包含对应站点数据和首页 Banner 设置：

```json
{
  "configured": true,
  "siteKey": "beautytrees",
  "settings": {
    "bannerImage": ""
  },
  "products": {}
}
```

后台使用每组账号分别登录，确认只能看到自己的商品、默认 FAQ 和首页 Banner。删除一个测试商品时，确认只删除同站点且相同 `Product ID` 的 FAQ。

## 8. 注意事项

- `Product ID` 在同一站点内必须唯一。
- 不同站点可以使用相同 `Product ID`，程序会按 `Site Key` 隔离读取、修改和删除。
- FAQ 新上传图片写入 `Image URLs` 多行文本字段；旧 `Images` 数据仍可显示。
- 如 `Image URLs` 尚不存在，后台首次保存图片会尝试自动创建文本字段，因此飞书应用必须具有字段管理权限。
- 首页 Banner 和商品封面直接使用 Products 表的 `Cover Image` 字段。

## 官方参考

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [飞书 tenant_access_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)
- [飞书多维表格 API](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/list)
