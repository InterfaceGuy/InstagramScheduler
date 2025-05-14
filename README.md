# DreamNode: Instagram Scheduler

An AI-assisted Instagram scheduling and publishing system that operates entirely through GitHub Pages and GitHub Actions.

## Features

- Upload images and create Instagram posts
- AI-enhanced captions using Google's Gemini API
- Drag-and-drop reordering of scheduled posts
- Automatic publishing to Instagram via GitHub Actions
- Static hosting on GitHub Pages
- Git-backed content management

## How It Works

DreamNode is a static web application that uses GitHub as its backend:

1. **Content Creation**: Upload images, write captions (or use AI to enhance them), and save posts
2. **Scheduling**: Drag and drop to reorder your post queue
3. **Publishing**: GitHub Actions automatically publishes posts to Instagram on Mondays and Thursdays at 9am Portugal time

All content is stored in your GitHub repository, giving you full version control and backup capabilities.

## Folder Structure

```
/
├── .github/
│   └── workflows/
│       └── instagram-publish.yml  # GitHub Action for scheduled posting
├── public/
│   └── images/                    # Stores optimized images for posts
│       └── YYYY-MM-DD-title.jpg   # Naming convention for images
├── posts/                         # Stores post metadata and captions
│   └── YYYY-MM-DD-title.md        # Markdown files with frontmatter
└── src/                           # Application source code
```

### Post File Format

Each post is represented by a Markdown file with frontmatter:

```markdown
---
title: "My Amazing Post"
image: "2023-05-10-my-amazing-post.jpg"
caption: "This is an amazing caption with #hashtags"
published: false
---

Optional extended content here (not used for Instagram posts)
```

## Setup Instructions

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/yourusername/dreamnode-instagram-scheduler.git
cd dreamnode-instagram-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Gemini API

1. Visit [Google AI Studio](https://ai.google.dev/) to get a free Gemini API key
2. In the DreamNode app, click the settings icon and enter your API key

### 4. Set Up Instagram Token

1. Generate an Instagram Graph API token with `instagram_content_publish` permission
2. Add it as a repository secret in GitHub:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Create a new repository secret named `INSTAGRAM_TOKEN`

### 5. Deploy to GitHub Pages

1. Update the `site` and `base` properties in `astro.config.mjs` with your GitHub username and repository name
2. Push your changes to GitHub
3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Set the source to "GitHub Actions"

## Usage

### Creating a Post

1. Navigate to the "Upload & Compose" page
2. Upload an image (it will be automatically optimized)
3. Write a caption or use the "Enhance with AI" button
4. Click "Save Post" to add it to your queue

### Managing the Queue

1. Go to the "Backlog" page
2. Drag and drop posts to reorder them
3. The post at the top of the list will be published next

### Viewing Post History

1. Navigate to the "Post History" page
2. Filter between all, published, and scheduled posts
3. View details of each post

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT
