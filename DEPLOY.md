# Legacy Game Studios - Deployment Guide

## 🚀 GitHub Pages Setup

Your website is ready to be deployed to GitHub Pages! Follow these steps:

### Step 1: Enable GitHub Pages

1. Go to your repository settings: https://github.com/CaptainLWS/LGS_legacy-Game-Studio/settings
2. Scroll down to **Pages** section
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 2: Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys your site when you push to the main branch.

### Step 3: Access Your Site

Your site will be available at:
```
https://CaptainLWS.github.io/LGS_legacy-Game-Studio/
```

## 📝 Custom Domain Setup (Optional)

To use a custom domain like `legacygamestudios.com`:

1. Create a `CNAME` file in the repository root with your domain
2. Configure your domain's DNS settings to point to GitHub Pages
3. Add the domain to your repository settings

## 🔧 Making Changes

1. Edit `index.html` to update content
2. Edit `styles.css` to modify styling
3. Edit `script.js` to add functionality
4. Push to main branch
5. Your site automatically updates!

## 📦 Update Logo

The logo is located at `assets/logo.svg`. To use a custom logo:

1. Replace `assets/logo.svg` with your logo file
2. Update the image path in `index.html` if needed

## 🌐 Social Media Links

Update these social media links in `index.html`:
- Twitter: `https://twitter.com/LGS_Games`
- Discord: `https://discord.gg/legacygamestudios`
- YouTube: `https://youtube.com/@legacygamestudios`
- Instagram: `https://instagram.com/legacygamestudios`

## ✉️ Contact Email

The contact form uses: `legacygamestudios@outlook.com`

To set up a real contact form, consider using services like:
- Formspree
- Netlify Forms
- EmailJS

## 📱 Mobile Responsive

Your site is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (480px - 767px)

## ✨ Features

✅ Professional hero section
✅ Game showcase grid
✅ Digital productions section
✅ About section with stats
✅ Contact form
✅ Social media links
✅ Smooth animations
✅ Mobile responsive
✅ Dark theme with gold accents
✅ Accessibility features

## 🎯 Next Steps

1. Verify the site is live at your GitHub Pages URL
2. Test on mobile devices
3. Update social media handles
4. Add real contact form backend
5. Add game download links
6. Set up email notifications

## 📞 Support

For GitHub Pages help, visit: https://docs.github.com/en/pages

---

**Happy Building! 🚀**
