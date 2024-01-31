import { BasePaginatedResponseDto } from "./base/dto";

export const buildResponseDataWithPagination = <T>(
  data: T[] | any,
  total: number,
  pagination: { limit: number; page: number },
): BasePaginatedResponseDto<T> => {
  return {
    data,
    pagination: {
      limit: Number(pagination.limit),
      page: Number(pagination.page),
      total,
      size: data.length,
      pages:
        Number(Math.ceil(total / pagination.limit).toFixed()) ||
        (total && 1) ||
        0,
    },
  };
};