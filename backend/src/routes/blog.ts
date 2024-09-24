import { createBlogInput, updateBlogInput } from "@raj2704/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }, 
    Variables: {
        userId: string;
    }
}>();

// blogRouter.use("/*", async (c, next) => {
//     const authHeader = c.req.header("authorization") || "";
//     try {
//         const user = await verify(authHeader, c.env.JWT_SECRET);
//         if (user) {
//             if (user && typeof user.id === "string") {
//                 c.set('userId', user.id);
//             }
//             await next();
//         } else {
//             c.status(403);
//             return c.json({
//                 message: "You are not logged in"
//             })
//         }
//     } catch(e) {
//         c.status(403);
//         return c.json({
//             message: "You are not logged in"
//         })
//     }
// });

//for better checking
blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    console.log("Authorization Header:", authHeader); // Debugging line
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        console.log("Verified User:", user); // Debugging line
        if (user && typeof user.id === "number") {  // Ensure user.id is a number
            c.set('userId', String(user.id));       // Convert user.id to string if needed
            await next();                           // Allow the request to proceed
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            });
        }
    } catch (e) {
        console.error('JWT Verification Error:', e); // Debugging line
        c.status(403);
        return c.json({
            message: "You are not logged in"
        });
    }
});


blogRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { success } = createBlogInput.safeParse(body);
        if (!success) {
            c.status(411);
            return c.json({
                message: "Inputs not correct"
            });
        }

        const authorId = c.get("userId");
        if (!authorId) {
            c.status(403);
            return c.json({
                message: "User ID not found, authentication failed."
            });
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId), // Ensure authorId is a valid number
            },
        });

        return c.json({
            id: blog.id,
        });
    } catch (e) {
        console.error('Error creating blog:', e); // Log the error
        c.status(500);
        return c.json({
            message: "Internal server error",
        });
    }
});


blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs not correct"
        })
    }

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
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

// Todo: add pagination
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });

    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })
    
        return c.json({
            blog
        });
    } catch(e) {
        c.status(411); // 4
        return c.json({
            message: "Error while fetching blog post"
        });
    }
})