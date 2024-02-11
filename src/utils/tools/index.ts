// 比较两个数组相等
export function arraysAreEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}

// 数组去重
export function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

// 判断类型
export function is(data: any) {
  return function (type: string) {
    return Object.prototype.toString.call(data) === `[object ${type}]`
  }
}

export function sortChordArray(arr: string[]): string[] {
  return arr.sort((a, b) => {
    // 如果 a 含有 ...，而 b 不含有 ...，则 a 排在 b 后面
    if (a.includes('...') && !b.includes('...')) {
      return 1
    }
    // 如果 b 含有 ...，而 a 不含有 ...，则 a 排在 b 前面
    if (!a.includes('...') && b.includes('...')) {
      return -1
    }
    // 其他情况保持原顺序不变
    return 0
  })
}
