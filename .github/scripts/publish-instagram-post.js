const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Instagram Graph API endpoint
const INSTAGRAM_API_URL = 'https://graph.facebook.com/v18.0';
const INSTAGRAM_TOKEN = process.env.INSTAGRAM_TOKEN;

if (!INSTAGRAM_TOKEN) {
  console.error('Error: INSTAGRAM_TOKEN environment variable is not set');
  process.exit(1);
}

async function findNextUnpublishedPost() {
  const postsDir = path.join(process.cwd(), 'posts');
  
  try {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    // Sort files by date in filename (YYYY-MM-DD-*)
    files.sort((a, b) => {
      const dateA = a.substring(0, 10);
      const dateB = b.substring(0, 10);
      return dateA.localeCompare(dateB);
    });
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const content = await readFileAsync(filePath, 'utf8');
      
      // Simple frontmatter parsing
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const publishedMatch = frontmatter.match(/published:\s*(false|true)/i);
        
        if (publishedMatch && publishedMatch[1].toLowerCase() === 'false') {
          // Extract other metadata
          const titleMatch = frontmatter.match(/title:\s*"([^"]*)"/);
          const imageMatch = frontmatter.match(/image:\s*"([^"]*)"/);
          const captionMatch = frontmatter.match(/caption:\s*"([^"]*)"/);
          
          if (titleMatch && imageMatch && captionMatch) {
            return {
              file: filePath,
              title: titleMatch[1],
              image: imageMatch[1],
              caption: captionMatch[1]
            };
          }
        }
      }
    }
    
    console.log('No unpublished posts found');
    return null;
  } catch (error) {
    console.error('Error finding next unpublished post:', error);
    return null;
  }
}

async function uploadImageToInstagram(imagePath) {
  const imageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPOSITORY}/main/public/images/${imagePath}`;
  
  // Step 1: Create a container
  const containerData = await makeApiRequest('POST', `${INSTAGRAM_API_URL}/me/media`, {
    image_url: imageUrl,
    caption: post.caption,
    access_token: INSTAGRAM_TOKEN
  });
  
  if (!containerData || !containerData.id) {
    throw new Error('Failed to create media container');
  }
  
  // Step 2: Publish the container
  const publishData = await makeApiRequest('POST', `${INSTAGRAM_API_URL}/me/media_publish`, {
    creation_id: containerData.id,
    access_token: INSTAGRAM_TOKEN
  });
  
  if (!publishData || !publishData.id) {
    throw new Error('Failed to publish media');
  }
  
  return publishData.id;
}

function makeApiRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(data).toString();
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };
    
    const req = https.request(
      method === 'GET' ? `${url}?${params}` : url,
      options,
      (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              console.error('API Error:', parsedData);
              reject(new Error(`API request failed with status ${res.statusCode}: ${JSON.stringify(parsedData)}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (method !== 'GET') {
      req.write(params);
    }
    
    req.end();
  });
}

async function markPostAsPublished(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    
    // Update the published status
    content = content.replace(
      /published:\s*false/i,
      `published: true\npublishedAt: "${new Date().toISOString()}"`
    );
    
    await writeFileAsync(filePath, content, 'utf8');
    console.log(`Post marked as published: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error marking post as published:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('Starting Instagram post publishing process...');
    
    const post = await findNextUnpublishedPost();
    if (!post) {
      console.log('No posts to publish. Exiting.');
      return;
    }
    
    console.log(`Found post to publish: ${post.title}`);
    
    // Upload to Instagram
    console.log('Uploading to Instagram...');
    const postId = await uploadImageToInstagram(post.image);
    console.log(`Successfully published to Instagram with ID: ${postId}`);
    
    // Mark as published
    await markPostAsPublished(post.file);
    
    console.log('Process completed successfully!');
  } catch (error) {
    console.error('Error in publishing process:', error);
    process.exit(1);
  }
}

main();
