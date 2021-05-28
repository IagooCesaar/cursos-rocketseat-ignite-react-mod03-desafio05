// Limpar as informações de Preview e redirecionar o usuário
// para a página principal.

import { NextApiRequest, NextApiResponse } from 'next';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.clearPreviewData();
  const redirectedTemporarily = 307;
  res.writeHead(redirectedTemporarily, { location: '/' });
  res.end();
};
