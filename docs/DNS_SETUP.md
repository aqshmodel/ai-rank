# 🌐 ai-rank.aqsh.co.jp のDNS設定手順

**前提:** 本プロジェクトは自社VPSにてホストされています。
ドメインを購入したレジストラ（Cloudflare / Namecheap / お名前.com 等）のDNS設定画面で、VPSのIPアドレスに向けたレコードを追加してください。

---

## 🔧 DNSレコードの設定

### Aレコードの追加

以下の設定を追加してください：

| タイプ | ホスト | 値 | TTL |
|:---|:---|:---|:---:|
| A | @ （または `ai-rank` など） | `YOUR_VPS_IP_ADDRESS` | Auto / 300 |
| CNAME | `www` | `ai-rank.aqsh.co.jp.` | Auto |

**※ `YOUR_VPS_IP_ADDRESS` は実際のVPSサーバーのIPに置き換えてください。**
- Cloudflare を利用する場合、一時的に「プロキシ（オレンジ色の雲アイコン）」をOFFにし、DNS only 状態にしておくと、サーバー側でのSSL証明書（Let's Encrypt 等）の発行がスムーズになります。

---

## ✅ 設定後の確認

```bash
# DNS反映チェック
dig ai-rank.aqsh.co.jp +short
# → VPSのIPアドレスが返ればOK
```

またはブラウザで `https://ai-rank.aqsh.co.jp` に直接アクセスし、ページが開くことを確認してください。

---

## 🚧 SSL発行について

DNSが正しく向いた後、VPS上で Nginx や Caddy などのリバースプロキシ設定を通じ、Certbot (Let's Encrypt) 等を用いて SSL証明書を発行してください。
