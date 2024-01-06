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
