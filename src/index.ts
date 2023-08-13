import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import createError from "http-errors"

const prisma = new PrismaClient()
const app = express()

app.use(express.json())


// TODO: Routing aplikasi akan kita tulis di sini

function isValidEmail(email: string): boolean {
    // Regex sederhana untuk validasi email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

app.get('/feed', async (req: Request, res: Response) => {
    const posts = await prisma.post.findMany({
      include: { author: true }
    })
    res.json(posts)
  })

  app.post('/post', async (req: Request, res: Response) => {
    const { content, authorEmail } = req.body;
  
    // Pastikan content dan authorEmail disediakan
    if (!content || !authorEmail) {
      return res.status(400).send('Content dan authorEmail diperlukan.');
    }
  
    try {
      // Cek apakah pengarang dengan email tersebut ada
      const author = await prisma.user.findUnique({ where: { email: authorEmail } });
  
      if (!author) {
        return res.status(400).send('Pengarang dengan email tersebut tidak ditemukan.');
      }
  
      // Buat post dan hubungkan ke pengarang
      const result = await prisma.post.create({
        data: {
          content,
          author: { connect: { email: authorEmail } }
        }
      });
  
      res.json(result);
    } catch (error) {
      // Tangani kesalahan yang tidak dikenali
      console.error('Kesalahan saat membuat post:', error);
      res.status(500).send('Kesalahan server internal.');
    }
  })
  
  app.get('/post/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    })
    res.json(post)
  })
  
  app.put('/post/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const post = await prisma.post.update({
        where: { id: Number(id) },
        data: {
          ...req.body
        }
      });
  
      res.json(post);
    } catch (error: any) {
      // Cek jika kesalahan terkait dengan post yang tidak ditemukan
      if (error.code === 'P2025') {
        return res.status(404).send('Post tidak ditemukan.');
      }
  
      // Tangani kesalahan yang tidak dikenali
      console.error('Kesalahan saat memperbarui post:', error);
      res.status(500).send('Kesalahan server internal.');
    }
  })
  
  
  app.delete('/post/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const post = await prisma.post.delete({
        where: { id: Number(id) }
      });
  
      res.json(post);
    } catch (error: any) {
      // Cek jika kesalahan terkait dengan post yang tidak ditemukan
      if (error.code === 'P2025') {
        return res.status(404).send('Post tidak ditemukan.');
      }
  
      // Tangani kesalahan yang tidak dikenali
      console.error('Kesalahan saat menghapus post:', error);
      res.status(500).send('Kesalahan server internal.');
    }
  });



  app.post('/user', async (req: Request, res: Response) => {
    const { name, email, username, ...otherFields } = req.body;
  
    // Validasi dasar
    if (!name || !isValidEmail(email) || !username) {
      return res.status(400).send('Input tidak valid.');
    }
  
    try {
      const result = await prisma.user.create({
        data: { name, email, username, ...otherFields }
      });
  
      res.json(result);
    } catch (error: any) {
      // Cek kesalahan batasan unik untuk email
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(400).send('Email sudah terdaftar.');
      }
      
      // Cek kesalahan batasan unik untuk username
      if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
        return res.status(400).send('Username sudah digunakan.');
      }

      // Cek kesalahan batasan unik untuk username
      if (error.code === 'P2002' && error.meta?.target?.includes('id')) {
        return res.status(400).send('ID sudah digunakan.');
      }
  
      // Tangani kesalahan yang tidak dikenali
      console.error('Kesalahan saat membuat pengguna:', error);
      res.status(500).send('Kesalahan server internal.');
    }
  })
  
  
  app.get('/:username', async (req: Request, res: Response) => {
    const { username } = req.params;
  
    try {
      const user = await prisma.user.findUnique({
        where: { username: String(username) }
      });
  
      // Jika pengguna tidak ditemukan
      if (!user) {
        return res.status(404).send('Pengguna tidak ditemukan.');
      }
  
      res.json(user);
    } catch (error: any) {
      // Tangani kesalahan yang tidak dikenali
      console.error('Kesalahan saat mencari pengguna:', error);
      res.status(500).send('Kesalahan server internal.');
    }
  })
  

// handle 404 error
app.use((req: Request, res: Response, next: Function) => {
  next(createError(404))
})

app.listen(3000, () =>
  console.log(`⚡️[server]: Server is running at https://localhost:3000`)
)

