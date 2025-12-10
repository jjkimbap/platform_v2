/**
 * 게시물 카테고리 매핑
 * category 번호에 따른 카테고리 이름 매핑
 */
export const POST_CATEGORY_MAP: Record<number, string> = {
  1: '코스메틱',
  2: '패션',
  3: '전자제품',
  4: '의학',
  5: '잡화',
  6: '기타',
  7: '리빙',
  8: '유아용품',
  9: '미용기기',
  10: '보증·관리',
  11: '제조·산업',
  12: '식품',
  13: '기능성뷰티',
  14: '토탈케어',
  15: '차량용품',
  16: '애완용품',
  17: '건강기능 식품',
  18: '주류·담배 (죄악산업)',
  19: '스포츠 용품',
  20: '공공기관·협회',
  21: '무역',
  22: '도소매',
  23: '엔터·IT',
  24: 'IP',
  25: '부동산',
}

/**
 * 카테고리 번호를 이름으로 변환
 * @param category 카테고리 번호 (1-25)
 * @returns 카테고리 이름, 없으면 '기타'
 */
export function getCategoryName(category?: number | null): string {
  if (!category || !POST_CATEGORY_MAP[category]) {
    return '기타'
  }
  return POST_CATEGORY_MAP[category]
}

/**
 * 모든 카테고리 목록 반환
 * @returns 카테고리 번호와 이름의 배열
 */
export function getAllCategories(): Array<{ id: number; name: string }> {
  return Object.entries(POST_CATEGORY_MAP).map(([id, name]) => ({
    id: Number(id),
    name,
  }))
}

/**
 * 게시물 커뮤니티 타입 매핑
 * boardType 번호에 따른 커뮤니티 이름 매핑
 */
export const BOARD_TYPE_MAP: Record<number, string> = {
  1: '정품제품리뷰',
  2: '정품 Q&A',
  3: '정품판별팁',
  4: '정품인증거래',
}

/**
 * 커뮤니티 타입 번호를 이름으로 변환
 * @param boardType 커뮤니티 타입 번호 (1-4)
 * @returns 커뮤니티 타입 이름, 없으면 '기타'
 */
export function getBoardTypeName(boardType?: number | null): string {
  if (!boardType || !BOARD_TYPE_MAP[boardType]) {
    return '기타'
  }
  return BOARD_TYPE_MAP[boardType]
}

/**
 * 모든 커뮤니티 타입 목록 반환
 * @returns 커뮤니티 타입 번호와 이름의 배열
 */
export function getAllBoardTypes(): Array<{ id: number; name: string }> {
  return Object.entries(BOARD_TYPE_MAP).map(([id, name]) => ({
    id: Number(id),
    name,
  }))
}

