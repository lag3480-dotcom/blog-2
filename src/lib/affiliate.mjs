// 제휴(쿠팡 파트너스) 링크 처리. 마크다운 본문의 쿠팡 파트너스 링크를 찾아
// rel="sponsored nofollow"를 붙이고, 글 상단 대가성 문구 표시용 플래그를 남긴다.
import { SITE } from '../site.config.mjs';

const COUPANG = /^https?:\/\/(link\.coupang\.com|coupa\.ng)\//;

export const COUPANG_NOTICE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

// Sätteri hast 플러그인 (Astro 기본 마크다운 처리기)
export function affiliateLinks({ fileURL }) {
  return {
    name: 'affiliate-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = String(node.properties?.href ?? '');
        if (!COUPANG.test(href)) return;
        // 애드센스 승인 전이나 정책 문구가 준비되기 전에 링크가 들어가는 것을 막는다.
        if (!SITE.coupangPartners) {
          throw new Error(`${fileURL?.pathname ?? '글'}: 쿠팡 파트너스 링크가 있지만 site.config의 coupangPartners가 꺼져 있습니다.`);
        }
        ctx.setProperty(node, 'rel', ['sponsored', 'nofollow', 'noopener']);
        ctx.setProperty(node, 'target', '_blank');
        const fm = ctx.data.astro?.frontmatter;
        if (fm) fm.affiliate = 'coupang';
      },
    },
  };
}
