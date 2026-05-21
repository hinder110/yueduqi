import { describe, it, expect } from 'vitest';
import { cleanContent } from './bookParser';

describe('cleanContent — 广告过滤', () => {
  // ========== 广告行过滤 ==========

  it('过滤 VIP 打赏广告', () => {
    const input = '您当前未登录，今日已访问 1/3 次\n\n本书源属于晴天独有公益书源，提供免费阅读服务（如需下载请打赏开通VIP，非VIP用户进行缓存操作会封禁账号，打赏后可关闭该条信息），打赏vip现在限时折扣中！明天将会恢复原价！目前会不定期删除普通账户，减轻服务器压力，释放性能为vip服务器提供服务！如需下载缓存和去净化广告功能，请在用户后台页面打赏，备注邮箱会自动开通！如果未开通请联系作者邮箱（wj1085281124@gmail.com）或加入电报群(https://t.me/qingtain618_novel)';
    const result = cleanContent(input);
    expect(result).toBe('');
  });

  it('过滤含打赏关键词的行', () => {
    const input = '第一章 开始\n打赏后可继续阅读\n第二章 结束';
    const result = cleanContent(input);
    expect(result).toContain('第一章 开始');
    expect(result).toContain('第二章 结束');
    expect(result).not.toContain('打赏');
  });

  it('过滤含广告 VIP 语境的行（开通VIP、非VIP用户等）', () => {
    const input = '第一章\n开通VIP解锁完整版\n非VIP用户无法缓存\n第二章';
    const result = cleanContent(input);
    expect(result).toContain('第一章');
    expect(result).toContain('第二章');
    expect(result).not.toContain('开通VIP');
    expect(result).not.toContain('非VIP');
  });

  it('过滤含电报群/telegram 的行', () => {
    const input = '第一章开始\n加电报群获取更多 https://t.me/xxx\n第二章继续';
    const result = cleanContent(input);
    expect(result).toContain('第一章开始');
    expect(result).toContain('第二章继续');
    expect(result).not.toContain('t.me');
  });

  it('过滤含邮箱的行', () => {
    const input = '正经内容\n请联系xxx@gmail.com\n另一行正文';
    const result = cleanContent(input);
    expect(result).toContain('正经内容');
    expect(result).toContain('另一行正文');
    expect(result).not.toContain('gmail');
  });

  // ========== 正常内容保留 ==========

  it('保留正常章节内容', () => {
    const input =
      '黄昏时分，暮色四合，整座城市笼罩在一片金色的光晕之中。\n\n这座古老的城池，四四方方，横平竖直。';
    const result = cleanContent(input);
    expect(result).toContain('黄昏时分');
    expect(result).toContain('古老');
  });

  it('保留含用户对话的行', () => {
    const input = '他说道："你知道吗，我可是VIP会员。"';
    const result = cleanContent(input);
    expect(result).toContain('VIP会员');
  });

  it('输出为 HTML p 标签包裹', () => {
    const input = '第一行\n第二行';
    const result = cleanContent(input);
    expect(result).toBe('<p>第一行</p>\n<p>第二行</p>');
  });

  // ========== 空文本 ==========

  it('空字符串返回空', () => {
    expect(cleanContent('')).toBe('');
  });

  it('全广告文本返回空', () => {
    const input = '打赏\nVIP限时折扣\n联系作者xxx@gmail.com\n加电报群t.me/xxx';
    const result = cleanContent(input);
    expect(result).toBe('');
  });
});
