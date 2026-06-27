/**
 * API配置文件
 */

export const API_CONFIG = {
  // 妖狐API配置（用于搜索和播放解析）
  YAOHU_API_KEY: '1EHNXLDg6IwlYmb1lrT',  
  YAOHU_BASE_URL: 'https://api.yaohud.cn/api/v5',
  
  // Kuake马API配置（用于首页分类数据）
  KUAKEMA_BASE_URL: 'https://api.kuakema.com',
  // Kuake马域名池：按顺序尝试（用于解决部分域名在国内不可达）
  KUAKEMA_BASE_URLS: [
    'https://api.kuakema.com',
    'https://api.kuakema.cn'
  ],
  
  // 备用解析接口
  BACKUP_APIS: [
    'https://jx.xmflv.com',
    'https://www.yemu.xyz', 
    'https://jx.bozrc.com',
  ],
  
  TIMEOUT: 10000
}
