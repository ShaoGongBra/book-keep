/**
 * 默认主题配置
 */

// 主色
const primaryColor = '#337ab7'
// 辅色
const secondaryColor = '#5bc0de'

export default {
  // General
  primaryColor,
  secondaryColor,
  successColor: '#34a853',
  warningColor: '#fbbc05',
  dangerColor: '#ea4335',
  pageColor: '#f8f8f8',
  mutedColor: '#666',

  // Header
  headerColor: '#251a0c', // 仅支持rgb hex值，请勿使用纯单词
  headerShowWechat: false, // 微信公众号是否显示header
  headerShowWap: true, // h5是否显示header

  // Button
  buttonColor: '#000',
  buttonRadiusType: 'fillet' , // 按钮圆角类型 right-angle直角 fillet圆角 fillet-min较小的圆角
  buttonSize: 'm', // 按按钮尺寸 s m l xl xxl xxxl
  buttonPlain: false, // 是否镂空

  // Tab
  tabTextColor: '#666',
  tabHoverTextColor: primaryColor,
  tabHoverLineColor: primaryColor,

  // 商品
  goodsPriceColor: '#ff442a',
  goodsMarketPriceColor: '#999',

  // 商品列表
  goodsListCartIcon: 'gouwuche',
  goodsListCartColor: '#FF442A',

  // 商品详情
  goodsDetailBuyColor: '#ff442a',
  goodsDetailCartColor: '#ff9324',

  // 规格选择
  specDataColor: '#888',
  specDataSelectColor: '#333',
  specDataRadiusType: 'fillet',
  specDataSize: 'm',
  specDataPlain: true,

  // 分类页面
  goodsCategorySelectColor: '#fa2a0a'
}
