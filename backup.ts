import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'
import fs from 'fs'
import path from 'path'

async function run() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  const posts = await payload.find({ collection: 'posts', depth: 0 })
  const authors = await payload.find({ collection: 'authors', depth: 0 })
  const users = await payload.find({ collection: 'users', depth: 0 })
  const media = await payload.find({ collection: 'media', depth: 0 })

  const backupData = {
    posts: posts.docs,
    authors: authors.docs,
    users: users.docs,
    media: media.docs,
  }

  const backupPath = path.join(process.cwd(), `db_backup_${Date.now()}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))
  
  console.log(`Backup successfully created at ${backupPath}`)
  process.exit(0)
}
run().catch(console.error)
