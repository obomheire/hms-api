import { FilterQuery, Model } from 'mongoose';
import { PaginationDto } from '../dtos/pagination.dto';

/**
 * This function is used to add pagination to an endpoint.
 * @param { any } model: This is the model to perform query on.
 * @param { object } queryObject: This is the definition of the query to pass to the model.
 * This is always an object containing field and search terms.
 * @param { Number } limit: maximum number of date to fetch at once
 * @param { Number } page: The page in the result to show or return.
 * @param { String } resultName: This is the key in which to store the result in the
 * response object. It defaults to "result".
 * @param { String } sortBy: This is the field in the db to use for sorting the response/result.
 * @param { Array } fieldsToPopulate: This are the field in the query that you want to populate
 * with data from other model or references.
 */
export const paginator = async <M>(
  model: Model<any, Record<string, unknown>>,
  queryObject: FilterQuery<M>,
  paginationData: PaginationDto,
  fieldsToPopulate?: string[],
  resultName = 'result',
  sortBy = 'createdAt',
) => {
  let { limit, page } = paginationData;
  if (!limit) {
    limit = 20;
  }
  if (!page) {
    page = 1;
  }
  const query = await model
    .find(queryObject)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortBy)
    .populate(fieldsToPopulate)
    .exec();
  const count = await model.countDocuments(queryObject);
  const totalPages = Math.ceil(count / limit) || 0;
  const result = {
    count,
    totalPages,
    currentPage: page,
  };
  result[resultName] = query;
  return result;
};
