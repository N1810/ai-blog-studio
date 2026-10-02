import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const posts = await payload.find({ collection: 'posts' })
  const authors = await payload.find({ collection: 'authors' })
  
  console.log('--- POSTS ---')
  console.log(JSON.stringify(posts.docs.map((d: any) => ({ id: d.id, title: d.title, author: d.author })), null, 2))
  
  console.log('--- AUTHORS ---')
  console.log(JSON.stringify(authors.docs, null, 2))
  
  process.exit(0)
}
run().catch(console.error)
