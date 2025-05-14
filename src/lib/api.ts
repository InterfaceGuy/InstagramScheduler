import { GoogleGenerativeAI } from '@google/generative-ai';
import { format } from 'date-fns';

// Local storage keys
const API_KEY_STORAGE = 'dreamnode_gemini_api_key';

export function getGeminiApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setGeminiApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE, apiKey);
}

export async function enhanceCaption(
  imageFile: File,
  draftCaption: string = ''
): Promise<{ caption: string; suggestedTitle: string }> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set it in the settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Convert image to base64
    const imageData = await fileToGenerativePart(imageFile);

    // Prepare prompt
    const prompt = draftCaption 
      ? `Enhance this Instagram caption: "${draftCaption}". Make it engaging, add relevant hashtags, and keep it under 2000 characters.`
      : 'Create an engaging Instagram caption for this image. Include relevant hashtags and keep it under 2000 characters.';

    // Generate content
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // Also generate a title suggestion for the filename
    const titleModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const titlePrompt = `Based on this Instagram caption: "${text}", suggest a short, descriptive title (3-5 words) in kebab-case format (lowercase words separated by hyphens) that would work well as part of a filename. Return ONLY the kebab-case title, nothing else.`;
    
    const titleResult = await titleModel.generateContent(titlePrompt);
    const titleResponse = await titleResult.response;
    const suggestedTitle = titleResponse.text().trim();

    return {
      caption: text,
      suggestedTitle: suggestedTitle.replace(/[^a-z0-9-]/g, '')
    };
  } catch (error) {
    console.error('Error enhancing caption:', error);
    throw new Error('Failed to enhance caption. Please try again.');
  }
}

// Helper function to convert a file to the format needed for Gemini
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  
  const base64EncodedData = await base64EncodedDataPromise;
  const base64Data = base64EncodedData.split(',')[1];
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
}

// Function to generate a filename based on date and title
export function generateFilename(title: string): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${date}-${sanitizedTitle}`;
}

// Function to optimize an image before saving
export async function optimizeImage(file: File, maxWidth = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        },
        'image/jpeg',
        0.85 // Quality parameter (0.85 is a good balance)
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Mock functions for GitHub integration (to be replaced with actual GitHub API calls)
export async function savePost(post: {
  title: string;
  image: File;
  caption: string;
}): Promise<string> {
  // In a real implementation, this would:
  // 1. Optimize the image
  // 2. Generate a filename
  // 3. Commit both the image and markdown file to GitHub
  
  // For now, we'll just simulate success and store in localStorage
  const filename = generateFilename(post.title);
  const imageFilename = `${filename}.jpg`;
  const markdownFilename = `${filename}.md`;
  
  // Store in localStorage for demo purposes
  const posts = JSON.parse(localStorage.getItem('dreamnode_posts') || '[]');
  posts.push({
    id: filename,
    title: post.title,
    image: imageFilename,
    caption: post.caption,
    published: false,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('dreamnode_posts', JSON.stringify(posts));
  
  return filename;
}

// Function to get all posts
export function getPosts(): any[] {
  return JSON.parse(localStorage.getItem('dreamnode_posts') || '[]');
}

// Function to update post order
export function updatePostOrder(posts: any[]): void {
  localStorage.setItem('dreamnode_posts', JSON.stringify(posts));
}

// Function to mark a post as published
export function markPostAsPublished(postId: string): void {
  const posts = JSON.parse(localStorage.getItem('dreamnode_posts') || '[]');
  const updatedPosts = posts.map((post: any) => {
    if (post.id === postId) {
      return {
        ...post,
        published: true,
        publishedAt: new Date().toISOString()
      };
    }
    return post;
  });
  
  localStorage.setItem('dreamnode_posts', JSON.stringify(updatedPosts));
}
