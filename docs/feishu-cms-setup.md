# XUENAV 飞书多维表格后台配置说明

这套方案适合公司内部 1-2 人维护官网内容：编辑人员在飞书多维表格里改商品、图片、FAQ，官网通过 Vercel API 自动读取。

## 1. 创建飞书多维表格

在飞书中新建一个多维表格，建议命名为：

```txt
XUENAV 售后官网 CMS
```

创建 3 张数据表：

```txt
Products
Gallery
FAQs
```

也可以先用本目录里的 CSV 示例导入：

```txt
docs/templates/feishu-products-template.csv
docs/templates/feishu-gallery-template.csv
docs/templates/feishu-faqs-template.csv
```

## 2. Products 商品表字段

字段名建议严格按下面英文命名，当前代码已兼容部分中文字段，但英文最稳。

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Product ID | 文本 | camaro-radio-10-15 | 必须和 `src/data/products.js` 里的 `id` 一致 |
| Name | 文本 | Car Radio for Chevrolet Camaro 2010-2015 | 商品名称 |
| Cover Image | 附件或文本 URL | https://...jpg | 商品封面图 |
| Video URL | 文本 | https://www.youtube.com/watch?v=... | 商品视频链接，可留空 |
| Start | 数字 | 0 | 视频开始秒数，可留空 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 填 `Published` 或 `已发布` 才会显示 |

## 3. Gallery 商品图片表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Product ID | 文本 | camaro-radio-10-15 | 对应商品 |
| Image | 附件或文本 URL | https://...jpg | 商品详情页图库图片 |
| Caption | 文本 | Dashboard installation preview | 图片说明 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 发布状态 |

## 4. FAQs 商品 FAQ 表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Product ID | 文本 | camaro-radio-10-15 | 对应商品 |
| Question | 文本 | What should I check before installation? | FAQ 问题 |
| Answer | 多行文本 | Please confirm wiring... | FAQ 回答 |
| Images | 附件或文本 URL | https://...jpg | FAQ 图片，可留空，可多张 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 发布状态 |

## 5. 获取飞书参数

需要准备 6 个后端环境变量和 1 个前端展示链接。

### FEISHU_APP_ID / FEISHU_APP_SECRET

1. 进入飞书开放平台。
2. 创建企业自建应用。
3. 在应用凭证里复制 `App ID` 和 `App Secret`。
4. 给应用开通多维表格读取相关权限。
5. 将这个应用添加为多维表格协作者，确保它有读取权限。

### FEISHU_BITABLE_APP_TOKEN

打开多维表格，浏览器地址一般类似：

```txt
https://example.feishu.cn/base/AbCdEfGhIjKlMnOp?table=tblxxxx
```

其中 `base/` 后面的 `AbCdEfGhIjKlMnOp` 就是：

```txt
FEISHU_BITABLE_APP_TOKEN
```

### FEISHU_PRODUCTS_TABLE_ID / FEISHU_GALLERY_TABLE_ID / FEISHU_FAQS_TABLE_ID

打开每张表时，URL 里通常会有：

```txt
table=tblxxxxxxxxxxxx
```

这个 `tbl...` 就是对应表的 `TABLE_ID`。

例如：

```txt
FEISHU_PRODUCTS_TABLE_ID=tblProductsxxxx
FEISHU_GALLERY_TABLE_ID=tblGalleryxxxx
FEISHU_FAQS_TABLE_ID=tblFaqsxxxx
```

### VITE_FEISHU_BITABLE_URL

这是 `/admin` 页面里的“打开飞书后台”按钮链接，填你的多维表格地址即可。

```txt
VITE_FEISHU_BITABLE_URL=https://example.feishu.cn/base/AbCdEfGhIjKlMnOp
```

## 6. 在 Vercel 配置环境变量

1. 打开 Vercel Dashboard。
2. 进入 `xuenav-site` 项目。
3. 进入 `Settings`。
4. 进入 `Environment Variables`。
5. 逐个添加下面变量：

```txt
FEISHU_APP_ID
FEISHU_APP_SECRET
FEISHU_BITABLE_APP_TOKEN
FEISHU_PRODUCTS_TABLE_ID
FEISHU_GALLERY_TABLE_ID
FEISHU_FAQS_TABLE_ID
VITE_FEISHU_BITABLE_URL
```

6. 环境建议先勾选 `Preview`，测试环境确认没问题后再勾选 `Production`。
7. 保存后重新部署一次。Vercel 新增环境变量后，旧部署不会自动拥有这些新值。

## 7. 测试

配置完成后访问：

```txt
/api/content
```

正常时应返回：

```json
{
  "configured": true,
  "products": {
    "camaro-radio-10-15": {
      "name": "...",
      "image": "...",
      "videoUrl": "...",
      "gallery": [],
      "faqs": []
    }
  }
}
```

如果返回：

```json
{
  "configured": false,
  "products": {}
}
```

说明 Vercel 环境变量还没配完整，或测试环境还没有重新部署。

## 8. 注意事项

- `Product ID` 必须和代码里的商品 `id` 完全一致。
- 图片字段可以用飞书附件，也可以直接填图片 URL。若附件图无法在官网显示，建议先改为公网图片 URL。
- `Status` 为空也会显示；如果要控制上下线，填 `Published` / `已发布` 表示显示，其他状态不显示。
- 排序使用 `Sort` 数字，从小到大。
- 飞书表格权限要给自建应用读取权限，否则 API 会返回权限错误。

## 官方参考

- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- 飞书 tenant_access_token: https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal
- 飞书多维表格 API: https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/list
