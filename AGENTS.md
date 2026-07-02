# i18n-error-base リポジトリーの指針

i18n-error-base は、クラス `I18nErrorBase` を提供するライブラリです。`I18nErrorBase` は `Error` を継承したクラスで、ロケールに応じたエラーメッセージを扱えます。

## プロジェクトの構成

- メインパッケージは `i18n-error-base/` にあります。
- ドキュメントは `website/` にあります。Astro Starlight で構築され、GitHub Pages でホストされます。

## コマンド

```sh
# 完全なテスト (順番: server vitest → client vitest → format → lint → typecheck)
mise run test

# 個々のステップ
mise run test:server      # npx vitest --config ./.config/vitest.server.ts
mise run test:client      # npx vitest --config ./.config/vitest.client.ts
mise run test:format      # npx oxfmt --check
mise run test:lint        # npx oxlint
mise run test:typecheck   # npx tsc --noEmit (5 つの tsconfig プロジェクト)

# フォーマット
mise run format

# ビルド
npm run build

# 依存関係の更新 (npm-check-upates → pnpm install → playwright install)
mise run update
```

## 言葉遣い

- 日本語の文章は、テストケースを除き、「です・ます調」とし、必ず句点で終えます。
- 不必要にカタカナ語を使いません。例えば「スローする」は「投げる」とします。

## コード規約

- 高品質な TSDoc と必要最低限の実装コメントの付与を心がけます。`@param <パラメーター名>` の直後にハイフン（-）を付けません。
- 必要に応じて、読み手がコードの背景、意図、ロジックを即座に理解できる、簡潔かつ丁寧な技術解説を提供します。

## リンティング、型チェック、フォーマット

- 型エラーがない場合は、ランダムにキャストしないでください（たとえば、`as any`)。 型を検証するには `mise run test:typecheck` を実行します。
- 変更内容がリンティングに合格していることを確認します。検証するには `mise run lint` を実行します。

## テスト

- テストフレームワークに Vitest を使用します。
- テストファイルのパターンは、`*.test.ts` (ブラウザー/サーバー共通)、`*.client.test.ts` (ブラウザー専用)、`*.server.test.ts` (サーバー専用) のいずれか 1 つです。
- クライアントテストは、Vitest の Browser Mode を利用して実際の Playwright ブラウザー上で実行します。
- CI がデバッグモードであれば コンパイル時定数 `__DEBUG__` は true になります。手動でデバッグモードにするには環境変数 `DEBUG` を `1` に設定します。
- コンパイル時定数 `__CLIENT__` と `__SERVER__` はそれぞれ真偽値でテストのランタイムを示します。

## ビルドおよび型チェックに関する注意点

- すべての tsconfig で `erasableSyntaxOnly: true` を有効化 (`enum` や 型定義以外の宣言を含む `namespace` の使用、パラメータープロパティーなどの、実行時にコードが生成される構文は使用不可) されています。
