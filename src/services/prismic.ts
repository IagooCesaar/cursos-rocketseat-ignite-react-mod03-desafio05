import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const accessToken = process.env.PRISMIC_ACCESS_TOKEN;
  const endPoint = process.env.PRISMIC_API_ENDPOINT;
  const prismic = Prismic.client(endPoint, {
    req,
    accessToken,
  });
  return prismic;
}
