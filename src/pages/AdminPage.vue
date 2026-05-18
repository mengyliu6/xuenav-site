<template>
  <div class="admin-page">
    <header class="admin-topbar">
      <div>
        <span>XUENAV 内部后台</span>
        <h1>飞书多维表格内容管理</h1>
      </div>
      <RouterLink to="/" class="secondary-btn">返回官网</RouterLink>
    </header>

    <main class="admin-guide">
      <section class="admin-guide-hero">
        <span class="product-eyebrow">Internal CMS</span>
        <h2>在飞书里编辑，官网自动读取</h2>
        <p>
          适合 1-2 位内部同事维护商品图片、视频链接和专属 FAQ。官网通过
          Vercel API 服务端读取飞书，多维表格里的密钥不会暴露给访客。
        </p>

        <a
          v-if="bitableUrl"
          class="primary-btn"
          :href="bitableUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          打开飞书后台
        </a>
      </section>

      <section class="admin-guide-grid">
        <article class="admin-card">
          <div class="admin-section-title">
            <span>Tables</span>
            <h2>建议建 3 张表</h2>
          </div>

          <div class="admin-table-schema">
            <h3>Products 商品表</h3>
            <p>商品基础信息。`Product ID` 必须和代码里的商品 id 一致。</p>
            <ul>
              <li>Product ID / 商品ID</li>
              <li>Name / 商品名称</li>
              <li>Cover Image / 封面图</li>
              <li>Video URL / 视频链接</li>
              <li>Start / 视频开始秒数</li>
              <li>Sort / 排序</li>
              <li>Status / 状态，填 Published 或 已发布</li>
            </ul>
          </div>

          <div class="admin-table-schema">
            <h3>Gallery 商品图片表</h3>
            <p>每个商品可以添加多张图片和说明。</p>
            <ul>
              <li>Product ID / 商品ID</li>
              <li>Image / 图片</li>
              <li>Caption / 图片说明</li>
              <li>Sort / 排序</li>
              <li>Status / 状态</li>
            </ul>
          </div>

          <div class="admin-table-schema">
            <h3>FAQs 商品 FAQ 表</h3>
            <p>每个商品可以添加独立 FAQ，FAQ 里也可以插入多张图片。</p>
            <ul>
              <li>Product ID / 商品ID</li>
              <li>Question / 问题</li>
              <li>Answer / 回答</li>
              <li>Images / 图片</li>
              <li>Sort / 排序</li>
              <li>Status / 状态</li>
            </ul>
          </div>
        </article>

        <aside class="admin-card">
          <div class="admin-section-title">
            <span>Vercel Env</span>
            <h2>需要配置的环境变量</h2>
          </div>

          <div class="admin-env-list">
            <code>FEISHU_APP_ID</code>
            <code>FEISHU_APP_SECRET</code>
            <code>FEISHU_BITABLE_APP_TOKEN</code>
            <code>FEISHU_PRODUCTS_TABLE_ID</code>
            <code>FEISHU_GALLERY_TABLE_ID</code>
            <code>FEISHU_FAQS_TABLE_ID</code>
            <code>VITE_FEISHU_BITABLE_URL</code>
          </div>

          <p class="admin-help-text">
            WPS 表格也可以走开放平台 API，但权限、附件 URL 和接口稳定性不如飞书多维表格适合做轻量 CMS。当前实现优先支持飞书。
          </p>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";

const bitableUrl = import.meta.env.VITE_FEISHU_BITABLE_URL || "";
</script>
