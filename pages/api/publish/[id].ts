import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'

// PUT /api/publish/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).send({ message: 'Method Not Allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  // Only the author may publish a post.
  const { count } = await prisma.post.updateMany({
    where: { id: String(req.query.id), author: { email: session.user.email } },
    data: { published: true },
  });
  if (count === 0) {
    return res.status(404).send({ message: 'Not Found' })
  }
  res.status(204).end();
}
