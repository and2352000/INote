import { Children, isValidElement } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import MermaidBlockDynamic from './MermaidBlockDynamic'

function Pre(props: ComponentPropsWithoutRef<'pre'>) {
  const child = Children.toArray(props.children)[0]
  if (
    isValidElement<{ className?: string; children?: string }>(child) &&
    child.props.className === 'language-mermaid' &&
    typeof child.props.children === 'string'
  ) {
    return <MermaidBlockDynamic code={child.props.children.trim()} />
  }
  return <pre {...props} />
}

export const mdxComponents = {
  pre: Pre,
}
