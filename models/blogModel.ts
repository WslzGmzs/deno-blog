// models/blogModel.ts
import { ulid } from \"https://deno.land/x/ulid@v0.3.0/mod.ts\";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// 使用 Deno KV 存储
const kv = await Deno.openKv();

// 辅助函数 - 生成列表前缀用于遍历
const POSTS_PREFIX = [\"posts\"];
const postKey = (id: string) => [...POSTS_PREFIX, id];

// 读取所有文章
export const getPosts = async (): Promise<BlogPost[]> => {
  const posts: BlogPost[] = [];
  const iterator = kv.list({ prefix: POSTS_PREFIX });
  
  for await (const entry of iterator) {
    posts.push(entry.value as BlogPost);
  }
  
  return posts;
};

// 通过ID读取文章
export const getPostById = async (id: string): Promise<BlogPost | null> => {
  const result = await kv.get(postKey(id));
  return result.value as BlogPost || null;
};

// 创建文章
export const createPost = async (postData: Omit<BlogPost, \"id\" | \"createdAt\" | \"updatedAt\">): Promise<BlogPost> => {
  const id = ulid(); // 生成唯一ID
  
  const newPost: BlogPost = {
    id,
    ...postData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await kv.set(postKey(id), newPost);
  return newPost;
};

// 更新文章
export const updatePost = async (
  id: string, 
  postData: Partial<Omit<BlogPost, \"id\" | \"createdAt\" | \"updatedAt\">>
): Promise<BlogPost | null> => {
  const existingPost = await getPostById(id);
  
  if (!existingPost) return null;
  
  const updatedPost: BlogPost = {
    ...existingPost,
    ...postData,
    updatedAt: new Date(),
  };
  
  await kv.set(postKey(id), updatedPost);
  
  return updatedPost;
};

// 删除文章
export const deletePost = async (id: string): Promise<boolean> => {
  const existingPost = await getPostById(id);
  
  if (!existingPost) return false;
  
  await kv.delete(postKey(id));
  
  return true;
};
