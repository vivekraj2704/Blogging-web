import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { auth } from 'hono/utils/basic-auth';
import { createBlogInput } from '@raj2704/medium-common';

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
  }>();

//initializing the middleware for checks before the user reaches to the blogs 
blogRouter.use('/*', async (c, next) => {
    try {
        const authHeader = c.req.header("authorization") || "";
        const response = await verify(authHeader, c.env.JWT_SECRET);

        if(response) {
            // c.set('userId', response.id);
            if (response && typeof response.id === "string") {
                c.set('userId', response.id);
            }
            await next()
        } else {
        c.status(403)
        return c.json({error: "unauthorized"})
    }
    } catch(e) {
        return c.json({msg: e})
    }
    
})
  

blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

      const body = await c.req.json();
      const { success } = createBlogInput.safeParse(body);
      if(!success) {
        c.status(411);
        return c.json({msg: "inputs not correct"})
      }
      const authorId = c.get("userId");
      const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            published: true,
            authorId: authorId
        }
      })

      return c.json({
        id: blog.id
      })
})

blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    
    const blog = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content
        }
    })

    return c.json({
    id: blog.id
    })
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const posts = await prisma.post.findMany();
    return c.json({
        posts
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json();
        const blog = await prisma.post.findFirst({
            where: {
                id: id
            }
        })
        return c.json({
            blog
        })
    }catch (err) {
        c.status(411);
        return c.json({
            msg: "can't get the post", err
        })
    }
    
})