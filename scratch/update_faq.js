import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../diagnosis.html');

let html = fs.readFileSync(filePath, 'utf8');

const newFaqHTML = `
  <!-- ─── DIAGNOSIS DESCRIPTION & FAQ (SEO) ─── -->
  <section class="diagnosis-faq" style="max-width: 800px; margin: 60px auto 120px; padding: 0 24px;">
    
    <h2 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; margin-bottom: 24px; color: #17130F;">AIスキル診断テストとは？</h2>
    <p style="font-size: 15px; line-height: 1.8; color: #5C5247; margin-bottom: 32px;">
      THE AI RANK いわてが提供するこの無料テストは、あなたの現在のAI（人工知能）活用スキル・リテラシーを客観的に測るためのツールです。<br>
      「ChatGPTやGeminiを使ったことがある」という初心者（前哨）レベルから、「AIが会社や業務の収益基盤を自動化している」というシンギュラリアン（最高峰）レベルまで、全9段階の公式基準に基づいて判定します。<br>
      全10問の選択式テストに答える（所要時間：約2分）だけで、あなたの現在の立ち位置と「次に目指すべきステップ」を可視化します。
    </p>

    <h2 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; margin-bottom: 16px; color: #17130F; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 12px;">診断ロジック（判定の仕組み）について</h2>
    <p style="font-size: 15px; line-height: 1.8; color: #5C5247; margin-bottom: 32px;">
      判定ロジックは非常にシンプルです。<br>
      全10問の質問（Q1〜Q9）は、それぞれレベル1（日常利用）からレベル9（自律的運営）までの各「格付けランク」に紐づいています。<br>
      テストでは「全く使っていない」から「本番運用・ヘビーユースしている」まで4段階で回答を選択します。<br>
      このうち、**実用レベルである「2（常用している）」または「3（本番運用している）」と答えた質問の中で、最も高いレベル**があなたの最終ランクとして確定・算出されます。<br>
      <br>
      ※第10問は、知識の発信やコミュニティへの貢献度（OSS、登壇など）を測るボーナス問題であり、基準を満たすと認定証に業界貢献バッジが付与されます。
    </p>

    <h3 style="font-family: 'Shippori Mincho B1', serif; font-size: 20px; margin-bottom: 16px; color: #17130F; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 12px;">よくあるご質問（FAQ）</h3>
    <dl style="font-size: 14px; line-height: 1.6; color: #5C5247;">
      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. 診断に料金や事前の会員登録は必要ですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. いいえ、完全無料で事前の登録も不要です。ただし、結果の認定証画像をSNS等でシェアしたり、後から見返したりする場合は、結果画面で任意の情報（本名以外も可）を登録していただく必要があります。</dd>

      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. どのような基準（9段階）で判定しているのですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. 日常的なチャット利用（ビギナー）から始まり、自作AIボットの作成、24時間稼働ワークフローの構築、最終的にはAIによる事業収益化に至るプロセスを9つのマイルストーンとして定義しています。詳しくは結果画面に表示される次の段階へのアドバイスをご覧ください。</dd>

      <dt style="font-weight: bold; margin-bottom: 8px; color: #17130F;">Q. 法人で社員全体のAIスキルをまとめてテストすることは可能ですか？</dt>
      <dd style="margin-left: 0; margin-bottom: 24px;">A. はい。企業や自治体向けに、社内・組織全体のレベルを可視化する「法人向け専用アカウント」と研修プログラムを提供可能です。ご興味がある方はページ下部やお問い合わせフォームよりご相談ください。</dd>
    </dl>
  </section>
`;

// 置換処理
html = html.replace(/<!-- ─── DIAGNOSIS DESCRIPTION & FAQ \(SEO\) ─── -->[\s\S]*?<\/section>/, newFaqHTML.trim());

fs.writeFileSync(filePath, html, 'utf8');
console.log("FAQ and Logic section updated successfully.");
