import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'


// DELETE /api/post/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).send({ message: 'Method Not Allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  // Only the author may delete a post; posts owned by someone else are
  // reported as not found so their existence isn't revealed.
  const { count } = await prisma.post.deleteMany({
    where: { id: String(req.query.id), author: { email: session.user.email } },
  });
  if (count === 0) {
    return res.status(404).send({ message: 'Not Found' })
  }
  res.status(204).end();
}
