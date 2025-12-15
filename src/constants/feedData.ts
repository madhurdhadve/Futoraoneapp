export const DEMO_CONTENT = [
    "Just deployed my first microservice architecture! 🚀 Learning so much about Docker and Kubernetes.",
    "Anyone else excited about the new React 19 features? The compiler optimization is game-changing!",
    "Spent the whole day debugging... turned out to be a missing semicolon. Classic programmer moment 😅",
    "Built a real-time chat app using WebSockets and Node.js. The feeling when it works perfectly is amazing!",
    "TypeScript is a lifesaver for large codebases. Can't imagine going back to vanilla JavaScript now.",
    "Just passed my AWS certification! Cloud computing is the future 🌥️",
    "Working on a machine learning project to predict stock prices. Data preprocessing is harder than expected!",
    "Finally understood how Redux works. State management makes so much more sense now.",
    "Best VS Code extensions? I swear by Prettier, ESLint, and GitLens. What are yours?",
    "Refactored 500 lines of code into 50. Clean code feels so good! 💯",
];

export const DEMO_IMAGES = [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=225&fit=crop',
];

// Generate demo posts once at module level (not on every render)
export const DEMO_POSTS = Array.from({ length: 10 }, (_, i) => ({
    id: `demo-post-${i + 1}`,
    content: DEMO_CONTENT[i],
    image_url: DEMO_IMAGES[i],
    video_url: null,
    user_id: `test-user-${i + 1}`,
    created_at: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
        username: `TechUser${i + 1}`,
        full_name: `Tech User ${i + 1}`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=Tech${i + 1}`,
        is_verified: false
    },
    likes: [],
    comments: [],
    saves: []
}));
