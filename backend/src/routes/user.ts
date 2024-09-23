import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { signinInput, signupInput } from '@raj2704/medium-common'

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string
      JWT_SECRET: string
    }
  }>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);

    if(!success) {
      c.status(411);
      return c.json({msg: "inputs not correct"})
    }
  
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    })
  
    //generating a jwt token from hono/jwt
  
    const token = await sign({ id: user.id}, c.env.JWT_SECRET)
  
    return c.json({jwt: token})
  })
  
  userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if(!success) {
      c.status(411);
      return c.json({msg: "inputs not correct"})
    }
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      }
    });
  
    if(!user) {
      c.status(403);
      return c.json({error: "user not found"})
    }
  
    //if found the user, then signin with jwt
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  
    return c.json({jwt: token});
  })