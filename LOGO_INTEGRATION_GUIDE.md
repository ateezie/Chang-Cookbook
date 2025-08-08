# 🎨 Chang Cookbook Logo Integration Guide

## 📁 Where to Place Your Logo Files

Place your logo files in this exact directory:
```
E:\Projects\chang-cookbook\public\images\logo\
```

## 🏷️ Required File Names

**For automatic integration, name your files exactly as follows:**

### Primary Logo Files
1. **`chang-logo.svg`** - Vector format (PREFERRED)
   - Scalable to any size without quality loss
   - Best for web use
   - Supports transparency
   - Recommended dimensions: Designed for 48x48px but scalable

2. **`chang-logo.png`** - High resolution fallback  
   - **512x512 pixels** 
   - PNG format with transparency
   - Used when SVG fails to load

3. **`chang-logo-small.png`** - Optimized small version
   - **96x96 pixels**
   - For footer and small contexts
   - Optimized file size

4. **`chang-logo-favicon.png`** - Browser icon
   - **32x32 pixels** 
   - For browser tab/favicon
   - Square format works best

## 📐 Logo Design Specifications

### Size Requirements by Context
- **Header (Desktop)**: 48px × 48px
- **Header (Mobile)**: 40px × 40px  
- **Footer**: 32px × 32px
- **Favicon**: 32px × 32px, 16px × 16px
- **Social Media**: 400px × 400px

### Design Guidelines
✅ **DO:**
- Use circular or square aspect ratio (1:1)
- Ensure logo works on both light and dark backgrounds
- Keep design simple and recognizable at small sizes
- Use Chang brand colors (#ff9966, #4a3429)
- Include transparency for PNG files
- Test at 16px size to ensure readability

❌ **DON'T:**
- Use rectangular logos (they may appear distorted)
- Include text in the logo (text is handled separately)
- Use very detailed designs that don't scale well
- Forget transparency backgrounds

## 🔧 Technical Details

### File Format Priority
The system will automatically try to load your logo in this order:
1. **SVG** - `chang-logo.svg` (preferred)
2. **PNG** - `chang-logo.png` (fallback)
3. **Small PNG** - `chang-logo-small.png` (for small sizes)
4. **Placeholder** - Animated chef emoji (if none found)

### Automatic Integration Points
Your logo will automatically appear in:
- **Header navigation** (48px desktop, 40px mobile)
- **Footer branding** (32px)
- **Browser favicon** (32px, 16px)
- **Social media sharing** (400px)
- **Apple touch icons** (180px)

## 🚀 How to Add Your Logo

### Step 1: Prepare Your Files
1. Create your logo in the recommended sizes above
2. Save in PNG format with transparent backgrounds
3. If possible, also create an SVG version
4. Name files exactly as specified above

### Step 2: Upload Files
1. Copy your logo files to: `E:\Projects\chang-cookbook\public\images\logo\`
2. Ensure file names match exactly (case-sensitive)
3. The system will automatically detect and use your files

### Step 3: Test Integration
1. Restart the development server: `npm run dev`
2. Visit `http://localhost:3000` 
3. Check that your logo appears in:
   - Header navigation
   - Footer
   - Browser tab (favicon)

### Step 4: Verify Fallbacks
- Temporarily rename your logo files to test fallback behavior
- Ensure the placeholder appears when logos are missing
- Restore original file names when testing is complete

## 🎭 Logo Variations (Optional)

For advanced branding, you can also add:
- **`chang-logo-dark.svg`** - Dark theme version
- **`chang-logo-light.svg`** - Light theme version  
- **`chang-logo-monochrome.svg`** - Single color version

## 🔍 Testing Checklist

- [ ] Logo appears in header navigation
- [ ] Logo displays correctly in footer
- [ ] Favicon shows in browser tab
- [ ] Logo scales properly on mobile devices
- [ ] Logo has transparent background
- [ ] Logo maintains quality at all sizes
- [ ] Fallback works when files are missing
- [ ] Logo works on both light/dark backgrounds

## 🐛 Troubleshooting

**Logo not appearing?**
- Check file names are exactly correct (case-sensitive)
- Verify files are in the right directory
- Restart development server (`npm run dev`)
- Check browser console for errors

**Logo looks blurry?**
- Use higher resolution PNG files
- Try SVG format for crisp scaling
- Ensure design isn't too detailed for small sizes

**Wrong size/positioning?**
- Logo component automatically handles sizing
- Check that aspect ratio is 1:1 (square/circular)
- Verify image dimensions match recommendations

## 📞 Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify file paths and names are correct
3. Test with a simple square PNG first
4. Restart the development server after adding files

Your Chang Cookbook logo will bring the brand to life! 🍳✨