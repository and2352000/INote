import { notFound } from 'next/navigation'
import { getCategories, getPostsByCategory } from '@/lib/posts'
import CategoryList from '@/components/CategoryList'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }))
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const categories = getCategories()
  const cat = categories.find((c) => c.name === category)
  if (!cat) notFound()

  const posts = getPostsByCategory(category)

  return (
    <CategoryList
      category={category}
      catTitle={cat.title}
      catDescription={cat.description}
      posts={posts.map(({ slug, title, date, description, tags }) => ({
        slug, title, date, description, tags,
      }))}
    />
  )
}
