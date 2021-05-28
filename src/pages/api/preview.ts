// Receber a requisição da API do Prismic com as query params
// documentID e token, gerar a url, setar as informações do documento de acordo
// com o Preview e redirecionar o usuário para a url gerada;
import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '@prismicio/client/types/documents';
import { getPrismicClient } from '../../services/prismic';

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

const Preview = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { token: ref, documentId } = req.query;
  const redirectUrl = await getPrismicClient(req)
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const redirectedTemporarily = 307;
  res.setPreviewData({ ref });
  res.writeHead(redirectedTemporarily, { location: redirectUrl });
  res.end();
};

export default Preview;
