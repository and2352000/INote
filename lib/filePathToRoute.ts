import path from 'path'

const contentDir = path.join(process.cwd(), 'content')

/**
 * 將 content/ 下的 .md 檔案路徑轉為 Next.js route
 * e.g. content/dev/hello.md → /dev/hello
 */
export function filePathToRoute(filePath: string): string {
  const rel = path.relative(contentDir, path.resolve(filePath))
  const withoutExt = rel.replace(/\.md$/, '')
  const parts = withoutExt.split(path.sep)

  // _index.md → 分類頁
  if (parts[parts.length - 1] === '_index') {
    parts.pop()
    return '/' + parts.join('/')
  }

  return '/' + parts.join('/')
}
