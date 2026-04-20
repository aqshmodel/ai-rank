import os
import glob

terms_dir = "/Users/tsukadatakahiro/Python/app/the-ai-rank/terms"
# 新規作成した26ファイルのリスト（これらは除外する）
new_files = [
    "ide.md", "vscode.md", "devcontainer.md", "environment-variables.md", "env-file.md",
    "mkdir.md", "rm.md", "gitignore.md", "git.md", "github.md",
    "frontend.md", "backend.md", "framework.md", "database.md", "cache.md",
    "cookie.md", "ip-address.md", "dns.md", "encryption.md", "private-key.md",
    "ssh.md", "ftp.md", "docker.md", "deploy.md", "debug.md", "log.md"
]

all_md = glob.glob(os.path.join(terms_dir, "*.md"))
existing_files = [f for f in all_md if os.path.basename(f) not in new_files]

print(f"Total existing files to analyze: {len(existing_files)}")

weak_files = []

for file_path in existing_files:
    fname = os.path.basename(file_path)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 見出しを抽出
    headers = [line.strip() for line in content.split('\n') if line.startswith('## ')]
    
    # 内容全体を小文字化してキーワードチェック
    lower_content = content.lower()
    
    # 強いAI文脈を含むかどうかの簡易ヒューリスティック
    has_ai_context_header = any(
        kw in h for h in headers for kw in ["ai", "生成", "脅威", "ジレンマ", "時代", "重要性", "次世代", "進化"]
    )
    
    # "ai" そのものの出現回数
    ai_count = lower_content.count("ai")
    
    # 単純な機能説明しかないと思われるものをマーク
    # 見出しの中にAI文脈がなく、かつ、中身にも「AI」に関する記述が2回以下の場合など
    # ここでは、全ファイルの見出し構成を出力して目検できるようにする
    
    # 今回は確実に全ての見出しを出力し、人間（Agent）がそれを見て判断する
    print(f"\n--- {fname} ---")
    print(f"AI Keyword Count: {ai_count}")
    print("Headers:")
    for h in headers:
        print(f"  {h}")
