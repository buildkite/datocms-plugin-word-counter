// Based on https://github.com/voorhoede/datocms-plugin-word-counter/issues/1#issue-1097612229

export function visit(
  tree: any,
  callback: (node: any, index: number, parents: any) => void,
) {
  const all = (nodes: any, parents: any) =>
    nodes.forEach((node: any, index: number) => one(node, index, parents))
  const one = (node: any, index: number, parents: any) => {
    if ('children' in node) {
      all(node.children, [node, ...parents])
    }
    callback(node, index, parents)
  }
  if (Array.isArray(tree)) {
    all(tree, [])
  } else {
    one(tree, 0, [])
  }
}

export function isNonTextNode(node: any): boolean {
  return 'type' in node
}

export function isText(node: any): boolean {
  return (!isNonTextNode(node) && 'text' in node) || 'paragraphs' in node
}

export function structuredTextToString(value: any): string {
  let result: string = ''

  visit(value, (node) => {
    if (!isText(node)) {
      return
    }

    if (node.paragraphs) {
      result += `\n${node.paragraphs} `
    }

    if (node.text) {
      result += `\n${node.text} `
    }
  })

  return result
}
