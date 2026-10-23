// 사이트 전역 설정. 도메인을 연결하면 url을 바꾸고 base를 '/'로 바꾼다.
export const SITE = {
  url: 'https://moneysiljeonnote.com',
  base: '/',
  name: '머니 실전노트',
  description: '세금, 지원금, 예적금, 대출까지 생활 속 돈 문제를 공식 자료로 확인해서 쉽게 정리합니다.',
  author: '머니 실전노트 편집팀',
  email: 'lag3480@naver.com',
  googleSiteVerification: 'HKdyn7BT6LlKKXJKs3e4AZxR9g_J0-d8mTCnnajAt5I', // 서치 콘솔 HTML 태그의 content 값
  naverSiteVerification: '',
  // 쿠팡 파트너스 가입·애드센스 승인 후 true. 꺼져 있으면 글에 쿠팡 링크가 있을 때 빌드가 실패한다.
  coupangPartners: false,
  adsenseClient: '', // 예: 'ca-pub-0000000000000000' (승인 후 입력)
};
