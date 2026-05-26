# 三品牌售后网站飞书后台配置说明

这套方案用于 `xuenav`、`viknan`、`boxnav` 三个售后网站共用一个后台：编辑人员在飞书多维表格里按站点维护商品、图片、FAQ，官网通过 Vercel API 自动读取。

## 0. 三站点配置清单

代码已经支持按域名自动识别品牌，并在 `xuenav/admin` 后台切换管理站点。你需要完成这些配置：

1. 在 [src/config/brands.js](../src/config/brands.js) 填写 `viknan`、`boxnav` 的正式域名、联系人、WhatsApp、邮箱和主题色。
2. 将新品牌 Logo、白色 Logo、WhatsApp 二维码图片放入 `src/assets/images/`，在 `brands.js` 中导入并填入 `logo`、`logoWhite`、`qr`。
3. 在 Vercel 同一个项目绑定三个正式域名；预览部署或本地测试其他品牌时设置 `VITE_DEFAULT_SITE_KEY=viknan` 或 `boxnav`。
4. 在 Products、Gallery、FAQs 三张飞书表新增文本字段 `Site Key`。有效值严格使用 `xuenav`、`viknan`、`boxnav`。

历史数据没有 `Site Key` 时会自动视为 `xuenav`。后台保存的 Products 和 FAQs 会自动写入当前选择的站点；Gallery 暂未在后台编辑，手动新增图库记录时必须填写 `Site Key`。

## 1. 创建飞书多维表格

在飞书中新建一个多维表格，建议命名为：

```txt
售后官网 CMS
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
| Site Key | 文本 | xuenav | 所属网站，填写 `xuenav` / `viknan` / `boxnav` |
| Product ID | 文本 | camaro-radio-10-15 | 必须和 `src/data/products.js` 里的 `id` 一致 |
| Name | 文本 | Car Radio for Chevrolet Camaro 2010-2015 | 商品名称，也作为 Installation 页面视频标题 |
| Cover Image | 附件或文本 URL | https://...jpg | 商品封面图 |
| Video URL | 文本 | https://www.youtube.com/watch?v=... | YouTube 安装视频链接；填写后商品会显示在 `/installation`，可留空 |
| Start | 数字 | 0 | 视频开始秒数，可留空 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 填 `Published` 或 `已发布` 才会显示 |

## 3. Gallery 商品图片表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Site Key | 文本 | xuenav | 所属网站，必须填写 |
| Product ID | 文本 | camaro-radio-10-15 | 对应商品 |
| Image | 附件或文本 URL | https://...jpg | 商品详情页图库图片 |
| Caption | 文本 | Dashboard installation preview | 图片说明 |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 发布状态 |

## 4. FAQs 商品 FAQ 表字段

| 字段名 | 类型 | 示例 | 说明 |
| --- | --- | --- | --- |
| Site Key | 文本 | xuenav | 所属网站；后台保存时自动写入 |
| Product ID | 文本 | camaro-radio-10-15 | 对应商品 |
| Question | 文本 | What should I check before installation? | FAQ 问题 |
| Answer | 多行文本 | Please confirm wiring... | FAQ 回答 |
| Image URLs | 多行文本 | https://...jpg | FAQ 公开图片 URL，可留空，每行一张；后台首次保存图片时可自动创建 |
| Images | 附件或文本 URL | https://...jpg | 旧数据兼容读取字段；新上传图片请使用 `Image URLs` |
| Sort | 数字 | 1 | 排序 |
| Status | 单选/文本 | Published | 发布状态 |

进入后台的“默认 FAQ”页签后，可点击“导入网站默认 FAQ”将代码内置 FAQ 一次性写入该表；已存在的相同问题会自动跳过。

## 5. 获取飞书参数

需要准备 6 个后端环境变量和 1 个前端展示链接。

### FEISHU_APP_ID / FEISHU_APP_SECRET

1. 进入飞书开放平台。
2. 创建企业自建应用。
3. 在应用凭证里复制 `App ID` 和 `App Secret`。
4. 给应用开通多维表格记录读写及字段管理相关权限。
5. 将这个应用添加为多维表格协作者，确保它有读写权限。

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
/api/content?siteKey=xuenav
```

正常时应返回：

```json
{
  "configured": true,
  "siteKey": "xuenav",
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
- `Site Key` 用于隔离三个网站的数据；商品 ID 即使相同，也只会关联和删除同站点 FAQ。
- 商品封面/图库字段可以使用飞书附件或公网 URL。FAQ 上传图片使用公开 Blob URL，并写入 `Image URLs` 多行文本字段；飞书附件字段不能直接保存该 URL。
- 若 FAQ 表已有文本类型的 `Images` 字段，后台会继续使用该字段；若 `Images` 为附件或链接类型，后台会自动创建并改用 `Image URLs` 文本字段。
- `Status` 为空也会显示；如果要控制上下线，填 `Published` / `已发布` 表示显示，其他状态不显示。
- 排序使用 `Sort` 数字，从小到大。
- 飞书表格要给自建应用记录读写和字段管理权限，否则上传图片保存或自动创建 `Image URLs` 字段时会返回权限错误。

## 官方参考

- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
- 飞书 tenant_access_token: https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal
- 飞书多维表格 API: https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/list
