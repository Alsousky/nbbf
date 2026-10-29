import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'
import { authOptions } from '../auth/[...nextauth]'


// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send({ message: 'Method Not Allowed' })
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).send({ message: 'Unauthorized' })
  }

  const { title, content } = req.body;
  if (!title) {
    return res.status(400).send({ message: 'Title is required' })
  }

  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { email: session.user.email } },
    },
  });
  res.json(result);
}
