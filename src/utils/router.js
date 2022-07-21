import router from '@/config/router'

const pages = (() => {

  const pageFilter = item => {
    if (item.platform) {
      return item.platform?.includes(process.env.TARO_ENV)
    }
    return true
  }

  return Object.fromEntries(
    Object
      .keys(router.pages)
      .map(key => {
        const { pages: subPages, subPackage, ...arg } = router.pages[key]
        if (subPages) {
          // 分组
          return Object.keys(subPages).filter(item => pageFilter({ ...arg, ...subPages[item] })).map(item => [`${key}/${item}`, { ...arg, ...subPages[item] }])
        } else {
          // 普通页面
          return [key].filter(() => pageFilter(arg)).map(item => [item, arg])
        }
      })
      .flat()
      // 去重
      .reduceRight((prev, current) => {
        !prev.some(item => item[0] === current[0]) && prev.unshift(current)
        return prev
      }, [])
  )
})();

export default pages

export {
  router as config
}
